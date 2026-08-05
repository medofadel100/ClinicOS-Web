'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  if (!membership) {
    throw new Error('Forbidden')
  }

  return { supabase, staffMember, membership }
}

function revalidatePatientPages() {
  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]', 'page')
}

export async function updateToothCondition(
  clinicId: string, 
  locale: string, 
  patientId: string, 
  toothNumber: number, 
  condition: string,
  notes?: string
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  // Upsert the tooth condition
  const { error } = await supabase
    .from('dental_chart_entries')
    .upsert({
      clinic_id: clinicId,
      patient_id: patientId,
      tooth_number: toothNumber,
      condition: condition,
      notes: notes || null,
      updated_by: staffMember.id,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'patient_id, tooth_number'
    })

  if (error) {
    console.error('Error updating tooth condition:', error)
    throw new Error('Failed to update tooth condition')
  }

  // Log the change in the tooth history
  const { error: historyError } = await supabase
    .from('dental_chart_history')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      tooth_number: toothNumber,
      condition: condition,
      notes: notes || null,
      changed_by: staffMember.id
    })

  if (historyError) {
    console.error('Error logging tooth history:', historyError)
  }

  revalidatePatientPages()
}

export async function updateToothNotes(
  clinicId: string,
  locale: string,
  patientId: string,
  toothNumber: number,
  notes: string
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  // Fetch current condition so we can log it in history
  const { data: entry } = await supabase
    .from('dental_chart_entries')
    .select('condition')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .eq('tooth_number', toothNumber)
    .single()

  const condition = (entry?.condition as string) || 'normal'

  const { error } = await supabase
    .from('dental_chart_entries')
    .upsert({
      clinic_id: clinicId,
      patient_id: patientId,
      tooth_number: toothNumber,
      condition: condition,
      notes: notes || null,
      updated_by: staffMember.id,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'patient_id, tooth_number'
    })

  if (error) {
    console.error('Error updating tooth notes:', error)
    throw new Error('Failed to update tooth notes')
  }

  // Log the note change in history
  const { error: historyError } = await supabase
    .from('dental_chart_history')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      tooth_number: toothNumber,
      condition: condition,
      notes: notes || null,
      changed_by: staffMember.id
    })

  if (historyError) {
    console.error('Error logging tooth notes history:', historyError)
  }

  revalidatePatientPages()
}
