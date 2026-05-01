import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Unify × CampusOlx SSO Handler
 * --------------------------------
 * GET /auth/sso?token=<JWT>
 *
 * Unify sends a signed JWT (HS256) with the student's reg_no + name.
 * We verify it, derive the email (reg_no@sastra.ac.in), find/create the
 * user in Supabase, establish a 30-day session, and redirect to /home.
 *
 * DO NOT add @sastra.ac.in domain check here — Unify already verified
 * the student. We fully trust any token that passes signature verification.
 */

interface SSOPayload {
  reg_no: string        // e.g. "126156075" → email = 126156075@sastra.ac.in
  email?: string        // Optional — if absent, derived from reg_no
  name: string          // Student's full name
  photo?: string | null // Ignored — CampusOlx shows initials as fallback avatar
  jti: string           // Unique UUID per request — prevents replay attacks
  iat: number           // Issued at (unix timestamp)
  exp: number           // Expiry = iat + 600 (10 min transit security only)
}

/** Decode base64url → UTF-8 string */
function base64urlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  return Buffer.from(padded, 'base64').toString('utf8')
}

function redirectError(origin: string, message: string) {
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(message)}`
  )
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
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('SSO link is missing. Please tap the Campus Olex button again in Unify.')}`)
    }

    const secret = process.env.UNIFY_SSO_SECRET
    if (!secret) {
      console.error('[SSO] UNIFY_SSO_SECRET is not configured')
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('SSO is not configured. Please contact support.')}`)
    }

    // ─────────────────────────────────────────────────────────────
    // STAGE 2 — JWT Verification
    // ─────────────────────────────────────────────────────────────
    const parts = token.split('.')
    if (parts.length !== 3) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please tap the Campus Olex button again in Unify.')}`)
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
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please tap the Campus Olex button again in Unify.')}`)
    }

    let payload: SSOPayload
    try {
      payload = JSON.parse(base64urlDecode(payloadB64)) as SSOPayload
    } catch {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please tap the Campus Olex button again in Unify.')}`)
    }

    const now = Math.floor(Date.now() / 1000)
    if (!payload.exp || payload.exp < now) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('This link has expired. Please tap the Campus Olex button again in Unify.')}`)
    }

    if ((!payload.reg_no && !payload.email) || !payload.name || !payload.jti) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please tap the Campus Olex button again in Unify.')}`)
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
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('This link was already used. Please tap the Campus Olex button again in Unify.')}`)
    }
    await adminClient.from('sso_used_tokens').insert({ jti: payload.jti })

    // Derive identity
    const normalizedEmail = payload.email
      ? payload.email.trim().toLowerCase()
      : `${payload.reg_no.trim().toLowerCase()}@sastra.ac.in`

    const firstDigit = payload.reg_no?.charAt(0) || '';
    let university = 'SASTRA University, Thanjavur';
    if (firstDigit === '2') university = 'SASTRA University, Kumbakonam';
    else if (firstDigit === '3') university = 'SASTRA University, Chennai';

    let targetUserId: string

    // Probe for user (Scalable method)
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
      user_metadata: { full_name: payload.name, avatar_url: null, provider: 'unify_sso' },
    })

    if (created?.user) {
      targetUserId = created.user.id
      console.log('[SSO] New user created:', targetUserId)
      
      const { error: profileError } = await adminClient.from('profiles').insert({
        id: targetUserId,
        name: payload.name,
        email: normalizedEmail,
        university,
        profile_picture_url: null,
        created_at: created.user.created_at,
        acquisition_source: 'unify',
      })

      if (profileError) {
        console.error('[SSO] Profile insert failed:', profileError.message)
        await adminClient.auth.admin.deleteUser(targetUserId)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Could not set up your profile. Please try again.')}`)
      }
    } else if (createError?.message?.toLowerCase().includes('already') || createError?.message?.toLowerCase().includes('exists')) {
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
    // STAGE 5 — Session Creation
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


