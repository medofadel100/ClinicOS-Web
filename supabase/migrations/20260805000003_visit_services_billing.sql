-- Extend patient_procedures to support priced visit services (clinical workspace -> invoice)
ALTER TABLE public.patient_procedures
  ADD COLUMN IF NOT EXISTS clinic_service_id uuid REFERENCES public.clinic_services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_name text,
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit_price_egp numeric(12,2) NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_patient_procedures_encounter ON public.patient_procedures(encounter_id);
