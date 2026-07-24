import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { patient_id, clinic_id, title, content, note_id } = await req.json()

  if (!patient_id || !clinic_id || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Get staff_member_id
  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (note_id) {
    // Update existing note
    const { data, error } = await supabase
      .from('patient_clinical_notes')
      .update({
        content: { title, body: content },
        updated_at: new Date().toISOString()
      })
      .eq('id', note_id)
      .eq('patient_id', patient_id)
      .eq('clinic_id', clinic_id)
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Create new note
  const { data, error } = await supabase
    .from('patient_clinical_notes')
    .insert({
      patient_id,
      clinic_id,
      note_type: 'free_text',
      content: { title, body: content },
      author_id: staffMember?.id || null
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { note_id, patient_id, clinic_id } = await req.json()

  if (!note_id || !patient_id || !clinic_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { error } = await supabase
    .from('patient_clinical_notes')
    .delete()
    .eq('id', note_id)
    .eq('patient_id', patient_id)
    .eq('clinic_id', clinic_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
