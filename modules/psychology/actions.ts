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

export async function addSession(clinicId: string, locale: string, patientId: string, data: {
  session_number?: number; session_type?: string; chief_complaint?: string; mood_scale?: number;
  anxiety_scale?: number; observations?: string; interventions?: string; treatment_plan?: string;
  next_session_date?: string; notes?: string
}) {
  const { supabase, staffMember } = await verifyAccess(clinicId)
  const { error } = await supabase.from('psychology_sessions').insert({
    clinic_id: clinicId, patient_id: patientId,
    session_number: data.session_number || null, session_type: data.session_type || 'individual',
    chief_complaint: data.chief_complaint || null, mood_scale: data.mood_scale || null,
    anxiety_scale: data.anxiety_scale || null, observations: data.observations || null,
    interventions: data.interventions || null, treatment_plan: data.treatment_plan || null,
    next_session_date: data.next_session_date || null, notes: data.notes || null,
    therapist_id: staffMember.id,
  })
  if (error) throw new Error('Failed to add session')
  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}

export async function deleteSession(clinicId: string, locale: string, patientId: string, sessionId: string) {
  const { supabase } = await verifyAccess(clinicId)
  await supabase.from('psychology_sessions').delete().eq('id', sessionId)
  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}
