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

export async function upsertExamination(
  clinicId: string,
  locale: string,
  patientId: string,
  bodyRegion: string,
  injuryType: string,
  severity: string,
  diagnosis: string,
  treatmentPlan: string,
  notes: string,
  examinationId?: string
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  const { data: clinic } = await supabase
    .from('clinics')
    .select('clinic_types ( code )')
    .eq('id', clinicId)
    .single()

  const code = (clinic?.clinic_types as unknown as { code?: string })?.code?.toLowerCase() || ''
  if (!code.includes('orthopedics')) {
    throw new Error('This module is only available for orthopedics clinics')
  }

  const record = {
    clinic_id: clinicId,
    patient_id: patientId,
    body_region: bodyRegion,
    injury_type: injuryType,
    severity,
    diagnosis,
    treatment_plan: treatmentPlan,
    notes,
    examined_by: staffMember.id,
  }

  let error

  if (examinationId) {
    const result = await supabase
      .from('orthopedic_examinations')
      .update(record)
      .eq('id', examinationId)
    error = result.error
  } else {
    const result = await supabase
      .from('orthopedic_examinations')
      .insert(record)
    error = result.error
  }

  if (error) {
    console.error('Error upserting examination:', error)
    throw new Error('Failed to save examination')
  }

  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}

export async function deleteExamination(
  clinicId: string,
  locale: string,
  patientId: string,
  examinationId: string
) {
  const { supabase } = await verifyAccess(clinicId)

  const { data: clinic } = await supabase
    .from('clinics')
    .select('clinic_types ( code )')
    .eq('id', clinicId)
    .single()

  const code = (clinic?.clinic_types as unknown as { code?: string })?.code?.toLowerCase() || ''
  if (!code.includes('orthopedics')) {
    throw new Error('This module is only available for orthopedics clinics')
  }

  const { error } = await supabase
    .from('orthopedic_examinations')
    .delete()
    .eq('id', examinationId)

  if (error) {
    console.error('Error deleting examination:', error)
    throw new Error('Failed to delete examination')
  }

  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}
