-- Migration: Google Drive integration + storage quota
-- Date: 2026-07-25

-- 1. Add new columns to patient_uploaded_files for Google Drive support
ALTER TABLE patient_uploaded_files
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_size bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS storage_provider text DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 'gdrive')),
  ADD COLUMN IF NOT EXISTS google_drive_file_id text,
  ADD COLUMN IF NOT EXISTS google_drive_web_view_link text,
  ADD COLUMN IF NOT EXISTS gdrive_folder_type text CHECK (gdrive_folder_type IN ('xray', 'lab', 'prescription'));

-- 2. Expand file_category enum to include 'lab'
-- Since we can't ALTER TYPE easily, we'll use text with CHECK
ALTER TABLE patient_uploaded_files
  DROP CONSTRAINT IF EXISTS patient_uploaded_files_category_check;

ALTER TABLE patient_uploaded_files
  ADD CONSTRAINT patient_uploaded_files_category_check
  CHECK (category IN ('xray', 'lab', 'prescription', 'other'));

-- 3. Add index for Google Drive file lookups
CREATE INDEX IF NOT EXISTS idx_patient_files_gdrive_id
  ON patient_uploaded_files(google_drive_file_id)
  WHERE google_drive_file_id IS NOT NULL;

-- 4. Add index for storage provider filtering
CREATE INDEX IF NOT EXISTS idx_patient_files_storage_provider
  ON patient_uploaded_files(storage_provider, clinic_id);

-- 5. Add index for file_size aggregation (quota calculations)
CREATE INDEX IF NOT EXISTS idx_patient_files_size
  ON patient_uploaded_files(clinic_id, file_size);

COMMENT ON COLUMN patient_uploaded_files.file_name IS 'Original filename before upload';
COMMENT ON COLUMN patient_uploaded_files.file_size IS 'File size in bytes';
COMMENT ON COLUMN patient_uploaded_files.mime_type IS 'MIME type of the file';
COMMENT ON COLUMN patient_uploaded_files.storage_provider IS 'supabase or gdrive';
COMMENT ON COLUMN patient_uploaded_files.google_drive_file_id IS 'Google Drive file ID for retrieval';
COMMENT ON COLUMN patient_uploaded_files.google_drive_web_view_link IS 'Google Drive web view link';
COMMENT ON COLUMN patient_uploaded_files.gdrive_folder_type IS 'Subfolder type on Drive: xray, lab, or prescription';
