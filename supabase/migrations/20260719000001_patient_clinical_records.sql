-- Medical Encounters and Procedures Tracking

-- 1. Patient Encounters (Visits)
CREATE TABLE public.patient_encounters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id uuid REFERENCES public.staff_members(id),
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    encounter_date timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    chief_complaint text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Patient Clinical Notes
CREATE TABLE public.patient_clinical_notes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    encounter_id uuid REFERENCES public.patient_encounters(id) ON DELETE CASCADE,
    note_type text NOT NULL CHECK (note_type IN ('subjective', 'objective', 'assessment', 'plan', 'general', 'dental', 'orthopedic', 'ophthalmology', 'obgyn')),
    content jsonb NOT NULL, -- Flexible JSON for different specialty data (e.g. { "left_eye": "20/20", "right_eye": "20/40" } or { "tooth": 18, "surface": "O" })
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Patient Procedures (Actual procedures done during an encounter)
CREATE TABLE public.patient_procedures (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    encounter_id uuid REFERENCES public.patient_encounters(id) ON DELETE CASCADE,
    service_template_id uuid REFERENCES public.clinic_type_service_templates(id),
    custom_procedure_name text, -- If not using a template
    status text DEFAULT 'completed' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_patient_encounters_patient ON public.patient_encounters(patient_id);
CREATE INDEX idx_patient_clinical_notes_encounter ON public.patient_clinical_notes(encounter_id);
CREATE INDEX idx_patient_procedures_encounter ON public.patient_procedures(encounter_id);

-- RLS Policies
ALTER TABLE public.patient_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to clinic staff for encounters" ON public.patient_encounters FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM public.clinic_staff_memberships WHERE staff_member_id IN (SELECT id FROM public.staff_members WHERE auth_user_id = auth.uid()))
);

CREATE POLICY "Allow full access to clinic staff for notes" ON public.patient_clinical_notes FOR ALL USING (
    encounter_id IN (SELECT id FROM public.patient_encounters WHERE clinic_id IN (SELECT clinic_id FROM public.clinic_staff_memberships WHERE staff_member_id IN (SELECT id FROM public.staff_members WHERE auth_user_id = auth.uid())))
);

CREATE POLICY "Allow full access to clinic staff for procedures" ON public.patient_procedures FOR ALL USING (
    encounter_id IN (SELECT id FROM public.patient_encounters WHERE clinic_id IN (SELECT clinic_id FROM public.clinic_staff_memberships WHERE staff_member_id IN (SELECT id FROM public.staff_members WHERE auth_user_id = auth.uid())))
);
