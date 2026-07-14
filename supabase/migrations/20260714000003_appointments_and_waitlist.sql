-- Checkpoint 4: Appointments and Waitlist

-- ENUMS
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE created_via AS ENUM ('staff', 'whatsapp_bot');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE waitlist_status AS ENUM ('waiting', 'notified', 'booked', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. appointments
CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    membership_id uuid NOT NULL REFERENCES clinic_staff_memberships(id) ON DELETE CASCADE,
    service_id uuid NOT NULL REFERENCES clinic_services(id) ON DELETE RESTRICT,
    scheduled_at timestamptz NOT NULL,
    duration_minutes integer NOT NULL DEFAULT 30,
    status appointment_status NOT NULL DEFAULT 'scheduled',
    created_via created_via NOT NULL DEFAULT 'staff',
    created_at timestamptz DEFAULT now()
);

-- 2. patient_waitlist
CREATE TABLE IF NOT EXISTS patient_waitlist (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    membership_id uuid REFERENCES clinic_staff_memberships(id) ON DELETE SET NULL,
    desired_from date NOT NULL,
    desired_to date NOT NULL,
    status waitlist_status NOT NULL DEFAULT 'waiting',
    created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_membership_id ON appointments(membership_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments(scheduled_at);

CREATE INDEX IF NOT EXISTS idx_waitlist_clinic_id ON patient_waitlist(clinic_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON patient_waitlist(status);


-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_waitlist ENABLE ROW LEVEL SECURITY;


-- RLS Policies for appointments
CREATE POLICY "Staff can view appointments in their clinic"
    ON appointments FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can insert appointments in their clinic"
    ON appointments FOR INSERT
    WITH CHECK (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can update appointments in their clinic"
    ON appointments FOR UPDATE
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can delete appointments in their clinic"
    ON appointments FOR DELETE
    USING (public.is_staff_member_of_clinic(clinic_id));


-- RLS Policies for patient_waitlist
CREATE POLICY "Staff can view waitlist in their clinic"
    ON patient_waitlist FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can insert waitlist in their clinic"
    ON patient_waitlist FOR INSERT
    WITH CHECK (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can update waitlist in their clinic"
    ON patient_waitlist FOR UPDATE
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can delete waitlist in their clinic"
    ON patient_waitlist FOR DELETE
    USING (public.is_staff_member_of_clinic(clinic_id));
