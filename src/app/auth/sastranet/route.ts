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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  const token = requestUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('SSO link is missing. Please try again.')}`
    )
  }

  const secret = process.env.SASTRANET_SSO_SECRET
  if (!secret) {
    console.error('[SSO] SASTRANET_SSO_SECRET is not configured')
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('SSO is not configured. Please contact support.')}`
    )
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please try again.')}`
    )
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
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please try again.')}`
    )
  }

  let payload: SastranetSSOPayload
  try {
    payload = JSON.parse(base64urlDecode(payloadB64)) as SastranetSSOPayload
  } catch {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please try again.')}`
    )
  }

  const now = Math.floor(Date.now() / 1000)
  if (!payload.exp || payload.exp < now) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('This link has expired. Please try again.')}`
    )
  }

  if (!payload.reg_no || !payload.name || !payload.jti) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please try again.')}`
    )
  }

  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const { data: existingJti } = await adminClient
    .from('sso_used_tokens')
    .select('jti')
    .eq('jti', payload.jti)
    .maybeSingle()

  if (existingJti) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('This link was already used. Please try again.')}`
    )
  }

  const { error: jtiInsertError } = await adminClient
    .from('sso_used_tokens')
    .insert({ jti: payload.jti })

  if (jtiInsertError) {
    console.error('[SSO] Failed to record jti:', jtiInsertError.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('SSO error. Please try again.')}`
    )
  }

  const normalizedEmail = payload.email
    ? payload.email.trim().toLowerCase()
    : `${payload.reg_no.trim()}@sastra.ac.in`

  let newUserId: string | undefined

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
    user_metadata: {
      full_name: payload.name,
      avatar_url: payload.profile_picture_url || null,
      provider: 'sastranet_sso',
    },
  })

  if (created?.user) {
    newUserId = created.user.id
    console.log('[SSO] New user created:', newUserId)

    // Derive University from reg_no
    const firstDigit = payload.reg_no.charAt(0);
    let university = 'SASTRA University, Thanjavur';
    if (firstDigit === '1') university = 'SASTRA University, Thanjavur';
    else if (firstDigit === '2') university = 'SASTRA University, Kumbakonam';
    else if (firstDigit === '3') university = 'SASTRA University, Chennai';

    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: newUserId,
        name: payload.name,
        university,
        profile_picture_url: payload.profile_picture_url || null,
        email: normalizedEmail,
        acquisition_source: 'sastranet',
      })

    if (profileError) {
      console.error('[SSO] Profile insert failed:', profileError.message)
      await adminClient.auth.admin.deleteUser(newUserId)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('Could not set up your profile. Please try again.')}`
      )
    }
  } else if (
    createError?.message?.toLowerCase().includes('already') ||
    createError?.message?.toLowerCase().includes('registered') ||
    createError?.message?.toLowerCase().includes('exists')
  ) {
    console.log('[SSO] Existing user detected for:', normalizedEmail)

    // Ensure university is up-to-date even for existing users
    const firstDigit = payload.reg_no.charAt(0);
    let university = 'SASTRA University, Thanjavur';
    if (firstDigit === '1') university = 'SASTRA University, Thanjavur';
    else if (firstDigit === '2') university = 'SASTRA University, Kumbakonam';
    else if (firstDigit === '3') university = 'SASTRA University, Chennai';

    await adminClient
      .from('profiles')
      .update({ university })
      .eq('email', normalizedEmail);
  } else {
    console.error('[SSO] createUser failed:', createError?.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Could not create your account. Please contact support.')}`
    )
  }

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email: normalizedEmail,
    options: { redirectTo: `${origin}/home` },
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error('[SSO] generateLink failed:', linkError?.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Could not generate login token. Please try again.')}`
    )
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({
              name,
              value,
              ...options,
              maxAge: 30 * 24 * 60 * 60,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          })
        },
      },
    }
  )

  const { error: otpError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })

  if (otpError) {
    console.error('[SSO] verifyOtp failed:', otpError.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Could not establish your session. Please try again.')}`
    )
  }

  console.log('[SSO] Session established for:', newUserId ?? normalizedEmail)
  return NextResponse.redirect(new URL('/home', origin))
}
