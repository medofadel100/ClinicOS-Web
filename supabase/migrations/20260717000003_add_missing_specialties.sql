-- 1. CARDIOLOGY examinations
CREATE TABLE IF NOT EXISTS public.cardiology_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  examination_date date NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint text,
  blood_pressure text,
  heart_rate integer,
  ecg_notes text,
  echocardiogram_notes text,
  ejection_fraction numeric,
  diagnosis text,
  treatment text,
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cardio_clinic ON public.cardiology_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_cardio_patient ON public.cardiology_examinations(patient_id);

ALTER TABLE public.cardiology_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view cardio exams" ON public.cardiology_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert cardio exams" ON public.cardiology_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update cardio exams" ON public.cardiology_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete cardio exams" ON public.cardiology_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 2. NEUROLOGY examinations
CREATE TABLE IF NOT EXISTS public.neurology_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  examination_date date NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint text,
  mental_status text,
  cranial_nerves text,
  motor_function text,
  sensory_function text,
  reflexes text,
  coordination text,
  eeg_notes text,
  mri_notes text,
  diagnosis text,
  treatment text,
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_neuro_clinic ON public.neurology_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_neuro_patient ON public.neurology_examinations(patient_id);

ALTER TABLE public.neurology_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view neuro exams" ON public.neurology_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert neuro exams" ON public.neurology_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update neuro exams" ON public.neurology_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete neuro exams" ON public.neurology_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 3. PHYSICAL THERAPY sessions
CREATE TABLE IF NOT EXISTS public.physical_therapy_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint text,
  pain_scale integer CHECK (pain_scale >= 0 AND pain_scale <= 10),
  range_of_motion text,
  muscle_strength text,
  treatment_modalities text,
  exercises_performed text,
  home_exercise_plan text,
  progress_notes text,
  therapist_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pt_clinic ON public.physical_therapy_sessions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pt_patient ON public.physical_therapy_sessions(patient_id);

ALTER TABLE public.physical_therapy_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view pt sessions" ON public.physical_therapy_sessions FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert pt sessions" ON public.physical_therapy_sessions FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update pt sessions" ON public.physical_therapy_sessions FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete pt sessions" ON public.physical_therapy_sessions FOR DELETE USING (is_staff_member_of_clinic(clinic_id));
