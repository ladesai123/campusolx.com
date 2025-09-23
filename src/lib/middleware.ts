import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware
 * ----------
 * - Keeps Supabase session cookies fresh
 * - Runs on all routes (except static assets)
 * - Skips interfering with /auth/callback and /login to prevent redirect loops
 */
export async function middleware(request: NextRequest) {
  // 🚫 Skip auth middleware for login & callback
  if (request.nextUrl.pathname.startsWith('/auth/callback') || request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // Prepare response
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Create Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // update both request + response
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // Refresh the session silently
  await supabase.auth.getUser()

  return response
}

export const config = {
  // Match all routes except static files & API (if you want to exclude API, add it here)
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
