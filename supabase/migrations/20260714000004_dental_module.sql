-- Checkpoint 5: Dental Specialty Module

-- ENUMS
DO $$ BEGIN
    CREATE TYPE tooth_condition AS ENUM ('normal', 'cavity', 'extracted', 'root_canal', 'crown', 'implant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. dental_chart_entries
CREATE TABLE IF NOT EXISTS dental_chart_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    tooth_number integer NOT NULL CHECK (tooth_number >= 11 AND tooth_number <= 48),
    condition tooth_condition NOT NULL DEFAULT 'normal',
    updated_by uuid REFERENCES staff_members(id) ON DELETE SET NULL,
    updated_at timestamptz DEFAULT now(),
    UNIQUE(patient_id, tooth_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dental_chart_clinic_id ON dental_chart_entries(clinic_id);
CREATE INDEX IF NOT EXISTS idx_dental_chart_patient_id ON dental_chart_entries(patient_id);

-- Enable Row Level Security
ALTER TABLE dental_chart_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dental_chart_entries
CREATE POLICY "Staff can view dental chart in their clinic"
    ON dental_chart_entries FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can insert dental chart in their clinic"
    ON dental_chart_entries FOR INSERT
    WITH CHECK (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can update dental chart in their clinic"
    ON dental_chart_entries FOR UPDATE
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can delete dental chart in their clinic"
    ON dental_chart_entries FOR DELETE
    USING (public.is_staff_member_of_clinic(clinic_id));
