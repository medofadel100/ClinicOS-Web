'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Pin, DermatologyAestheticsData } from './types'

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

const DEFAULT_DATA: DermatologyAestheticsData = {
  laser_sessions: [],
  injectables: [],
  skincare: [],
  treatments: []
}

async function upsertNote(
  supabase: ReturnType<typeof createClient>,
  staffMember: { id: string },
  clinicId: string,
  patientId: string,
  noteType: string,
  content: Record<string, unknown>
) {
  const { data: existing } = await supabase
    .from('patient_clinical_notes')
    .select('id')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .eq('note_type', noteType)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('patient_clinical_notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('patient_clinical_notes')
      .insert({
        clinic_id: clinicId,
        patient_id: patientId,
        author_id: staffMember.id,
        note_type: noteType,
        content
      })
    if (error) throw error
  }
}

// ─── Body Map Pins ────────────────────────────────────────────
export async function upsertDermatologyNote(
  clinicId: string,
  _locale: string,
  patientId: string,
  pins: Pin[]
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)
  await upsertNote(supabase, staffMember, clinicId, patientId, 'dermatology_map', { pins })

  const { data: updatedNotes } = await supabase
    .from('patient_clinical_notes')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  revalidatePath(`/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]/clinical`, 'page')
  return updatedNotes || []
}

// ─── Aesthetics Data (laser, injectables, skincare, treatments) ─
export async function upsertAestheticsData(
  clinicId: string,
  patientId: string,
  data: DermatologyAestheticsData
) {
  const { supabase, staffMember } = await verifyAccess(clinicId)
  await upsertNote(supabase, staffMember, clinicId, patientId, 'dermatology_aesthetics', data as unknown as Record<string, unknown>)

  revalidatePath(`/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]/clinical`, 'page')
  return data
}

export async function getAestheticsData(
  clinicId: string,
  patientId: string
): Promise<DermatologyAestheticsData> {
  const supabase = createClient()
  const { data } = await supabase
    .from('patient_clinical_notes')
    .select('content')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .eq('note_type', 'dermatology_aesthetics')
    .single()

  return (data?.content as DermatologyAestheticsData) || DEFAULT_DATA
}
