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

  return { supabase, staffMember }
}

export async function getPediatricsData(clinicId: string, patientId: string) {
  const { supabase } = await verifyAccess(clinicId)
  const { data } = await supabase
    .from('patient_clinical_notes')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .eq('note_type', 'pediatrics_tracker')
    .single()
    
  return data ? data.content : { records: [], growth: [], vaccines: [] }
}

async function updatePediatricsData(clinicId: string, patientId: string, staffId: string, newContent: any) {
  const supabase = createClient()
  const { data: existingNote } = await supabase
    .from('patient_clinical_notes')
    .select('id, content')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .eq('note_type', 'pediatrics_tracker')
    .single()

  const mergedContent = existingNote ? { ...existingNote.content, ...newContent } : newContent

  if (existingNote) {
    const { error } = await supabase
      .from('patient_clinical_notes')
      .update({ content: mergedContent, updated_at: new Date().toISOString() })
      .eq('id', existingNote.id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('patient_clinical_notes')
      .insert({
        clinic_id: clinicId,
        patient_id: patientId,
        author_id: staffId,
        note_type: 'pediatrics_tracker',
        content: mergedContent
      })
    if (error) throw error
  }
}

export async function upsertPediatricsNote(clinicId: string, locale: string, patientId: string, records: any[]) {
  const { staffMember } = await verifyAccess(clinicId)
  await updatePediatricsData(clinicId, patientId, staffMember.id, { records })
  revalidatePath(`/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]/clinical`, 'page')
  
  // Return the updated notes structure expected by the frontend
  const { supabase } = await verifyAccess(clinicId)
  const { data: updatedNotes } = await supabase
    .from('patient_clinical_notes')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
  return updatedNotes || []
}

export async function addGrowthRecord(clinicId: string, locale: string, patientId: string, record: any) {
  const { staffMember } = await verifyAccess(clinicId)
  const data = await getPediatricsData(clinicId, patientId)
  const growth = data.growth || []
  growth.push({ ...record, id: Math.random().toString(36).substring(7), created_at: new Date().toISOString() })
  await updatePediatricsData(clinicId, patientId, staffMember.id, { growth })
  revalidatePath(`/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]/clinical`, 'page')
}

export async function deleteGrowthRecord(clinicId: string, locale: string, patientId: string, recordId: string) {
  const { staffMember } = await verifyAccess(clinicId)
  const data = await getPediatricsData(clinicId, patientId)
  const growth = (data.growth || []).filter((g: any) => g.id !== recordId)
  await updatePediatricsData(clinicId, patientId, staffMember.id, { growth })
  revalidatePath(`/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]/clinical`, 'page')
}

export async function addVaccination(clinicId: string, locale: string, patientId: string, record: any) {
  const { staffMember } = await verifyAccess(clinicId)
  const data = await getPediatricsData(clinicId, patientId)
  const vaccines = data.vaccines || []
  vaccines.push({ ...record, id: Math.random().toString(36).substring(7), created_at: new Date().toISOString() })
  await updatePediatricsData(clinicId, patientId, staffMember.id, { vaccines })
  revalidatePath(`/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]/clinical`, 'page')
}

export async function deleteVaccination(clinicId: string, locale: string, patientId: string, recordId: string) {
  const { staffMember } = await verifyAccess(clinicId)
  const data = await getPediatricsData(clinicId, patientId)
  const vaccines = (data.vaccines || []).filter((v: any) => v.id !== recordId)
  await updatePediatricsData(clinicId, patientId, staffMember.id, { vaccines })
  revalidatePath(`/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]/clinical`, 'page')
}
