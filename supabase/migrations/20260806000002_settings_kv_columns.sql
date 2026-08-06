-- ============================================================
-- Fix clinic_settings key/value writes
-- clinic_settings has a PRIMARY KEY on clinic_id (one row per
-- clinic), but savePaperFormat / saveClinicLogo wrote into
-- setting_key/setting_value which requires multiple rows per
-- clinic -> second write violated the PK -> 500 error.
-- Add dedicated columns and migrate any existing KV values.
-- ============================================================

ALTER TABLE public.clinic_settings
  ADD COLUMN IF NOT EXISTS paper_format text,
  ADD COLUMN IF NOT EXISTS clinic_logo text,
  ADD COLUMN IF NOT EXISTS storage_quota_mb text;

UPDATE public.clinic_settings
  SET clinic_logo = setting_value
  WHERE setting_key = 'clinic_logo' AND setting_value IS NOT NULL;

UPDATE public.clinic_settings
  SET paper_format = setting_value
  WHERE setting_key = 'paper_format' AND setting_value IS NOT NULL;

UPDATE public.clinic_settings
  SET storage_quota_mb = setting_value
  WHERE setting_key = 'storage_quota_mb' AND setting_value IS NOT NULL;
