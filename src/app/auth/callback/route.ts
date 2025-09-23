import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Auth Callback Route
 * -------------------
 * - Handles Google OAuth redirect
 * - Exchanges the "code" for a Supabase session
 * - Stores session cookies
 * - Restricts access to @sastra.ac.in emails
 * - Redirects user to onboarding/home OR login with error
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    // 🚨 No code → go back to login
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Authentication flow was interrupted.`
    )
  }

  // ✅ Correct async cookie store
  const cookieStore = await cookies()

  // ✅ Supabase client with cookie persistence
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
            cookieStore.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // 🔄 Exchange the code for a session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    console.error('Session exchange error:', exchangeError.message)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication failed`)
  }

  // 👤 Get the logged-in user
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser()

  if (getUserError || !user) {
    console.error('Get user error after login:', getUserError?.message)
    await supabase.auth.signOut()
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not verify user`)
  }

  // 🎓 Restrict access to SASTRA emails
  const userEmail = user.email?.trim().toLowerCase()
  if (!userEmail?.endsWith('@sastra.ac.in')) {
    // ❌ Delete unauthorized user
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    await supabaseAdmin.auth.admin.deleteUser(user.id)
    await supabase.auth.signOut()

    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Invalid email domain. Please use your SASTRA email.`
    )
  }

  // ✅ User is SASTRA → check onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, university')
    .eq('id', user.id)
    .single()

  if (!profile?.name || !profile?.university) {
    return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
  }

  // 🎉 Success → go to home
  return NextResponse.redirect(`${requestUrl.origin}/home`)
}
