import { NextResponse } from 'next/server'
import { createHmac, randomUUID } from 'crypto'

/**
 * POST /api/sso-test-token
 *
 * Developer-only API. Generates a valid Unify-style JWT signed with
 * UNIFY_SSO_SECRET. Accepts reg_no and derives email server-side.
 * Keeps the secret server-side — never exposed to the browser.
 */
export async function POST(request: Request) {
  const secret = process.env.UNIFY_SSO_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'UNIFY_SSO_SECRET is not set in environment variables.' },
      { status: 500 }
    )
  }

  const body = await request.json()
  const { regNo, name } = body

  if (!regNo || !name) {
    return NextResponse.json({ error: 'regNo and name are required' }, { status: 400 })
  }

  const now = Math.floor(Date.now() / 1000)

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')

  const payloadObj = {
    reg_no: regNo.trim(),                           // Primary identifier
    // email is NOT included — CampusOlx derives it as reg_no@sastra.ac.in
    name: name.trim(),
    // photo is NOT included — CampusOlx shows initials as fallback
    jti: randomUUID(),    // Fresh UUID every single request — replay prevention
    iat: now,
    exp: now + 600,       // 10 minutes — transit security only
  }

  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url')
  const sig = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url')
  const token = `${header}.${payload}.${sig}`

  // Also show the derived email so the tester knows what account will be used
  const derivedEmail = `${regNo.trim()}@sastra.ac.in`

  return NextResponse.json({ token, payload: payloadObj, derivedEmail })
}
