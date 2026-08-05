-- =============================================================================
-- Migration: Add created_by to patients
-- Fixes app/api/quick-patient/route.ts which inserts created_by into patients
-- (column did not exist -> 500 error when using Quick Add Patient).
-- =============================================================================

ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_patients_created_by ON public.patients(created_by);
