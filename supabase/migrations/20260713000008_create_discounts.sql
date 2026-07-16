-- ENUMs
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed_amount');
CREATE TYPE public.discount_applies_to AS ENUM ('new_subscription', 'renewal', 'both');

-- Table: discount_codes
CREATE TABLE public.discount_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL,
  description text NULL,
  discount_type public.discount_type NOT NULL,
  discount_value numeric(10,2) NOT NULL,
  applies_to public.discount_applies_to NOT NULL,
  valid_from timestamp with time zone NOT NULL DEFAULT now(),
  valid_until timestamp with time zone NULL,
  max_uses integer NULL,
  times_used integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT discount_codes_pkey PRIMARY KEY (id),
  CONSTRAINT discount_codes_code_key UNIQUE (code),
  CONSTRAINT discount_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.platform_admins(id) ON DELETE CASCADE
);

-- RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins and accountants can manage discount codes"
  ON public.discount_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_admins
      WHERE platform_admins.auth_user_id = auth.uid()
      AND platform_admins.role IN ('super_admin', 'accountant')
      AND platform_admins.is_active = true
    )
  );

CREATE POLICY "Support admins can view discount codes"
  ON public.discount_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_admins
      WHERE platform_admins.auth_user_id = auth.uid()
      AND platform_admins.role = 'support'
      AND platform_admins.is_active = true
    )
  );

-- Add column to clinic_subscriptions
ALTER TABLE public.clinic_subscriptions 
ADD COLUMN discount_code_id uuid NULL,
ADD CONSTRAINT clinic_subscriptions_discount_code_id_fkey FOREIGN KEY (discount_code_id) REFERENCES public.discount_codes(id) ON DELETE SET NULL;

-- Function to safely increment discount code usage
CREATE OR REPLACE FUNCTION public.increment_discount_usage(code_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.discount_codes
  SET times_used = times_used + 1
  WHERE id = code_id;
$$;
