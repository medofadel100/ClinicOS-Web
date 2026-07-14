-- 1. RLS policies for anonymous read access
-- clinic_types
CREATE POLICY "Allow public read of active clinic_types" ON public.clinic_types
  FOR SELECT TO anon USING (is_active = true);

-- plans
CREATE POLICY "Allow public read of active plans" ON public.plans
  FOR SELECT TO anon USING (is_active = true);

-- plan_features
CREATE POLICY "Allow public read of active plan_features" ON public.plan_features
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.plans p WHERE p.id = plan_features.plan_id AND p.is_active = true
    )
    AND
    EXISTS (
      SELECT 1 FROM public.features f WHERE f.id = plan_features.feature_id AND f.is_active = true
    )
  );

-- plan_limits
CREATE POLICY "Allow public read of active plan_limits" ON public.plan_limits
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.plans p WHERE p.id = plan_limits.plan_id AND p.is_active = true
    )
  );

-- features
CREATE POLICY "Allow public read of active features" ON public.features
  FOR SELECT TO anon USING (is_active = true);

-- 2. Add pending_confirmation to subscription_status
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'pending_confirmation';

-- 3. Add pending_confirmation_expires_at to clinic_subscriptions
ALTER TABLE public.clinic_subscriptions
ADD COLUMN IF NOT EXISTS pending_confirmation_expires_at timestamptz;

-- 4. Create create_clinic_self_signup RPC function
CREATE OR REPLACE FUNCTION public.create_clinic_self_signup(
  clinic_name text,
  clinic_type_id uuid,
  owner_full_name text,
  owner_phone text,
  chosen_plan_id uuid default null
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clinic_id uuid;
  v_owner_email text;
  v_plan_price numeric;
  v_clinic_type_active boolean;
  v_plan_active boolean;
BEGIN
  -- Get email from auth session
  v_owner_email := auth.email();
  
  IF v_owner_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify clinic type
  SELECT is_active INTO v_clinic_type_active
  FROM public.clinic_types
  WHERE id = clinic_type_id;

  IF NOT FOUND OR NOT v_clinic_type_active THEN
    RAISE EXCEPTION 'Invalid or inactive clinic type';
  END IF;

  -- Verify plan if chosen
  IF chosen_plan_id IS NOT NULL THEN
    SELECT is_active, price_egp INTO v_plan_active, v_plan_price
    FROM public.plans
    WHERE id = chosen_plan_id;

    IF NOT FOUND OR NOT v_plan_active THEN
      RAISE EXCEPTION 'Invalid or inactive plan';
    END IF;
  END IF;

  -- Create clinic (status always trial initially)
  INSERT INTO public.clinics (
    name,
    clinic_type_id,
    status,
    owner_name,
    owner_email,
    owner_phone
  ) VALUES (
    clinic_name,
    clinic_type_id,
    'trial',
    owner_full_name,
    v_owner_email,
    owner_phone
  ) RETURNING id INTO v_clinic_id;

  -- Create subscription
  IF chosen_plan_id IS NULL THEN
    -- Trial subscription
    INSERT INTO public.clinic_subscriptions (
      clinic_id,
      status,
      trial_ends_at,
      price_locked_egp,
      billing_cycle
    ) VALUES (
      v_clinic_id,
      'trial',
      now() + interval '7 days',
      0,
      'monthly'
    );
  ELSE
    -- Pending confirmation subscription
    INSERT INTO public.clinic_subscriptions (
      clinic_id,
      plan_id,
      status,
      pending_confirmation_expires_at,
      price_locked_egp,
      billing_cycle
    ) VALUES (
      v_clinic_id,
      chosen_plan_id,
      'pending_confirmation',
      now() + interval '2 days',
      v_plan_price,
      (SELECT billing_cycle FROM public.plans WHERE id = chosen_plan_id)
    );
  END IF;

  -- Log the action
  INSERT INTO public.audit_logs (
    actor_admin_id,
    action_type,
    table_name,
    record_id,
    new_data
  ) VALUES (
    NULL,
    'self_signup',
    'clinics',
    v_clinic_id,
    jsonb_build_object(
      'clinic_name', clinic_name,
      'chosen_plan_id', chosen_plan_id
    )
  );

  RETURN v_clinic_id;
END;
$$;
