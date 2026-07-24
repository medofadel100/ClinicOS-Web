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
  if (!membership) throw new Error('Forbidden')

  return { supabase, staffMember }
}

export async function upsertExamination(
  clinicId: string, locale: string, patientId: string,
  data: {
    examinationId?: string
    pregnancy_week?: number
    last_menstrual_period?: string
    fundal_height?: number
    fetal_heart_rate?: number
    blood_pressure_systolic?: number
    blood_pressure_diastolic?: number
    weight_kg?: number
    urine_protein?: string
    urine_glucose?: string
    edema?: string
    diagnosis?: string
    notes?: string
  }
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  if (data.examinationId) {
    const { error } = await supabase.from('obgyn_examinations').update({
      pregnancy_week: data.pregnancy_week || null,
      last_menstrual_period: data.last_menstrual_period || null,
      fundal_height: data.fundal_height || null,
      fetal_heart_rate: data.fetal_heart_rate || null,
      blood_pressure_systolic: data.blood_pressure_systolic || null,
      blood_pressure_diastolic: data.blood_pressure_diastolic || null,
      weight_kg: data.weight_kg || null,
      urine_protein: data.urine_protein || null,
      urine_glucose: data.urine_glucose || null,
      edema: data.edema || null,
      diagnosis: data.diagnosis || null,
      notes: data.notes || null,
    }).eq('id', data.examinationId)
    if (error) throw new Error('Failed to update examination')
  } else {
    const { error } = await supabase.from('obgyn_examinations').insert({
      clinic_id: clinicId, patient_id: patientId,
      pregnancy_week: data.pregnancy_week || null,
      last_menstrual_period: data.last_menstrual_period || null,
      fundal_height: data.fundal_height || null,
      fetal_heart_rate: data.fetal_heart_rate || null,
      blood_pressure_systolic: data.blood_pressure_systolic || null,
      blood_pressure_diastolic: data.blood_pressure_diastolic || null,
      weight_kg: data.weight_kg || null,
      urine_protein: data.urine_protein || null,
      urine_glucose: data.urine_glucose || null,
      edema: data.edema || null,
      diagnosis: data.diagnosis || null,
      notes: data.notes || null,
      examined_by: staffMember.id,
    })
    if (error) throw new Error('Failed to create examination')
  }
  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}

export async function deleteExamination(clinicId: string, locale: string, patientId: string, examinationId: string) {
  const { supabase } = await verifyAccess(clinicId)
  const { error } = await supabase.from('obgyn_examinations').delete().eq('id', examinationId)
  if (error) throw new Error('Failed to delete examination')
  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}
