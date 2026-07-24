-- ============================================================
-- Specialty examination tables for all clinic types
-- Each table follows the same pattern:
--   clinic_id, patient_id, staff_member references
--   specialty-specific columns
--   created_at / updated_at timestamps
--   RLS policies using is_staff_member_of_clinic()
-- ============================================================

-- 1. ORTHOPEDICS: musculoskeletal examinations
CREATE TABLE IF NOT EXISTS public.orthopedic_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  body_region text NOT NULL,
  injury_type text NOT NULL,
  fracture_type text,
  severity text DEFAULT 'moderate',
  diagnosis text,
  treatment_plan text,
  xray_urls text[],
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ortho_exams_clinic ON public.orthopedic_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_ortho_exams_patient ON public.orthopedic_examinations(patient_id);

ALTER TABLE public.orthopedic_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view ortho exams" ON public.orthopedic_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert ortho exams" ON public.orthopedic_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update ortho exams" ON public.orthopedic_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete ortho exams" ON public.orthopedic_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 2. OPHTHALMOLOGY: eye examinations
CREATE TABLE IF NOT EXISTS public.ophthalmology_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  eye_side text NOT NULL CHECK (eye_side IN ('left', 'right', 'both')),
  visual_acuity_near text,
  visual_acuity_far text,
  iop numeric,
  lens_condition text,
  retina_notes text,
  diagnosis text,
  prescription text,
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eye_exams_clinic ON public.ophthalmology_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_eye_exams_patient ON public.ophthalmology_examinations(patient_id);

ALTER TABLE public.ophthalmology_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view eye exams" ON public.ophthalmology_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert eye exams" ON public.ophthalmology_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update eye exams" ON public.ophthalmology_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete eye exams" ON public.ophthalmology_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 3. DERMATOLOGY: skin examinations
CREATE TABLE IF NOT EXISTS public.dermatology_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  body_area text NOT NULL,
  lesion_type text NOT NULL,
  lesion_size text,
  color_description text,
  severity text DEFAULT 'mild',
  duration text,
  symptoms text,
  diagnosis text,
  treatment text,
  photo_urls text[],
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_derm_exams_clinic ON public.dermatology_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_derm_exams_patient ON public.dermatology_examinations(patient_id);

ALTER TABLE public.dermatology_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view derm exams" ON public.dermatology_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert derm exams" ON public.dermatology_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update derm exams" ON public.dermatology_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete derm exams" ON public.dermatology_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 4. PEDIATRICS: growth records + milestones + vaccinations
CREATE TABLE IF NOT EXISTS public.pediatric_growth_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  age_months integer,
  weight_kg numeric,
  height_cm numeric,
  head_circumference_cm numeric,
  bmi numeric,
  bmi_percentile text,
  notes text,
  recorded_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_peds_growth_clinic ON public.pediatric_growth_records(clinic_id);
CREATE INDEX IF NOT EXISTS idx_peds_growth_patient ON public.pediatric_growth_records(patient_id);

ALTER TABLE public.pediatric_growth_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view peds growth" ON public.pediatric_growth_records FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert peds growth" ON public.pediatric_growth_records FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update peds growth" ON public.pediatric_growth_records FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete peds growth" ON public.pediatric_growth_records FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

CREATE TABLE IF NOT EXISTS public.pediatric_vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  dose_number integer,
  given_date date NOT NULL DEFAULT CURRENT_DATE,
  next_due_date date,
  batch_number text,
  notes text,
  recorded_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_peds_vax_clinic ON public.pediatric_vaccinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_peds_vax_patient ON public.pediatric_vaccinations(patient_id);

ALTER TABLE public.pediatric_vaccinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view peds vaccinations" ON public.pediatric_vaccinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert peds vaccinations" ON public.pediatric_vaccinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update peds vaccinations" ON public.pediatric_vaccinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete peds vaccinations" ON public.pediatric_vaccinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 5. VITAL SIGNS (General Practice, Medical Center, Pulmonology, Cardiology, etc.)
CREATE TABLE IF NOT EXISTS public.vital_signs_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  heart_rate integer,
  temperature_c numeric,
  respiratory_rate integer,
  oxygen_saturation numeric,
  weight_kg numeric,
  height_cm numeric,
  notes text,
  recorded_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_vitals_clinic ON public.vital_signs_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON public.vital_signs_logs(patient_id);

ALTER TABLE public.vital_signs_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view vitals" ON public.vital_signs_logs FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert vitals" ON public.vital_signs_logs FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update vitals" ON public.vital_signs_logs FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete vitals" ON public.vital_signs_logs FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 6. OB/GYN examinations
CREATE TABLE IF NOT EXISTS public.obgyn_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  examination_date date NOT NULL DEFAULT CURRENT_DATE,
  pregnancy_week integer,
  last_menstrual_period date,
  fundal_height numeric,
  fetal_heart_rate integer,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  weight_kg numeric,
  urine_protein text,
  urine_glucose text,
  edema text,
  diagnosis text,
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_obgyn_clinic ON public.obgyn_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_obgyn_patient ON public.obgyn_examinations(patient_id);

ALTER TABLE public.obgyn_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view obgyn exams" ON public.obgyn_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert obgyn exams" ON public.obgyn_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update obgyn exams" ON public.obgyn_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete obgyn exams" ON public.obgyn_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 7. PSYCHOLOGY session notes
CREATE TABLE IF NOT EXISTS public.psychology_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_date timestamptz NOT NULL DEFAULT now(),
  session_number integer,
  session_type text DEFAULT 'individual',
  chief_complaint text,
  mood_scale integer CHECK (mood_scale >= 1 AND mood_scale <= 10),
  anxiety_scale integer CHECK (anxiety_scale >= 1 AND anxiety_scale <= 10),
  observations text,
  interventions text,
  treatment_plan text,
  next_session_date date,
  notes text,
  therapist_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_psych_clinic ON public.psychology_sessions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_psych_patient ON public.psychology_sessions(patient_id);

ALTER TABLE public.psychology_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view psych sessions" ON public.psychology_sessions FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert psych sessions" ON public.psychology_sessions FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update psych sessions" ON public.psychology_sessions FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete psych sessions" ON public.psychology_sessions FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 8. UROLOGY examinations
CREATE TABLE IF NOT EXISTS public.urology_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  examination_date date NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint text,
  psa_level numeric,
  urinalysis_result text,
  ultrasound_notes text,
  diagnosis text,
  treatment text,
  follow_up_date date,
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_uro_clinic ON public.urology_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_uro_patient ON public.urology_examinations(patient_id);

ALTER TABLE public.urology_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view uro exams" ON public.urology_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert uro exams" ON public.urology_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update uro exams" ON public.urology_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete uro exams" ON public.urology_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 9. ENT examinations
CREATE TABLE IF NOT EXISTS public.ent_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  examination_date date NOT NULL DEFAULT CURRENT_DATE,
  ear_findings text,
  nose_findings text,
  throat_findings text,
  hearing_test text,
  audiometry_notes text,
  diagnosis text,
  treatment text,
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ent_clinic ON public.ent_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_ent_patient ON public.ent_examinations(patient_id);

ALTER TABLE public.ent_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view ent exams" ON public.ent_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert ent exams" ON public.ent_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update ent exams" ON public.ent_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete ent exams" ON public.ent_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 10. PULMONOLOGY examinations
CREATE TABLE IF NOT EXISTS public.pulmonology_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  examination_date date NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint text,
  oxygen_saturation numeric,
  respiratory_rate integer,
  lung_sounds text,
  peak_flow numeric,
  chest_xray_notes text,
  pulmonary_function_test text,
  diagnosis text,
  treatment text,
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pulm_clinic ON public.pulmonology_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_pulm_patient ON public.pulmonology_examinations(patient_id);

ALTER TABLE public.pulmonology_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view pulm exams" ON public.pulmonology_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert pulm exams" ON public.pulmonology_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update pulm exams" ON public.pulmonology_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete pulm exams" ON public.pulmonology_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 11. GASTROENTEROLOGY examinations
CREATE TABLE IF NOT EXISTS public.gastro_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  examination_date date NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint text,
  abdominal_examination text,
  endoscopy_notes text,
  colonoscopy_notes text,
  liver_function text,
  h_pylori_status text,
  diagnosis text,
  treatment text,
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gi_clinic ON public.gastro_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_gi_patient ON public.gastro_examinations(patient_id);

ALTER TABLE public.gastro_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view gi exams" ON public.gastro_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert gi exams" ON public.gastro_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update gi exams" ON public.gastro_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete gi exams" ON public.gastro_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 12. ENDOCRINOLOGY examinations
CREATE TABLE IF NOT EXISTS public.endocrine_examinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  examination_date date NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint text,
  fasting_glucose numeric,
  hba1c numeric,
  thyroid_tsh numeric,
  thyroid_t3 numeric,
  thyroid_t4 numeric,
  cortisol_level numeric,
  diagnosis text,
  treatment text,
  notes text,
  examined_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_endo_clinic ON public.endocrine_examinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_endo_patient ON public.endocrine_examinations(patient_id);

ALTER TABLE public.endocrine_examinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view endo exams" ON public.endocrine_examinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert endo exams" ON public.endocrine_examinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update endo exams" ON public.endocrine_examinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete endo exams" ON public.endocrine_examinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 13. ONCOLOGY notes
CREATE TABLE IF NOT EXISTS public.oncology_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  note_date timestamptz NOT NULL DEFAULT now(),
  cancer_type text,
  cancer_stage text,
  tumor_location text,
  treatment_type text,
  chemotherapy_cycle integer,
  radiation_sessions integer,
  lab_results text,
  imaging_notes text,
  performance_status text,
  notes text,
  recorded_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_onco_clinic ON public.oncology_notes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_onco_patient ON public.oncology_notes(patient_id);

ALTER TABLE public.oncology_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view onco notes" ON public.oncology_notes FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert onco notes" ON public.oncology_notes FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update onco notes" ON public.oncology_notes FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete onco notes" ON public.oncology_notes FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 14. HEMATOLOGY notes
CREATE TABLE IF NOT EXISTS public.hematology_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  note_date timestamptz NOT NULL DEFAULT now(),
  cbc_results text,
  hemoglobin numeric,
  wbc_count numeric,
  platelet_count numeric,
  coagulation_profile text,
  blood_smear_notes text,
  diagnosis text,
  treatment text,
  notes text,
  recorded_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_heme_clinic ON public.hematology_notes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_heme_patient ON public.hematology_notes(patient_id);

ALTER TABLE public.hematology_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view heme notes" ON public.hematology_notes FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert heme notes" ON public.hematology_notes FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update heme notes" ON public.hematology_notes FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete heme notes" ON public.hematology_notes FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 15. CLINICAL NUTRITION plans
CREATE TABLE IF NOT EXISTS public.nutrition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  plan_date date NOT NULL DEFAULT CURRENT_DATE,
  height_cm numeric,
  weight_kg numeric,
  bmi numeric,
  bmr numeric,
  daily_calories_target integer,
  protein_target_g numeric,
  carbs_target_g numeric,
  fat_target_g numeric,
  dietary_restrictions text,
  meal_plan text,
  supplements text,
  notes text,
  created_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nutr_clinic ON public.nutrition_plans(clinic_id);
CREATE INDEX IF NOT EXISTS idx_nutr_patient ON public.nutrition_plans(patient_id);

ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view nutrition plans" ON public.nutrition_plans FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert nutrition plans" ON public.nutrition_plans FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update nutrition plans" ON public.nutrition_plans FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete nutrition plans" ON public.nutrition_plans FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- 16. NEUROSURGERY notes
CREATE TABLE IF NOT EXISTS public.neurosurgery_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  note_date timestamptz NOT NULL DEFAULT now(),
  neurological_exam text,
  gcs_score integer,
  imaging_type text,
  imaging_findings text,
  surgical_plan text,
  post_op_notes text,
  complications text,
  follow_up_date date,
  notes text,
  recorded_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nsurg_clinic ON public.neurosurgery_notes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_nsurg_patient ON public.neurosurgery_notes(patient_id);

ALTER TABLE public.neurosurgery_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view nsurg notes" ON public.neurosurgery_notes FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert nsurg notes" ON public.neurosurgery_notes FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update nsurg notes" ON public.neurosurgery_notes FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete nsurg notes" ON public.neurosurgery_notes FOR DELETE USING (is_staff_member_of_clinic(clinic_id));

-- Updated_at trigger for tables that need it
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to specialty tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orthopedic_examinations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ophthalmology_examinations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.dermatology_examinations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
