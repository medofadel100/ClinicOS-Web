import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en'
})

export async function middleware(request: NextRequest) {
  // 1. Run next-intl to get the base response with locale headers
  const response = intlMiddleware(request)

  // 2. Setup Supabase SSR client to refresh session if needed
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.includes('/login') || pathname.includes('/register')

  // 3. Protect routes based on session
  if (!session && !isAuthRoute) {
    const segments = pathname.split('/')
    const locale = ['en', 'ar'].includes(segments[1]) ? segments[1] : 'en'
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = `/${locale}/login`
    const redirectResponse = NextResponse.redirect(loginUrl)
    // carry over cookies from next-intl/supabase
    response.cookies.getAll().forEach(c => redirectResponse.cookies.set(c))
    return redirectResponse
  }

  if (session && isAuthRoute) {
    const segments = pathname.split('/')
    const locale = ['en', 'ar'].includes(segments[1]) ? segments[1] : 'en'
    const switcherUrl = request.nextUrl.clone()
    switcherUrl.pathname = `/${locale}/clinic-switcher`
    const redirectResponse = NextResponse.redirect(switcherUrl)
    response.cookies.getAll().forEach(c => redirectResponse.cookies.set(c))
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    // Skip all internal paths (_next), api routes, and static public files
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workbox-.*|icons|manifest.json).*)'
  ]
}
