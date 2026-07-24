-- 1. Function to verify serial code (Publicly accessible but secure)
CREATE OR REPLACE FUNCTION public.verify_serial_code(
  p_serial_code text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_license record;
  v_clinic record;
  v_clinic_type record;
BEGIN
  -- Find the license
  SELECT * INTO v_license
  FROM public.clinic_licenses
  WHERE serial_code = p_serial_code AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or inactive serial code';
  END IF;

  IF v_license.activation_count >= v_license.max_activations THEN
    RAISE EXCEPTION 'Serial code has reached maximum activations';
  END IF;

  -- Get clinic details
  SELECT * INTO v_clinic
  FROM public.clinics
  WHERE id = v_license.clinic_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Associated clinic not found';
  END IF;

  -- Get clinic type
  SELECT * INTO v_clinic_type
  FROM public.clinic_types
  WHERE id = v_clinic.clinic_type_id;

  RETURN jsonb_build_object(
    'clinic_id', v_clinic.id,
    'clinic_name', v_clinic.name,
    'clinic_type_id', v_clinic.clinic_type_id,
    'clinic_type_name_en', v_clinic_type.name_en,
    'clinic_type_name_ar', v_clinic_type.name_ar
  );
END;
$$;

-- 2. Function to claim the clinic after authentication
CREATE OR REPLACE FUNCTION public.claim_clinic_with_serial(
  p_serial_code text,
  p_clinic_name text,
  p_owner_full_name text,
  p_owner_phone text
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

  -- 1. Find license
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

  -- 2. Update clinics table (set new email, name, etc.)
  -- We overwrite the email so the user who claimed it becomes the true owner.
  UPDATE public.clinics
  SET 
    name = p_clinic_name,
    owner_full_name = p_owner_full_name,
    owner_email = v_owner_email,
    owner_phone = p_owner_phone,
    status = 'active' 
  WHERE id = v_clinic_id;

  -- 3. Update license
  UPDATE public.clinic_licenses
  SET activation_count = activation_count + 1
  WHERE id = v_license.id;

  -- Record activation
  INSERT INTO public.license_activations (
    license_id, hardware_fingerprint, device_label
  ) VALUES (
    v_license.id, 'WEB_CLAIM', 'First Activation'
  );

  -- 4. Create Staff Member
  INSERT INTO public.staff_members (
    auth_user_id, full_name, phone
  ) VALUES (
    v_auth_uid, p_owner_full_name, p_owner_phone
  ) RETURNING id INTO v_staff_id;

  -- 5. Link Staff Member to Clinic
  INSERT INTO public.clinic_staff_memberships (
    staff_member_id, clinic_id, role
  ) VALUES (
    v_staff_id, v_clinic_id, 'owner'
  );

  RETURN v_clinic_id;
END;
$$;
