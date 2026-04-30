import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Sastranet × CampusOlx SSO Handler
 * --------------------------------
 * GET /auth/sastranet?token=<JWT>
 *
 * Sastranet sends a signed JWT (HS256) with the student's reg_no, name, email, profile_picture_url.
 * We verify it, derive the university from reg_no, find/create the
 * user in Supabase, establish a 30-day session, and redirect to /home.
 */

interface SastranetSSOPayload {
  reg_no: string
  email?: string
  name: string
  profile_picture_url?: string | null
  jti: string
  iat: number
  exp: number
}

function base64urlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  return Buffer.from(padded, 'base64').toString('utf8')
}

function deriveUniversity(regNo: string): string {
  const firstDigit = regNo.charAt(0)
  if (firstDigit === '2') return 'SASTRA University, Kumbakonam'
  if (firstDigit === '3') return 'SASTRA University, Chennai'
  return 'SASTRA University, Thanjavur'
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  try {
    // ─────────────────────────────────────────────────────────────
    // STAGE 1 — Initial Validation
    // ─────────────────────────────────────────────────────────────
    const token = requestUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('SSO link is missing. Please try again.')}`)
    }

    const secret = process.env.SASTRANET_SSO_SECRET
    if (!secret) {
      console.error('[SSO] SASTRANET_SSO_SECRET is not configured')
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('SSO is not configured. Please contact support.')}`)
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 2 — JWT Verification
    // ─────────────────────────────────────────────────────────────
    const parts = token.split('.')
    if (parts.length !== 3) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please try again.')}`)
    }

    const [headerB64, payloadB64, sigB64] = parts
    const expectedSig = createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url')

    let sigMatch = false
    try {
      const expectedBuf = Buffer.from(expectedSig)
      const receivedBuf = Buffer.from(sigB64)
      if (expectedBuf.length === receivedBuf.length) {
        sigMatch = timingSafeEqual(expectedBuf, receivedBuf)
      }
    } catch {
      sigMatch = false
    }

    if (!sigMatch) {
      console.warn('[SSO] Signature mismatch')
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please try again.')}`)
    }

    let payload: SastranetSSOPayload
    try {
      payload = JSON.parse(base64urlDecode(payloadB64)) as SastranetSSOPayload
    } catch {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please try again.')}`)
    }

    const now = Math.floor(Date.now() / 1000)
    if (!payload.exp || payload.exp < now) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('This link has expired. Please try again.')}`)
    }

    if (!payload.reg_no || !payload.name || !payload.jti) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please try again.')}`)
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 3 — Early Session Check (Resilience)
    // ─────────────────────────────────────────────────────────────
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options, maxAge: 30 * 24 * 60 * 60, path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
            })
          },
        },
      }
    )

    const { data: { user: activeUser } } = await supabase.auth.getUser()
    if (activeUser) {
      console.log('[SSO] User already has active session. Redirecting to /home.')
      return NextResponse.redirect(new URL('/home', origin))
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 4 — Admin Work (Lookup & Registration)
    // ─────────────────────────────────────────────────────────────
    const adminClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    // JTI Replay Protection
    const { data: existingJti } = await adminClient.from('sso_used_tokens').select('jti').eq('jti', payload.jti).maybeSingle()
    if (existingJti) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('This link was already used. Please try again.')}`)
    }
    await adminClient.from('sso_used_tokens').insert({ jti: payload.jti })

    // Derive identity (reg_no used ONLY for derivation)
    const normalizedEmail = payload.email
      ? payload.email.trim().toLowerCase()
      : `${payload.reg_no.trim().toLowerCase()}@sastra.ac.in`

    const university = deriveUniversity(payload.reg_no)

    let targetUserId: string

    // Probe for user (Scalable method)
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
      user_metadata: { full_name: payload.name, avatar_url: payload.profile_picture_url || null, provider: 'sastranet_sso' },
    })

    if (created?.user) {
      targetUserId = created.user.id
      console.log('[SSO] New user created:', targetUserId)
      
      const { error: profileError } = await adminClient.from('profiles').insert({
        id: targetUserId,
        name: payload.name,
        email: normalizedEmail,
        university,
        profile_picture_url: payload.profile_picture_url || null,
        acquisition_source: 'sastranet',
      })

      if (profileError) {
        console.error('[SSO] Profile insert failed:', profileError.message)
        await adminClient.auth.admin.deleteUser(targetUserId)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Could not set up your profile. Please try again.')}`)
      }
    } else if (createError?.message?.toLowerCase().includes('already') || createError?.message?.toLowerCase().includes('exists')) {
      // User exists — find them by email in the profiles table (Scalable)
      const { data: existingProfile, error: profileFetchError } = await adminClient
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle()
      
      if (profileFetchError || !existingProfile) {
        console.error('[SSO] User exists in Auth but no profile found or query failed:', profileFetchError?.message)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Account sync error. Please contact support.')}`)
      }
      targetUserId = existingProfile.id
      console.log('[SSO] Existing user identified via profile lookup:', targetUserId)
    } else {
      console.error('[SSO] createUser failed:', createError?.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Could not create your account. Please contact support.')}`)
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 5 — Session Creation (with Retry Resilience)
    // ─────────────────────────────────────────────────────────────
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
      options: { redirectTo: `${origin}/home` },
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('[SSO] generateLink failed:', linkError?.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Could not generate login token. Please try again.')}`)
    }

    let otpError;
    const MAX_RETRIES = 2;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: linkData.properties.hashed_token,
        type: 'magiclink',
      })
      if (!error) {
        console.log(`[SSO] Session established for: ${targetUserId} (Attempt ${attempt})`)
        return NextResponse.redirect(new URL('/home', origin))
      }
      otpError = error;
      console.warn(`[SSO] verifyOtp attempt ${attempt} failed:`, error.message)
      if (attempt < MAX_RETRIES) await new Promise(resolve => setTimeout(resolve, 800))
    }

    if (otpError) {
      console.error('[SSO] All verifyOtp attempts failed:', otpError.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Could not establish your session. Please try again.')}`)
    }

    return NextResponse.redirect(new URL('/home', origin))

  } catch (err: any) {
    console.error('[SSO] Unhandled global error:', err)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('An unexpected error occurred. Please try again.')}`)
  }
}


