import { createBrowserClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'

export function createClient(cookieOptions?: CookieOptions) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
    cookieOptions ? { cookieOptions } : {}
  )
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}
