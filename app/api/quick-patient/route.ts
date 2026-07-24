import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clinic_id, full_name, phone } = await req.json()

  if (!clinic_id || !full_name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!staffMember) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('id')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinic_id)
    .eq('is_active', true)
    .single()

  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: patient, error } = await supabase
    .from('patients')
    .insert({
      clinic_id,
      full_name,
      phone: phone || null,
      created_by: staffMember.id
    })
    .select('id, full_name, phone')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(patient)
}
