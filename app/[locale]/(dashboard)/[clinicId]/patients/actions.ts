'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
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

export async function createPatient(clinicId: string, locale: string, formData: FormData) {
  const { supabase } = await verifyAccess(clinicId)

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const date_of_birth = formData.get('date_of_birth') as string || null
  const gender = formData.get('gender') as string || null
  const notes = formData.get('notes') as string

  // Insert patient
  const { data: newPatient, error: patientError } = await supabase
    .from('patients')
    .insert({
      clinic_id: clinicId,
      full_name,
      phone,
      date_of_birth,
      gender,
      notes
    })
    .select('id')
    .single()

  if (patientError) throw patientError

  // Insert empty medical history for this patient
  const { error: medError } = await supabase
    .from('patient_medical_history')
    .insert({
      patient_id: newPatient.id
    })

  if (medError) throw medError

  redirect(`/${locale}/${clinicId}/patients/${newPatient.id}`)
}

export async function updateMedicalHistory(patientId: string, clinicId: string, locale: string, formData: FormData) {
  const { supabase } = await verifyAccess(clinicId)

  const systemic_diseases = formData.get('systemic_diseases') as string
  const allergies = formData.get('allergies') as string
  const current_medications = formData.get('current_medications') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase
    .from('patient_medical_history')
    .update({
      systemic_diseases,
      allergies,
      current_medications,
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('patient_id', patientId)

  if (error) throw error

  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}

export async function uploadPatientFile(patientId: string, clinicId: string, locale: string, formData: FormData) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  const file = formData.get('file') as File
  const category = formData.get('category') as string || 'other'
  
  if (!file || file.size === 0) {
    throw new Error('No file provided')
  }

  // Generate a safe file path: clinicId/patientId/timestamp-filename
  const filePath = `${clinicId}/${patientId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  const { error: uploadError } = await supabase.storage
    .from('patient-files')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Upload Error:', uploadError)
    throw new Error('Failed to upload file to storage')
  }

  // Get the public URL or just store the path (depending on bucket privacy)
  // For patient data, buckets should be private, so we store the path and use createSignedUrl later.
  // For simplicity here, we'll just store the path in file_url.
  const { error: dbError } = await supabase
    .from('patient_uploaded_files')
    .insert({
      clinic_id: clinicId,
      patient_id: patientId,
      file_url: filePath,
      category,
      uploaded_via: 'staff',
      review_status: 'approved',
      reviewed_by: staffMember.id,
      reviewed_at: new Date().toISOString()
    })

  if (dbError) throw dbError

  revalidatePath(`/${locale}/${clinicId}/patients/${patientId}`)
}
