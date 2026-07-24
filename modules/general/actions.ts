'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function verifyAccess(clinicId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: staffMember } = await supabase.from('staff_members').select('id').eq('auth_user_id', user.id).single()
  if (!staffMember) throw new Error('Unauthorized')
  const { data: membership } = await supabase.from('clinic_staff_memberships').select('role').eq('staff_member_id', staffMember.id).eq('clinic_id', clinicId).eq('is_active', true).single()
  if (!membership) throw new Error('Forbidden')
  return { supabase, staffMember }
}

export async function addVitalSigns(
  clinicId: string, locale: string, patientId: string,
  data: { blood_pressure_systolic?: number; blood_pressure_diastolic?: number; heart_rate?: number; temperature_c?: number; respiratory_rate?: number; oxygen_saturation?: number; weight_kg?: number; height_cm?: number; notes?: string }
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)
  const { error } = await supabase.from('vital_signs_logs').insert({
    clinic_id: clinicId, patient_id: patientId,
    blood_pressure_systolic: data.blood_pressure_systolic || null,
    blood_pressure_diastolic: data.blood_pressure_diastolic || null,
    heart_rate: data.heart_rate || null, temperature_c: data.temperature_c || null,
    respiratory_rate: data.respiratory_rate || null, oxygen_saturation: data.oxygen_saturation || null,
    weight_kg: data.weight_kg || null, height_cm: data.height_cm || null,
    notes: data.notes || null, recorded_by: staffMember.id,
  })
  if (error) throw new Error('Failed to record vital signs')
  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}

export async function deleteVitalSigns(clinicId: string, locale: string, patientId: string, recordId: string) {
  const { supabase } = await verifyAccess(clinicId)
  await supabase.from('vital_signs_logs').delete().eq('id', recordId)
  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}
