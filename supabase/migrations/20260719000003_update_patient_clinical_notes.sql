-- Modify patient_clinical_notes to support our 16 dynamic clinical modules

-- 1. Add missing columns that we use in actions.ts
ALTER TABLE public.patient_clinical_notes
ADD COLUMN IF NOT EXISTS patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.staff_members(id);

-- 2. Drop the restrictive note_type CHECK constraint so we can insert custom note_types
-- We need to find the name of the check constraint. Usually it's patient_clinical_notes_note_type_check.
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.patient_clinical_notes'::regclass
    AND contype = 'c'
    AND conname LIKE '%note_type%';
    
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.patient_clinical_notes DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;
