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

export async function createPatient(clinicId: string, clinicSlug: string, locale: string, formData: FormData) {
  const { supabase } = await verifyAccess(clinicId)

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const date_of_birth = formData.get('date_of_birth') as string || null
  const gender = formData.get('gender') as string || null
  const notes = formData.get('notes') as string
  const marketing_campaign_id = formData.get('marketing_campaign_id') as string || null

  // Insert patient
  const { data: newPatient, error: patientError } = await supabase
    .from('patients')
    .insert({
      clinic_id: clinicId,
      full_name,
      phone,
      date_of_birth,
      gender,
      notes,
      marketing_campaign_id
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

  redirect(`/${locale}/${clinicSlug}/patients/${newPatient.id}`)
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

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]', 'page')
}

export async function uploadPatientFile(patientId: string, clinicId: string, locale: string, formData: FormData) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  const file = formData.get('file') as File
  const category = formData.get('category') as string || 'other'
  
  if (!file || file.size === 0) {
    throw new Error('No file provided')
  }

  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID

  if (rootFolderId) {
    // Google Drive upload
    const { uploadPatientFile: driveUpload } = await import('@/lib/google-drive')

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const result = await driveUpload({
      rootFolderId,
      clinicId,
      patientId,
      category,
      fileBuffer,
      originalFileName: file.name,
      mimeType: file.type,
    })

    const { error: dbError } = await supabase
      .from('patient_uploaded_files')
      .insert({
        clinic_id: clinicId,
        patient_id: patientId,
        file_url: result.webViewLink,
        file_name: result.fileName,
        file_size: result.fileSize,
        mime_type: result.mimeType,
        category,
        storage_provider: 'gdrive',
        google_drive_file_id: result.fileId,
        google_drive_web_view_link: result.webViewLink,
        gdrive_folder_type: result.folderType,
        uploaded_via: 'staff',
        review_status: 'approved',
        reviewed_by: staffMember.id,
        reviewed_at: new Date().toISOString(),
      })

    if (dbError) throw dbError
  } else {
    // Supabase Storage upload (fallback)
    const filePath = `${clinicId}/${patientId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { error: uploadError } = await supabase.storage
      .from('patient-files')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error('Failed to upload file to storage')
    }

    const { error: dbError } = await supabase
      .from('patient_uploaded_files')
      .insert({
        clinic_id: clinicId,
        patient_id: patientId,
        file_url: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        category,
        storage_provider: 'supabase',
        uploaded_via: 'staff',
        review_status: 'approved',
        reviewed_by: staffMember.id,
        reviewed_at: new Date().toISOString(),
      })

    if (dbError) throw dbError
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]', 'page')
}

export async function recordVitals(clinicId: string, locale: string, patientId: string, vitalsData: any) {
  const { supabase, staffMember } = await verifyAccess(clinicId)

  const { error } = await supabase
    .from('patient_clinical_notes')
    .insert({
      patient_id: patientId,
      clinic_id: clinicId,
      author_id: staffMember.id,
      note_type: 'vitals',
      content: vitalsData
    })

  if (error) {
    console.error('Vitals error:', error)
    throw new Error('Failed to record vitals')
  }

  revalidatePath('/[locale]/(dashboard)/[clinicSlug]/patients/[patientSlug]', 'page')
}
