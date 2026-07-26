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
