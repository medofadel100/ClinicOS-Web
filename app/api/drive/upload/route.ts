import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { uploadPatientFile } from '@/lib/google-drive'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  'application/pdf',
  'image/dicom', // medical imaging
]

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const clinicId = formData.get('clinicId') as string
    const patientId = formData.get('patientId') as string
    const category = formData.get('category') as string // xray, lab, prescription

    if (!file || !clinicId || !patientId || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['xray', 'lab', 'prescription'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
    }

    // Verify staff membership
    const { data: staffMember } = await supabase
      .from('staff_members')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!staffMember) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 403 })
    }

    const { data: membership } = await supabase
      .from('clinic_staff_memberships')
      .select('id')
      .eq('staff_member_id', staffMember.id)
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this clinic' }, { status: 403 })
    }

    // Check storage quota
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
    if (!rootFolderId) {
      return NextResponse.json({ error: 'Google Drive not configured' }, { status: 500 })
    }

    // Get quota setting
    const { data: quotaSetting } = await supabase
      .from('clinic_settings')
      .select('setting_value')
      .eq('clinic_id', clinicId)
      .eq('setting_key', 'storage_quota_mb')
      .single()

    const quotaMB = parseInt(quotaSetting?.setting_value || '15000', 10) // Default 15GB

    // Get current usage
    const { data: usageRows } = await supabase
      .from('patient_uploaded_files')
      .select('file_size')
      .eq('clinic_id', clinicId)
      .eq('storage_provider', 'gdrive')

    const usedBytes = (usageRows || []).reduce((sum, row) => sum + (row.file_size || 0), 0)
    const usedMB = usedBytes / (1024 * 1024)
    const quotaBytes = quotaMB * 1024 * 1024

    if (usedBytes + file.size > quotaBytes) {
      const remainingMB = Math.max(0, quotaMB - usedMB).toFixed(1)
      return NextResponse.json({
        error: `Storage quota exceeded. Used: ${usedMB.toFixed(0)}MB / ${quotaMB}MB. Remaining: ${remainingMB}MB`,
      }, { status: 413 })
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Upload to Google Drive
    const result = await uploadPatientFile({
      rootFolderId,
      clinicId,
      patientId,
      category,
      fileBuffer,
      originalFileName: file.name,
      mimeType: file.type,
    })

    // Save to database
    const { data: dbFile, error: dbError } = await supabase
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
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: 'Failed to save file record' }, { status: 500 })
    }

    // Return updated usage
    const newUsedMB = (usedBytes + file.size) / (1024 * 1024)

    return NextResponse.json({
      success: true,
      file: dbFile,
      storage: {
        usedMB: Math.round(newUsedMB * 100) / 100,
        quotaMB,
        usedGB: Math.round(newUsedMB / 1024 * 100) / 100,
        quotaGB: Math.round(quotaMB / 1024 * 100) / 100,
      },
    })
  } catch (error) {
    console.error('[Drive Upload Error]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
