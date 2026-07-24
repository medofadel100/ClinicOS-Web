-- Add display_id (slug) to patients table
ALTER TABLE public.patients ADD COLUMN display_id text;

-- Create a function to generate a unique display_id for a patient
CREATE OR REPLACE FUNCTION public.generate_patient_display_id(p_full_name text, p_phone text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Convert to lowercase and replace non-alphanumeric (except spaces) with empty string
  -- Then replace spaces with hyphens
  base_slug := lower(regexp_replace(p_full_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  
  -- If base_slug is empty, use 'patient'
  IF base_slug = '' THEN
    base_slug := 'patient';
  END IF;

  -- Append the last 4 digits of the phone number if available
  IF p_phone IS NOT NULL AND length(p_phone) >= 4 THEN
    base_slug := base_slug || '-' || right(regexp_replace(p_phone, '[^0-9]', '', 'g'), 4);
  END IF;

  final_slug := base_slug;

  -- Ensure uniqueness within the table
  WHILE EXISTS (SELECT 1 FROM public.patients WHERE display_id = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  RETURN final_slug;
END;
$$;

-- Backfill existing patients
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN SELECT id, full_name, phone FROM public.patients WHERE display_id IS NULL LOOP
    UPDATE public.patients 
    SET display_id = public.generate_patient_display_id(p.full_name, p.phone)
    WHERE id = p.id;
  END LOOP;
END $$;

-- Make it UNIQUE and NOT NULL
ALTER TABLE public.patients ALTER COLUMN display_id SET NOT NULL;
ALTER TABLE public.patients ADD CONSTRAINT patients_display_id_key UNIQUE (display_id);

-- Update the handle_new_user trigger or any patient creation RPC to generate it automatically
-- Actually, we can use a BEFORE INSERT trigger to auto-generate the display_id if it's not provided

CREATE OR REPLACE FUNCTION public.set_patient_display_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := public.generate_patient_display_id(NEW.full_name, NEW.phone);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_patients_set_display_id
BEFORE INSERT ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.set_patient_display_id();
