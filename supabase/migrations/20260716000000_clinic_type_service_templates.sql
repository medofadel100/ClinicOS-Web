-- Additive migration: Default service templates per clinic type

-- 1) Table
CREATE TABLE IF NOT EXISTS public.clinic_type_service_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_type_id uuid NOT NULL REFERENCES public.clinic_types(id) ON DELETE CASCADE,
  category_name text NOT NULL,
  name text NOT NULL,
  description text,
  suggested_price_egp numeric,
  duration_minutes integer DEFAULT 30,
  order_index integer DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clinic_type_service_templates ENABLE ROW LEVEL SECURITY;

-- 2) RLS
-- Platform admins (service role) should be able to manage templates.
-- Clinic-side roles should not be able to read the template table directly.

-- NOTE: We rely on the standard Supabase convention that the service-role JWT
-- contains role='service_role'. Clinic users should not have this.
CREATE POLICY "Platform admins manage clinic_type_service_templates" 
  ON public.clinic_type_service_templates
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');


-- 3) Trigger: updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_clinic_type_service_templates_updated_at ON public.clinic_type_service_templates;

CREATE TRIGGER trg_clinic_type_service_templates_updated_at
BEFORE UPDATE ON public.clinic_type_service_templates
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 4) Placeholder seed data (INSERT only)
-- This inserts 4 generic items per existing clinic type.
-- Ahmed must replace with medically accurate per-specialty lists later.

DO $$
DECLARE
  ct RECORD;
BEGIN
  FOR ct IN SELECT id FROM public.clinic_types WHERE is_active = true LOOP
    -- Category 1: General Checkups
    INSERT INTO public.clinic_type_service_templates (
      clinic_type_id, category_name, name, description, suggested_price_egp, duration_minutes, order_index
    ) VALUES
      (ct.id, 'General Checkups', 'كشف أولي', 'كشف تمهيدي/مبدئي (بيانات placeholder)', 0, 30, 0),
      (ct.id, 'General Checkups', 'استشارة متابعة', 'متابعة بعد الكشف الأول (بيانات placeholder)', 0, 20, 1),
      (ct.id, 'General Checkups', 'كشف طارئ', 'كشف عاجل/طارئ (بيانات placeholder)', 0, 30, 2),
      -- Category 2: Procedures / Basic
      (ct.id, 'Procedures (Basic)', 'إجراء أساسي', 'إجراء أساسي/مختصر (بيانات placeholder)', 0, 30, 0);
  END LOOP;
END $$;

