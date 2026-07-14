import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request, { params }: { params: { locale: string } }) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const locale = params.locale || 'en'
  const next = searchParams.get('next') ?? `/${locale}/clinic-switcher`

  if (code) {
    const supabase = createClient(cookies())
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(new URL(`/${locale}/login?error=Invalid+or+expired+confirmation+link`, request.url))
}
