import { google } from 'googleapis'
import type { drive_v3 } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/drive']

function getAuth() {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive credentials not configured. Set GOOGLE_DRIVE_CLIENT_EMAIL and GOOGLE_DRIVE_PRIVATE_KEY in environment variables.')
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  })
}

function getDrive(): drive_v3.Drive {
  const auth = getAuth()
  return google.drive({ version: 'v3', auth })
}

// --- Exponential Backoff ---
async function withBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const status = (err as { code?: number }).code
      if (status === 429 || status === 500 || status === 503) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
      }
      throw lastError
    }
  }
  throw lastError
}

// --- Folder Management ---

export async function findOrCreateSubfolder(
  parentFolderId: string,
  folderName: string
): Promise<string> {
  const drive = getDrive()

  // Search for existing folder
  const existing = await withBackoff(() =>
    drive.files.list({
      q: `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    })
  )

  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!
  }

  // Create new folder
  const folder = await withBackoff(() =>
    drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
      },
      fields: 'id',
    })
  )

  return folder.data.id!
}

export async function getClinicFolderId(rootFolderId: string, clinicId: string): Promise<string> {
  return findOrCreateSubfolder(rootFolderId, `Clinic_${clinicId}`)
}

export async function getPatientFolderId(
  clinicFolderId: string,
  patientId: string
): Promise<string> {
  return findOrCreateSubfolder(clinicFolderId, `Patient_${patientId}`)
}

export async function getOrCreatePatientSubfolders(
  patientFolderId: string
): Promise<{ xray: string; lab: string; prescription: string }> {
  const [xray, lab, prescription] = await Promise.all([
    findOrCreateSubfolder(patientFolderId, 'X-Rays'),
    findOrCreateSubfolder(patientFolderId, 'Lab_Results'),
    findOrCreateSubfolder(patientFolderId, 'Prescriptions'),
  ])
  return { xray, lab, prescription }
}

// --- File Upload ---

function generateFileName(category: string, originalName: string): string {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
  const ext = originalName.split('.').pop() || 'bin'

  const prefix = category === 'xray'
    ? 'XRay'
    : category === 'lab'
    ? 'Lab'
    : category === 'prescription'
    ? 'Rx'
    : 'File'

  return `${prefix}_${dateStr}.${ext}`
}

export interface UploadResult {
  fileId: string
  webViewLink: string
  fileName: string
  fileSize: number
  mimeType: string
}

export async function uploadFileToDrive(
  parentFolderId: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  category: string
): Promise<UploadResult> {
  const drive = getDrive()
  const namedFileName = generateFileName(category, fileName)

  const result = await withBackoff(() =>
    drive.files.create({
      requestBody: {
        name: namedFileName,
        parents: [parentFolderId],
      },
      media: {
        mimeType,
        body: Buffer.from(fileBuffer),
      },
      fields: 'id, webViewLink, name, size, mimeType',
    })
  )

  // Set sharing permissions so the file is viewable
  try {
    await withBackoff(() =>
      drive.permissions.create({
        fileId: result.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      })
    )
  } catch {
    // Non-critical: file still uploaded, just may not be publicly viewable
  }

  // Get webViewLink
  const file = await withBackoff(() =>
    drive.files.get({
      fileId: result.data.id!,
      fields: 'webViewLink',
    })
  )

  return {
    fileId: result.data.id!,
    webViewLink: file.data.webViewLink || '',
    fileName: namedFileName,
    fileSize: parseInt(result.data.size || '0', 10),
    mimeType: result.data.mimeType || mimeType,
  }
}

// --- Storage Quota ---

export async function getClinicStorageUsage(
  rootFolderId: string,
  clinicId: string
): Promise<{ usedBytes: number; usedMB: number; usedGB: number }> {
  const drive = getDrive()

  try {
    const clinicFolderId = await getClinicFolderId(rootFolderId, clinicId)

    // List all files recursively in the clinic folder
    let totalBytes = 0
    let pageToken: string | undefined

    do {
      const res = await withBackoff(() =>
        drive.files.list({
          q: `'${clinicFolderId}' in parents and trashed=false and mimeType != 'application/vnd.google-apps.folder'`,
          fields: 'nextPageToken, files(size)',
          pageSize: 1000,
          pageToken,
          spaces: 'drive',
        })
      )

      for (const file of res.data.files || []) {
        totalBytes += parseInt(file.size || '0', 10)
      }
      pageToken = res.data.nextPageToken || undefined
    } while (pageToken)

    return {
      usedBytes: totalBytes,
      usedMB: Math.round(totalBytes / (1024 * 1024) * 100) / 100,
      usedGB: Math.round(totalBytes / (1024 * 1024 * 1024) * 100) / 100,
    }
  } catch {
    return { usedBytes: 0, usedMB: 0, usedGB: 0 }
  }
}

// --- Main Upload Pipeline ---

export interface DriveUploadPipelineResult {
  fileId: string
  webViewLink: string
  fileName: string
  fileSize: number
  mimeType: string
  folderType: 'xray' | 'lab' | 'prescription'
}

export async function uploadPatientFile(params: {
  rootFolderId: string
  clinicId: string
  patientId: string
  category: string
  fileBuffer: Buffer
  originalFileName: string
  mimeType: string
}): Promise<DriveUploadPipelineResult> {
  const { rootFolderId, clinicId, patientId, category, fileBuffer, originalFileName, mimeType } = params

  // 1. Get or create clinic folder
  const clinicFolderId = await getClinicFolderId(rootFolderId, clinicId)

  // 2. Get or create patient folder
  const patientFolderId = await getPatientFolderId(clinicFolderId, patientId)

  // 3. Get or create subfolders (X-Rays, Lab_Results, Prescriptions)
  const subfolders = await getOrCreatePatientSubfolders(patientFolderId)

  // 4. Determine target folder based on category
  const folderType = category === 'xray' ? 'xray'
    : category === 'lab' ? 'lab'
    : 'prescription'

  const targetFolderId = subfolders[folderType]

  // 5. Upload file
  const result = await uploadFileToDrive(
    targetFolderId,
    fileBuffer,
    originalFileName,
    mimeType,
    category
  )

  return {
    ...result,
    folderType,
  }
}

// --- Get Download URL ---

export async function getDriveFileDownloadUrl(fileId: string): Promise<string> {
  const drive = getDrive()
  const file = await withBackoff(() =>
    drive.files.get({
      fileId,
      fields: 'webContentLink',
    })
  )
  return file.data.webContentLink || ''
}
