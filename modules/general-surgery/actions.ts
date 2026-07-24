'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function verifyAccess(clinicId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: staffMember } = await supabase
    .from('staff_members')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!staffMember) throw new Error('Unauthorized')

  const { data: membership } = await supabase
    .from('clinic_staff_memberships')
    .select('role')
    .eq('staff_member_id', staffMember.id)
    .eq('clinic_id', clinicId)
    .eq('is_active', true)
    .single()

  if (!membership) throw new Error('Forbidden')

  return { supabase, staffMember, membership }
}

export async function upsertGeneralSurgeryNote(clinicId: string, locale: string, patientId: string, notes: any[]) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  const { data: existingNote } = await supabase
    .from('patient_clinical_notes')
    .select('id')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .eq('note_type', 'general_surgery_notes')
    .single()

  if (existingNote) {
    const { error } = await supabase
      .from('patient_clinical_notes')
      .update({ content: { notes }, updated_at: new Date().toISOString() })
      .eq('id', existingNote.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('patient_clinical_notes')
      .insert({
        clinic_id: clinicId,
        patient_id: patientId,
        author_id: staffMember.id,
        note_type: 'general_surgery_notes',
        content: { notes }
      })
    if (error) throw error
  }

  const { data: updatedNotes } = await supabase
    .from('patient_clinical_notes')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  revalidatePath(`/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]`, 'page')
  return updatedNotes || []
}
