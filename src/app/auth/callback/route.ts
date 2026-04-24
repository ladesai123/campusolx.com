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

  // ✅ User is SASTRA → Automate Profile Setup (Zero-Onboarding)
  const regNoMatch = userEmail.match(/^(\d+)/);
  const regNo = regNoMatch ? regNoMatch[1] : null;

  // Derive University from reg_no first digit
  let university = "SASTRA University, Thanjavur";
  if (regNo) {
    const firstDigit = regNo.charAt(0);
    if (firstDigit === "1") university = "SASTRA University, Thanjavur";
    else if (firstDigit === "2") university = "SASTRA University, Kumbakonam";
    else if (firstDigit === "3") university = "SASTRA University, Chennai";
  }

  // Silent Upsert: Create or update profile automatically
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    name: user.user_metadata?.full_name || userEmail.split("@")[0],
    university: university,
    profile_picture_url: user.user_metadata?.avatar_url || "",
    email: userEmail,
    acquisition_source: "google",
    // We can add reg_no here if we add the column to DB later
  });

  if (profileError) {
    console.error("Profile upsert error:", profileError.message);
    // Even if profile fails, we might want to try redirecting to home 
    // or a lightweight error page. For now, let's go to home.
  }

  // 🎉 Magic Success → go straight to home with zero clicks
  return NextResponse.redirect(`${requestUrl.origin}/home`);
}
