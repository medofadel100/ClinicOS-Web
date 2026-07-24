import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en'
})

function isPublicPath(pathname: string): boolean {
  // Root locale pages: /en, /ar, /en/, /ar/
  if (/^\/(en|ar)\/?$/.test(pathname)) return true
  // Download page
  if (pathname.includes('/download')) return true
  return false
}

function isAuthPath(pathname: string): boolean {
  if (pathname.includes('/login')) return true
  if (pathname.includes('/register')) return true
  if (pathname.includes('/forgot-password')) return true
  if (pathname.includes('/reset-password')) return true
  return false
}

function getLocale(pathname: string): string {
  const segments = pathname.split('/')
  return ['en', 'ar'].includes(segments[1]) ? segments[1] : 'en'
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Setup Supabase SSR client
  let session: any = null
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
        },
      },
    }
  )

  const { data: { session: sess } } = await supabase.auth.getSession()
  session = sess

  // PUBLIC PAGES: allow without session, skip intlMiddleware
  if (isPublicPath(pathname)) {
    // Still run intl for locale detection, but allow through regardless of session
    const response = intlMiddleware(request)
    // Carry Supabase cookies
    const { data: { session: recheck } } = await supabase.auth.getSession()
    return response
  }

  // AUTH PAGES: if already logged in, redirect to clinic-switcher
  if (isAuthPath(pathname) && session) {
    const locale = getLocale(pathname)
    const switcherUrl = request.nextUrl.clone()
    switcherUrl.pathname = `/${locale}/clinic-switcher`
    return NextResponse.redirect(switcherUrl)
  }

  // PROTECTED PAGES: require session
  if (!session && !isAuthPath(pathname)) {
    const locale = getLocale(pathname)
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = `/${locale}/login`
    return NextResponse.redirect(loginUrl)
  }

  // Everything else: run intl middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|sw.js|workbox-.*|icons|manifest.json).*)'
  ]
}
