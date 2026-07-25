import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { locale: string } }) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const locale = params.locale || 'en'
  const next = searchParams.get('next') ?? `/${locale}/clinic-switcher`

  if (!code) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=Missing+confirmation+code`, request.url)
    )
  }

  const supabase = createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[Auth Callback] exchangeCodeForSession failed:', error.message)
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=Invalid+or+expired+confirmation+link`, request.url)
    )
  }

  return NextResponse.redirect(new URL(next, request.url))
}
