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
  v_auth_uid uuid;
  v_staff_id uuid;
BEGIN
  -- Get email and uid from auth session
  v_owner_email := auth.email();
  v_auth_uid := auth.uid();
  
  IF v_owner_email IS NULL OR v_auth_uid IS NULL THEN
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

  -- Create subscription
  IF chosen_plan_id IS NULL THEN
    -- Trial subscription (no plan selected yet)
    INSERT INTO public.clinic_subscriptions (
      clinic_id,
      plan_id,
      status,
      trial_ends_at,
      price_locked_egp,
      current_period_start,
      current_period_end
    ) VALUES (
      v_clinic_id,
      NULL,
      'trial',
      now() + interval '7 days',
      0,
      now(),
      now() + interval '7 days'
    );
  ELSE
    -- Pending confirmation subscription (plan selected)
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
  END IF;

  -- Link Owner (Create Staff Member & Membership)
  INSERT INTO public.staff_members (auth_user_id, full_name, phone)
  VALUES (v_auth_uid, owner_full_name, owner_phone)
  ON CONFLICT (auth_user_id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone
  RETURNING id INTO v_staff_id;

  INSERT INTO public.clinic_staff_memberships (staff_member_id, clinic_id, role)
  VALUES (v_staff_id, v_clinic_id, 'owner');

  -- Log the action
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
