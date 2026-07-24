-- ============================================================
-- FIX: Reconcile pre-existing tables with our module expectations
-- The original migration (20260717000001) used CREATE TABLE IF NOT EXISTS.
-- For vital_signs_logs, pediatric_growth_records, and pediatric_vaccinations,
-- the tables already existed with different columns, so IF NOT EXISTS skipped them.
-- This migration adds the missing columns our code needs.
-- ============================================================

-- 1. vital_signs_logs: add columns our code expects
ALTER TABLE public.vital_signs_logs ADD COLUMN IF NOT EXISTS blood_pressure_systolic integer;
ALTER TABLE public.vital_signs_logs ADD COLUMN IF NOT EXISTS blood_pressure_diastolic integer;
ALTER TABLE public.vital_signs_logs ADD COLUMN IF NOT EXISTS heart_rate integer;
ALTER TABLE public.vital_signs_logs ADD COLUMN IF NOT EXISTS temperature_c numeric;
ALTER TABLE public.vital_signs_logs ADD COLUMN IF NOT EXISTS respiratory_rate integer;
ALTER TABLE public.vital_signs_logs ADD COLUMN IF NOT EXISTS oxygen_saturation numeric;
ALTER TABLE public.vital_signs_logs ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE public.vital_signs_logs ADD COLUMN IF NOT EXISTS height_cm numeric;
ALTER TABLE public.vital_signs_logs ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.vital_signs_logs ADD COLUMN IF NOT EXISTS recorded_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL;

-- Backfill from old column names if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vital_signs_logs' AND column_name = 'systolic_bp') THEN
    UPDATE public.vital_signs_logs SET blood_pressure_systolic = systolic_bp WHERE blood_pressure_systolic IS NULL AND systolic_bp IS NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vital_signs_logs' AND column_name = 'diastolic_bp') THEN
    UPDATE public.vital_signs_logs SET blood_pressure_diastolic = diastolic_bp WHERE blood_pressure_diastolic IS NULL AND diastolic_bp IS NOT NULL;
  END IF;
END $$;

-- Add RLS policies if missing
ALTER TABLE public.vital_signs_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can view vitals' AND tablename = 'vital_signs_logs') THEN
    CREATE POLICY "Staff can view vitals" ON public.vital_signs_logs FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can insert vitals' AND tablename = 'vital_signs_logs') THEN
    CREATE POLICY "Staff can insert vitals" ON public.vital_signs_logs FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can update vitals' AND tablename = 'vital_signs_logs') THEN
    CREATE POLICY "Staff can update vitals" ON public.vital_signs_logs FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can delete vitals' AND tablename = 'vital_signs_logs') THEN
    CREATE POLICY "Staff can delete vitals" ON public.vital_signs_logs FOR DELETE USING (is_staff_member_of_clinic(clinic_id));
  END IF;
END $$;

-- 2. pediatric_growth_records: add columns our code expects
ALTER TABLE public.pediatric_growth_records ADD COLUMN IF NOT EXISTS age_months integer;
ALTER TABLE public.pediatric_growth_records ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE public.pediatric_growth_records ADD COLUMN IF NOT EXISTS height_cm numeric;
ALTER TABLE public.pediatric_growth_records ADD COLUMN IF NOT EXISTS head_circumference_cm numeric;
ALTER TABLE public.pediatric_growth_records ADD COLUMN IF NOT EXISTS bmi numeric;
ALTER TABLE public.pediatric_growth_records ADD COLUMN IF NOT EXISTS bmi_percentile text;
ALTER TABLE public.pediatric_growth_records ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.pediatric_growth_records ADD COLUMN IF NOT EXISTS recorded_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL;

ALTER TABLE public.pediatric_growth_records ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can view peds growth' AND tablename = 'pediatric_growth_records') THEN
    CREATE POLICY "Staff can view peds growth" ON public.pediatric_growth_records FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can insert peds growth' AND tablename = 'pediatric_growth_records') THEN
    CREATE POLICY "Staff can insert peds growth" ON public.pediatric_growth_records FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can update peds growth' AND tablename = 'pediatric_growth_records') THEN
    CREATE POLICY "Staff can update peds growth" ON public.pediatric_growth_records FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can delete peds growth' AND tablename = 'pediatric_growth_records') THEN
    CREATE POLICY "Staff can delete peds growth" ON public.pediatric_growth_records FOR DELETE USING (is_staff_member_of_clinic(clinic_id));
  END IF;
END $$;

-- 3. pediatric_vaccinations: add columns our code expects
ALTER TABLE public.pediatric_vaccinations ADD COLUMN IF NOT EXISTS vaccine_name text;
ALTER TABLE public.pediatric_vaccinations ADD COLUMN IF NOT EXISTS dose_number integer;
ALTER TABLE public.pediatric_vaccinations ADD COLUMN IF NOT EXISTS given_date date;
ALTER TABLE public.pediatric_vaccinations ADD COLUMN IF NOT EXISTS next_due_date date;
ALTER TABLE public.pediatric_vaccinations ADD COLUMN IF NOT EXISTS batch_number text;
ALTER TABLE public.pediatric_vaccinations ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.pediatric_vaccinations ADD COLUMN IF NOT EXISTS recorded_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL;

-- Backfill vaccine_name from old 'vaccine' column if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pediatric_vaccinations' AND column_name = 'vaccine') THEN
    UPDATE public.pediatric_vaccinations SET vaccine_name = vaccine WHERE vaccine_name IS NULL AND vaccine IS NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pediatric_vaccinations' AND column_name = 'scheduled_date') THEN
    UPDATE public.pediatric_vaccinations SET next_due_date = scheduled_date WHERE next_due_date IS NULL AND scheduled_date IS NOT NULL;
  END IF;
END $$;

ALTER TABLE public.pediatric_vaccinations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can view peds vaccinations' AND tablename = 'pediatric_vaccinations') THEN
    CREATE POLICY "Staff can view peds vaccinations" ON public.pediatric_vaccinations FOR SELECT USING (is_staff_member_of_clinic(clinic_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can insert peds vaccinations' AND tablename = 'pediatric_vaccinations') THEN
    CREATE POLICY "Staff can insert peds vaccinations" ON public.pediatric_vaccinations FOR INSERT WITH CHECK (is_staff_member_of_clinic(clinic_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can update peds vaccinations' AND tablename = 'pediatric_vaccinations') THEN
    CREATE POLICY "Staff can update peds vaccinations" ON public.pediatric_vaccinations FOR UPDATE USING (is_staff_member_of_clinic(clinic_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can delete peds vaccinations' AND tablename = 'pediatric_vaccinations') THEN
    CREATE POLICY "Staff can delete peds vaccinations" ON public.pediatric_vaccinations FOR DELETE USING (is_staff_member_of_clinic(clinic_id));
  END IF;
END $$;

-- 4. Add indexes for the columns we query on
CREATE INDEX IF NOT EXISTS idx_vitals_clinic ON public.vital_signs_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient ON public.vital_signs_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_peds_growth_clinic ON public.pediatric_growth_records(clinic_id);
CREATE INDEX IF NOT EXISTS idx_peds_growth_patient ON public.pediatric_growth_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_peds_vax_clinic ON public.pediatric_vaccinations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_peds_vax_patient ON public.pediatric_vaccinations(patient_id);
