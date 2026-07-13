import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // next-intl forces locale redirect if needed.
  // We'll let middleware handle where to route them post-login based on memberships
  const next = searchParams.get('next') ?? '/en/clinic-switcher'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page
  return NextResponse.redirect(`${origin}/en/login?error=auth`)
}
