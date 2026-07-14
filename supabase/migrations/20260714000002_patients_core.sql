-- Migration: Patients, Medical History, and Patient Files
-- Description: Creates the core patient records, medical history extension, and file attachments tables.

-- ENUMS (if not exist, though in postgres we usually create them safely)
DO $$ BEGIN
    CREATE TYPE gender AS ENUM ('male', 'female');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE file_category AS ENUM ('xray', 'prescription', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE upload_source AS ENUM ('staff', 'whatsapp');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. patients
CREATE TABLE IF NOT EXISTS patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    phone text,
    date_of_birth date,
    gender gender,
    parent_patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
    notes text,
    registered_at timestamptz DEFAULT now()
);

-- 2. patient_medical_history
-- This handles the systemic diseases, allergies, current medications required by CP3
CREATE TABLE IF NOT EXISTS patient_medical_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE UNIQUE,
    systemic_diseases text,
    allergies text,
    current_medications text,
    notes text,
    updated_at timestamptz DEFAULT now()
);

-- 3. patient_uploaded_files
CREATE TABLE IF NOT EXISTS patient_uploaded_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    file_url text NOT NULL,
    category file_category DEFAULT 'other',
    uploaded_via upload_source DEFAULT 'staff',
    review_status review_status DEFAULT 'approved',
    reviewed_by uuid REFERENCES staff_members(id) ON DELETE SET NULL,
    reviewed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_patient_uploaded_files_clinic_id ON patient_uploaded_files(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_uploaded_files_patient_id ON patient_uploaded_files(patient_id);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_uploaded_files ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the user is part of the clinic
CREATE OR REPLACE FUNCTION public.is_staff_member_of_clinic(clinic_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM clinic_staff_memberships m
    JOIN staff_members s ON m.staff_member_id = s.id
    WHERE s.auth_user_id = auth.uid()
      AND m.clinic_id = clinic_uuid
      AND m.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RLS Policies for patients
CREATE POLICY "Staff can view all patients in their clinic"
    ON patients FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can insert patients in their clinic"
    ON patients FOR INSERT
    WITH CHECK (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can update patients in their clinic"
    ON patients FOR UPDATE
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can delete patients in their clinic"
    ON patients FOR DELETE
    USING (public.is_staff_member_of_clinic(clinic_id));


-- RLS Policies for patient_medical_history
-- Access is tied to the parent patient's clinic_id.
CREATE POLICY "Staff can view medical history of patients in their clinic"
    ON patient_medical_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_medical_history.patient_id
            AND public.is_staff_member_of_clinic(p.clinic_id)
        )
    );

CREATE POLICY "Staff can insert medical history of patients in their clinic"
    ON patient_medical_history FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_id
            AND public.is_staff_member_of_clinic(p.clinic_id)
        )
    );

CREATE POLICY "Staff can update medical history of patients in their clinic"
    ON patient_medical_history FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_medical_history.patient_id
            AND public.is_staff_member_of_clinic(p.clinic_id)
        )
    );

CREATE POLICY "Staff can delete medical history of patients in their clinic"
    ON patient_medical_history FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.id = patient_medical_history.patient_id
            AND public.is_staff_member_of_clinic(p.clinic_id)
        )
    );


-- RLS Policies for patient_uploaded_files
CREATE POLICY "Staff can view files in their clinic"
    ON patient_uploaded_files FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can insert files in their clinic"
    ON patient_uploaded_files FOR INSERT
    WITH CHECK (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can update files in their clinic"
    ON patient_uploaded_files FOR UPDATE
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can delete files in their clinic"
    ON patient_uploaded_files FOR DELETE
    USING (public.is_staff_member_of_clinic(clinic_id));
