import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '@/lib/whatsapp-client'

export async function handleIncomingMedia(clinicId: string, from: string, mediaBase64: string, mimeType: string) {
  const supabase = createClient()

  // 1. Check if patient upload intake is enabled
  const { data: config } = await supabase
    .from('whatsapp_automation_settings')
    .select('patient_upload_intake_enabled')
    .eq('clinic_id', clinicId)
    .single()

  if (!config?.patient_upload_intake_enabled) {
    await sendMessage(clinicId, from, "File uploads are currently disabled for this clinic.")
    return
  }

  // 2. Identify Patient
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('phone', from)
    .single()

  if (!patient) {
    await sendMessage(clinicId, from, "We don't have your number registered. Please call the clinic to open a file before uploading documents.")
    return
  }

  // 3. Process and Upload Media
  try {
    const buffer = Buffer.from(mediaBase64, 'base64')
    
    // Generate filename based on timestamp
    const ext = mimeType.split('/')[1] || 'bin'
    const filename = `${clinicId}/${patient.id}/${Date.now()}.${ext}`

    // Upload to Supabase Storage 'patient_documents' bucket
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('patient_documents')
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload Error:', uploadError)
      throw new Error('Failed to upload to storage')
    }

    // Get public URL or signed URL. Let's assume public URL for simplicity in this demo, 
    // or just store the path and retrieve signed URLs later for security.
    const fileUrl = supabase.storage.from('patient_documents').getPublicUrl(filename).data.publicUrl

    // 4. Create Database Record
    const { error: dbError } = await supabase
      .from('patient_uploaded_files')
      .insert({
        clinic_id: clinicId,
        patient_id: patient.id,
        file_url: fileUrl,
        category: 'other',
        uploaded_via: 'whatsapp',
        review_status: 'pending' // Needs staff review
      })

    if (dbError) {
      console.error('DB Insert Error:', dbError)
      throw new Error('Failed to save file record')
    }

    // 5. Send Confirmation
    await sendMessage(clinicId, from, "Your document has been successfully received and added to your medical file. It is pending doctor review.")
    
  } catch (error) {
    console.error('Media handling error:', error)
    await sendMessage(clinicId, from, "Sorry, there was an error processing your document. Please try again later.")
  }
}
