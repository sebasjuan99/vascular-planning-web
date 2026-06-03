import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // No session → login (preserve the originally requested path so we
  // can return the user there after they authenticate)
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    const originalPath = request.nextUrl.pathname + request.nextUrl.search
    // Only attach the redirect for dashboard routes (admin routes need
    // an admin user, so post-login redirect is handled by login page logic)
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      loginUrl.searchParams.set('redirect', originalPath)
    }
    return NextResponse.redirect(loginUrl)
  }

  // Not approved → pending
  const approved = user.user_metadata?.approved === true
  if (!approved) {
    return NextResponse.redirect(new URL('/pendiente', request.url))
  }

  // Admin routes require admin role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
