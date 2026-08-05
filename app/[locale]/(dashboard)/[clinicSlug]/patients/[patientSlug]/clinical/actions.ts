'use server'

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

  return { supabase, staffMember, membership }
}

export type VisitServiceItem = {
  clinic_service_id?: string | null
  name: string
  quantity: number
  unit_price_egp: number
}

export async function getClinicServices(clinicId: string) {
  const { supabase } = await verifyAccess(clinicId)
  const { data, error } = await supabase
    .from('clinic_services')
    .select('id, name, price, description, category_id')
    .eq('clinic_id', clinicId)
    .order('name')
  if (error) throw error
  return data || []
}

/** Returns the current in-progress encounter procedures (services) for this patient. */
export async function getCurrentVisitServices(clinicId: string, patientId: string) {
  const { supabase } = await verifyAccess(clinicId)

  const { data: encounter } = await supabase
    .from('patient_encounters')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .eq('status', 'in_progress')
    .maybeSingle()

  if (!encounter) return []

  const { data, error } = await supabase
    .from('patient_procedures')
    .select('id, clinic_service_id, service_name, quantity, unit_price_egp')
    .eq('encounter_id', encounter.id)
    .order('created_at')

  if (error) throw error
  return data || []
}

export async function saveVisitServices(clinicId: string, locale: string, patientId: string, items: VisitServiceItem[]) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  const { data: existing } = await supabase
    .from('patient_encounters')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('patient_id', patientId)
    .eq('status', 'in_progress')
    .maybeSingle()

  let encounterId = existing?.id
  if (!encounterId) {
    const { data: enc, error: encErr } = await supabase
      .from('patient_encounters')
      .insert({ clinic_id: clinicId, patient_id: patientId, doctor_id: staffMember.id, status: 'in_progress' })
      .select('id')
      .single()
    if (encErr) throw encErr
    encounterId = enc.id
  }

  await supabase.from('patient_procedures').delete().eq('encounter_id', encounterId)

  if (items.length > 0) {
    const rows = items.map(it => ({
      encounter_id: encounterId,
      clinic_service_id: it.clinic_service_id || null,
      service_name: it.name,
      quantity: it.quantity,
      unit_price_egp: it.unit_price_egp,
      status: 'completed',
    }))
    const { error } = await supabase.from('patient_procedures').insert(rows)
    if (error) throw error
  }

  return { success: true }
}
