-- Add key-value columns to clinic_settings for flexible settings storage
-- This allows storing paper_format, clinic_logo, and other settings

ALTER TABLE clinic_settings 
  ADD COLUMN IF NOT EXISTS setting_key text,
  ADD COLUMN IF NOT EXISTS setting_value text;

-- Create unique constraint for the key-value pair
ALTER TABLE clinic_settings 
  ADD CONSTRAINT clinic_settings_clinic_id_setting_key_unique 
  UNIQUE (clinic_id, setting_key);
