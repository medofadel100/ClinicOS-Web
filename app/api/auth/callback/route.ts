import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/en/clinic-switcher'

  if (!code) {
    return NextResponse.redirect(`${origin}/en/login?error=Missing+confirmation+code`)
  }

  const supabase = createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[API Auth Callback] exchangeCodeForSession failed:', error.message)
    return NextResponse.redirect(`${origin}/en/login?error=Invalid+or+expired+confirmation+link`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
