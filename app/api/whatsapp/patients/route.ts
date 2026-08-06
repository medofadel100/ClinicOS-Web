import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { phoneVariants } from '@/lib/bot/phone'

export const dynamic = 'force-dynamic'

function toInternational(raw: string): string {
  for (const variant of phoneVariants(raw)) {
    const digits = variant.replace(/\D/g, '')
    if (digits.startsWith('20') && digits.length >= 12) return digits
  }
  return ''
}

export async function GET(req: Request) {
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET
  const authHeader = req.headers.get('authorization')
  const xWebhookSecret = req.headers.get('x-webhook-secret')
  if (!secret || (authHeader !== `Bearer ${secret}` && xWebhookSecret !== secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clinicId = new URL(req.url).searchParams.get('clinicId')
  if (!clinicId) {
    return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const phones = new Set<string>()

  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('phone')
    .eq('clinic_id', clinicId)
    .not('phone', 'is', null)

  if (patientsError) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
  for (const p of patients || []) {
    const normalized = toInternational(p.phone)
    if (normalized) phones.add(normalized)
  }

  const { data: conversations, error: convError } = await supabase
    .from('whatsapp_conversation_states')
    .select('phone_number')
    .eq('clinic_id', clinicId)
    .not('phone_number', 'is', null)

  if (convError) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }
  for (const c of conversations || []) {
    const normalized = toInternational(c.phone_number)
    if (normalized) phones.add(normalized)
  }

  return NextResponse.json({ phones: Array.from(phones) })
}
