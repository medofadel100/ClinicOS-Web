-- 1. Add slug column (nullable temporarily for backfill)
ALTER TABLE public.clinics ADD COLUMN slug text UNIQUE;

-- 2. Backfill existing clinics
CREATE OR REPLACE FUNCTION public.generate_slug(str text) RETURNS text AS $$
BEGIN
  -- Lowercase and replace spaces/non-alphanumeric with hyphens
  RETURN trim(both '-' from regexp_replace(lower(str), '[^a-z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  v_clinic record;
  v_base_slug text;
  v_slug text;
  v_counter int;
BEGIN
  FOR v_clinic IN SELECT * FROM public.clinics WHERE slug IS NULL LOOP
    v_base_slug := COALESCE(NULLIF(public.generate_slug(v_clinic.name), ''), 'clinic');
    v_slug := v_base_slug;
    v_counter := 1;
    
    WHILE EXISTS (SELECT 1 FROM public.clinics WHERE slug = v_slug AND id != v_clinic.id) LOOP
      v_slug := v_base_slug || '-' || v_counter;
      v_counter := v_counter + 1;
    END LOOP;
    
    UPDATE public.clinics SET slug = v_slug WHERE id = v_clinic.id;
  END LOOP;
END $$;

-- 3. Make slug NOT NULL
ALTER TABLE public.clinics ALTER COLUMN slug SET NOT NULL;

-- 4. Create check_slug_available RPC
CREATE OR REPLACE FUNCTION public.check_slug_available(p_slug text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF length(p_slug) < 3 THEN
    RETURN false;
  END IF;
  
  -- ensure slug format (lowercase alphanumeric and hyphens only)
  IF p_slug !~ '^[a-z0-9-]+$' THEN
    RETURN false;
  END IF;

  RETURN NOT EXISTS (SELECT 1 FROM public.clinics WHERE slug = p_slug);
END;
$$;

-- 5. Update create_clinic_self_signup
CREATE OR REPLACE FUNCTION public.create_clinic_self_signup(
  clinic_name text,
  clinic_type_id uuid,
  owner_full_name text,
  owner_phone text,
  p_slug text,
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
  v_owner_email := auth.email();
  v_auth_uid := auth.uid();
  
  IF v_owner_email IS NULL OR v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.check_slug_available(p_slug) THEN
    RAISE EXCEPTION 'Slug is not available';
  END IF;

  SELECT is_active INTO v_clinic_type_active
  FROM public.clinic_types
  WHERE id = clinic_type_id;

  IF NOT FOUND OR NOT v_clinic_type_active THEN
    RAISE EXCEPTION 'Invalid or inactive clinic type';
  END IF;

  IF chosen_plan_id IS NOT NULL THEN
    SELECT is_active, price_egp INTO v_plan_active, v_plan_price
    FROM public.plans
    WHERE id = chosen_plan_id;

    IF NOT FOUND OR NOT v_plan_active THEN
      RAISE EXCEPTION 'Invalid or inactive plan';
    END IF;
  END IF;

  INSERT INTO public.clinics (
    name,
    slug,
    clinic_type_id,
    status,
    owner_full_name,
    owner_email,
    owner_phone
  ) VALUES (
    clinic_name,
    p_slug,
    clinic_type_id,
    'trial',
    owner_full_name,
    v_owner_email,
    owner_phone
  ) RETURNING id INTO v_clinic_id;

  IF chosen_plan_id IS NULL THEN
    INSERT INTO public.clinic_subscriptions (
      clinic_id, plan_id, status, trial_ends_at, price_locked_egp, current_period_start, current_period_end
    ) VALUES (
      v_clinic_id, NULL, 'trial', now() + interval '7 days', 0, now(), now() + interval '7 days'
    );
  ELSE
    INSERT INTO public.clinic_subscriptions (
      clinic_id, plan_id, status, pending_confirmation_expires_at, price_locked_egp, current_period_start, current_period_end
    ) VALUES (
      v_clinic_id, chosen_plan_id, 'pending_confirmation', now() + interval '2 days', v_plan_price, now(), now() + interval '1 month'
    );
  END IF;

  INSERT INTO public.staff_members (auth_user_id, full_name, phone)
  VALUES (v_auth_uid, owner_full_name, owner_phone)
  ON CONFLICT (auth_user_id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone
  RETURNING id INTO v_staff_id;

  INSERT INTO public.clinic_staff_memberships (staff_member_id, clinic_id, role)
  VALUES (v_staff_id, v_clinic_id, 'owner');

  RETURN v_clinic_id;
END;
$$;

-- 6. Update claim_clinic_with_serial
CREATE OR REPLACE FUNCTION public.claim_clinic_with_serial(
  p_serial_code text,
  p_clinic_name text,
  p_owner_full_name text,
  p_owner_phone text,
  p_slug text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_owner_email text;
  v_auth_uid uuid;
  v_license record;
  v_clinic_id uuid;
  v_staff_id uuid;
BEGIN
  v_owner_email := auth.email();
  v_auth_uid := auth.uid();
  
  IF v_owner_email IS NULL OR v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify slug
  IF NOT public.check_slug_available(p_slug) THEN
    RAISE EXCEPTION 'Slug is not available';
  END IF;

  SELECT * INTO v_license
  FROM public.clinic_licenses
  WHERE serial_code = p_serial_code AND status = 'active' FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or inactive serial code';
  END IF;

  IF v_license.activation_count >= v_license.max_activations THEN
    RAISE EXCEPTION 'Serial code has reached maximum activations';
  END IF;

  v_clinic_id := v_license.clinic_id;

  UPDATE public.clinics
  SET 
    name = p_clinic_name,
    slug = p_slug,
    owner_full_name = p_owner_full_name,
    owner_email = v_owner_email,
    owner_phone = p_owner_phone,
    status = 'active' 
  WHERE id = v_clinic_id;

  UPDATE public.clinic_licenses
  SET activation_count = activation_count + 1
  WHERE id = v_license.id;

  INSERT INTO public.license_activations (
    license_id, hardware_fingerprint, device_label
  ) VALUES (
    v_license.id, 'WEB_CLAIM', 'First Activation'
  );

  INSERT INTO public.staff_members (
    auth_user_id, full_name, phone
  ) VALUES (
    v_auth_uid, p_owner_full_name, p_owner_phone
  ) RETURNING id INTO v_staff_id;

  INSERT INTO public.clinic_staff_memberships (
    staff_member_id, clinic_id, role
  ) VALUES (
    v_staff_id, v_clinic_id, 'owner'
  );

  RETURN v_clinic_id;
END;
$$;
