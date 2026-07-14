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
  IF chosen_plan_id IS NULL THEN
    RAISE EXCEPTION 'A plan must be chosen';
  END IF;

  SELECT is_active, price_egp INTO v_plan_active, v_plan_price
  FROM public.plans
  WHERE id = chosen_plan_id;

  IF NOT FOUND OR NOT v_plan_active THEN
    RAISE EXCEPTION 'Invalid or inactive plan';
  END IF;

  -- Create clinic (status always trial initially)
  INSERT INTO public.clinics (
    name,
    clinic_type_id,
    status,
    owner_full_name,
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

  -- Create subscription (billing_cycle removed, current_period added)
  INSERT INTO public.clinic_subscriptions (
    clinic_id,
    plan_id,
    status,
    pending_confirmation_expires_at,
    price_locked_egp,
    current_period_start,
    current_period_end
  ) VALUES (
    v_clinic_id,
    chosen_plan_id,
    'pending_confirmation',
    now() + interval '2 days',
    v_plan_price,
    now(),
    now() + interval '1 month'
  );

  -- Log the action (audit_log instead of audit_logs, action instead of action_type)
  INSERT INTO public.audit_log (
    actor_admin_id,
    action,
    target_table,
    target_id,
    new_value
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
