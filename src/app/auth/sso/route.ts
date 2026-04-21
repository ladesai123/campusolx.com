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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  // ─────────────────────────────────────────────────────────────
  // STEP 1 — Read the token from URL params
  // ─────────────────────────────────────────────────────────────
  const token = requestUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('SSO link is missing. Please tap the Campus Olex button again in Unify.')}`
    )
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 2 — Verify JWT signature + expiry + required fields
  // ─────────────────────────────────────────────────────────────
  const secret = process.env.UNIFY_SSO_SECRET
  if (!secret) {
    console.error('[SSO] UNIFY_SSO_SECRET is not configured')
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('SSO is not configured. Please contact support.')}`
    )
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please tap the Campus Olex button again in Unify.')}`
    )
  }

  const [headerB64, payloadB64, sigB64] = parts

  // Recompute expected signature using HMAC-SHA256
  const expectedSig = createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url')

  // Timing-safe comparison — prevents timing-based signature forgery
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
      `${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please tap the Campus Olex button again in Unify.')}`
    )
  }

  // Decode and parse JWT payload
  let payload: SSOPayload
  try {
    payload = JSON.parse(base64urlDecode(payloadB64)) as SSOPayload
  } catch {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please tap the Campus Olex button again in Unify.')}`
    )
  }

  // Check expiry — transit token only (actual session = 30 days)
  const now = Math.floor(Date.now() / 1000)
  if (!payload.exp || payload.exp < now) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('This link has expired. Please tap the Campus Olex button again in Unify.')}`
    )
  }

  // Require: (reg_no OR email) + name + jti
  if ((!payload.reg_no && !payload.email) || !payload.name || !payload.jti) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Invalid SSO link. Please tap the Campus Olex button again in Unify.')}`
    )
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 3 — Build admin Supabase client (bypasses RLS)
  // ─────────────────────────────────────────────────────────────
  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // ─────────────────────────────────────────────────────────────
  // STEP 4 — Replay attack prevention via jti
  // ─────────────────────────────────────────────────────────────
  const { data: existingJti } = await adminClient
    .from('sso_used_tokens')
    .select('jti')
    .eq('jti', payload.jti)
    .maybeSingle()

  if (existingJti) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('This link was already used. Please tap the Campus Olex button again in Unify.')}`
    )
  }

  // Record jti immediately — before any other work
  const { error: jtiInsertError } = await adminClient
    .from('sso_used_tokens')
    .insert({ jti: payload.jti })

  if (jtiInsertError) {
    console.error('[SSO] Failed to record jti:', jtiInsertError.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('SSO error. Please try again.')}`
    )
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 5 — Find or create user
  // ─────────────────────────────────────────────────────────────

  // Derive canonical email: prefer explicit email, else build from reg_no
  // e.g.  reg_no = "126156075"  →  email = "126156075@sastra.ac.in"
  const normalizedEmail = payload.email
    ? payload.email.trim().toLowerCase()
    : `${payload.reg_no.trim()}@sastra.ac.in`

  // Strategy: attempt createUser as a probe.
  //   ✅ Success          → brand new user, insert their profile
  //   ✅ "already exists" → existing user, skip directly to generateLink
  //   ❌ other error      → abort
  //
  // This avoids listUsers pagination (max 1000/page) and the GoTrue REST
  // email-filter which is unreliable across Supabase project versions.

  let newUserId: string | undefined  // only set for new users (profile insert + rollback)

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,   // Skip confirmation email — Unify already verified them
    user_metadata: {
      full_name: payload.name,
      avatar_url: null,    // CampusOlx shows initials as fallback avatar
      provider: 'unify_sso',
    },
  })

  if (created?.user) {
    // ── NEW USER ───────────────────────────────────────────────────────────
    newUserId = created.user.id
    console.log('[SSO] New user created:', newUserId)

    // Insert profile — university full name, initials avatar shown by CampusOlx
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: newUserId,
        name: payload.name,
        university: 'SASTRA University, Thanjavur',
        profile_picture_url: null,
        email: normalizedEmail,  // e.g. "126156200@sastra.ac.in" derived from reg_no
      })

    if (profileError) {
      console.error('[SSO] Profile insert failed:', profileError.message)
      // Rollback: remove orphaned auth user
      await adminClient.auth.admin.deleteUser(newUserId)
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('Could not set up your profile. Please try again.')}`
      )
    }

    console.log('[SSO] Profile created for new user:', newUserId)

  } else if (
    createError?.message?.toLowerCase().includes('already') ||
    createError?.message?.toLowerCase().includes('registered') ||
    createError?.message?.toLowerCase().includes('exists')
  ) {
    // ── EXISTING USER — proceed directly to generateLink ──────────────────
    // We don't need the userId for anything here; generateLink only needs email.
    console.log('[SSO] Existing user detected for:', normalizedEmail)

  } else {
    // Unexpected createUser error
    console.error('[SSO] createUser failed:', createError?.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Could not create your account. Please contact support.')}`
    )
  }

  // ─────────────────────────────────────────────────────────────
  // STEP 6 — Generate magic link token (server-side only)
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // STEP 7 — Exchange the magic link for a session (sets cookies)
  // ─────────────────────────────────────────────────────────────
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
              // 30-day session — Unify JWT is 10 min for transit only
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

  // ─────────────────────────────────────────────────────────────
  // STEP 8 — Redirect to /home — user is fully logged in 🎉
  // ─────────────────────────────────────────────────────────────
  console.log('[SSO] Session established for:', newUserId ?? normalizedEmail)
  return NextResponse.redirect(new URL('/home', origin))
}
