import { createBrowserClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'

export function createClient(cookieOptions?: CookieOptions) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookieOptions ? { cookieOptions } : {}
  )
}
