-- Ensure the clinic_serials table exists before the function references it.
CREATE TABLE IF NOT EXISTS public.clinic_serials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'cancelled')),
    plan_id uuid REFERENCES public.plans(id),
    clinic_id uuid REFERENCES public.clinics(id) ON DELETE SET NULL,
    used_at timestamptz,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.clinic_serials ENABLE ROW LEVEL SECURITY;

DROP FUNCTION IF EXISTS public.verify_serial_code(text);

CREATE OR REPLACE FUNCTION public.verify_serial_code(p_serial_code text)
RETURNS TABLE (
  id uuid,
  code text,
  status text,
  plan_id uuid,
  plan_name_en text,
  plan_name_ar text,
  plan_price_egp numeric,
  plan_billing_cycle text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    cs.id,
    cs.code,
    cs.status::text,
    cs.plan_id,
    p.name_en,
    p.name_ar,
    p.price_egp,
    p.billing_cycle::text,
    cs.created_at
  FROM public.clinic_serials cs
  JOIN public.plans p ON p.id = cs.plan_id
  WHERE cs.code = upper(trim(p_serial_code))
    AND cs.status = 'unused';
$$;

GRANT EXECUTE ON FUNCTION public.verify_serial_code(text) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_serial_code(text) TO authenticated;
