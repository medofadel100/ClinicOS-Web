-- ============================================================
-- FIX BUNDLE 1: RLS Security + Serial Claim Flow
-- Applies to the live DB. Safe to run multiple times.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Add 'admin' to staff_role enum (idempotent)
--    The app relies on role='admin' for HR/Finance/Marketing.
-- ------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'staff_role' AND e.enumlabel = 'admin'
  ) THEN
    ALTER TYPE public.staff_role ADD VALUE 'admin';
  END IF;
END $$;

-- ------------------------------------------------------------
-- 2. Hardening: pin search_path on SECURITY DEFINER helpers
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_finance_access(target_clinic_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM clinic_staff_memberships m
    JOIN staff_members s ON m.staff_member_id = s.id
    WHERE s.auth_user_id = auth.uid()
      AND m.clinic_id = target_clinic_id
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff_member_of_clinic(clinic_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM clinic_staff_memberships m
    JOIN staff_members s ON m.staff_member_id = s.id
    WHERE s.auth_user_id = auth.uid()
      AND m.clinic_id = clinic_uuid
      AND m.is_active = true
  );
END;
$$;

-- ------------------------------------------------------------
-- 3. patient_clinical_notes: allow clinic-staff access via clinic_id
--    (the app inserts notes/vitals WITHOUT encounter_id, so the
--    old encounter_id-based policy blocked all inserts)
-- ------------------------------------------------------------
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.patient_clinical_notes'::regclass
    AND contype = 'c'
    AND conname LIKE '%note_type%';
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.patient_clinical_notes DROP CONSTRAINT ' || constraint_name;
  END IF;
END $$;

DROP POLICY IF EXISTS "Allow full access to clinic staff for notes" ON public.patient_clinical_notes;
CREATE POLICY "Allow full access to clinic staff for notes" ON public.patient_clinical_notes
  FOR ALL TO public
  USING (public.is_staff_member_of_clinic(clinic_id))
  WITH CHECK (public.is_staff_member_of_clinic(clinic_id));

-- ------------------------------------------------------------
-- 4. platform_admins: remove self-update policy (privilege escalation)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can update their own row" ON public.platform_admins;

-- ------------------------------------------------------------
-- 5. staff_invites: remove anon token leak, add secure lookup RPC
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public invite lookup" ON public.staff_invites;

CREATE OR REPLACE FUNCTION public.get_invite_by_token(p_token text)
RETURNS TABLE (
  id uuid,
  clinic_id uuid,
  clinic_name text,
  invited_role public.staff_role,
  status public.invite_status,
  expires_at timestamptz,
  invite_token text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT si.id, si.clinic_id, c.name, si.invited_role, si.status, si.expires_at, si.invite_token
  FROM public.staff_invites si
  JOIN public.clinics c ON c.id = si.clinic_id
  WHERE si.invite_token = p_token;
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO authenticated;

-- ------------------------------------------------------------
-- 6. clinic_serials: remove broad SELECT leak (any authenticated
--    user could read every serial code). Serial lifecycle is now
--    handled by SECURITY DEFINER functions only.
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view clinic_serials" ON public.clinic_serials;

-- ------------------------------------------------------------
-- 7. Serial claim flow: single atomic SECURITY DEFINER function
--    Replaces the old license-based claim_clinic_with_serial.
--    Creates clinic + subscription, marks serial used, creates
--    staff_member + owner membership — all in one transaction.
-- ------------------------------------------------------------
DROP FUNCTION IF EXISTS public.claim_clinic_with_serial(text, text, text, text);

CREATE OR REPLACE FUNCTION public.claim_clinic_with_serial(
  p_serial_code text,
  p_clinic_name text,
  p_clinic_type_id uuid,
  p_owner_full_name text,
  p_owner_phone text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid uuid;
  v_serial record;
  v_clinic_id uuid;
  v_staff_id uuid;
  v_now timestamptz;
  v_period_end timestamptz;
  v_billing_cycle text;
  v_owner_email text;
BEGIN
  v_auth_uid := auth.uid();
  IF v_auth_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch the owner email from auth.users (auth.email() is unreliable in SECURITY DEFINER)
  SELECT email INTO v_owner_email FROM auth.users WHERE id = v_auth_uid;

  -- Lock + verify the serial (race-safe)
  SELECT cs.id, cs.plan_id, cs.code, p.billing_cycle, p.price_egp
  INTO v_serial
  FROM public.clinic_serials cs
  JOIN public.plans p ON p.id = cs.plan_id
  WHERE cs.code = upper(trim(p_serial_code))
    AND cs.status = 'unused'
  FOR UPDATE OF cs;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Serial code not found or already used';
  END IF;

  v_billing_cycle := v_serial.billing_cycle::text;

  -- Create the clinic
  INSERT INTO public.clinics (
    name, clinic_type_id, owner_full_name, owner_email, owner_phone, status
  ) VALUES (
    p_clinic_name, p_clinic_type_id, p_owner_full_name, v_owner_email, p_owner_phone, 'active'
  )
  RETURNING id INTO v_clinic_id;

  -- Mark the serial as used
  UPDATE public.clinic_serials
  SET status = 'used', clinic_id = v_clinic_id, used_at = now()
  WHERE id = v_serial.id;

  -- Create the subscription
  v_now := now();
  v_period_end := v_now;
  IF v_billing_cycle = 'yearly' THEN
    v_period_end := v_now + interval '1 year';
  ELSE
    v_period_end := v_now + interval '1 month';
  END IF;

  INSERT INTO public.clinic_subscriptions (
    clinic_id, plan_id, status, price_locked_egp, current_period_start, current_period_end
  ) VALUES (
    v_clinic_id, v_serial.plan_id, 'active', v_serial.price_egp, v_now, v_period_end
  );

  -- Create the staff member
  INSERT INTO public.staff_members (auth_user_id, full_name, phone)
  VALUES (v_auth_uid, p_owner_full_name, p_owner_phone)
  RETURNING id INTO v_staff_id;

  -- Link the owner membership
  INSERT INTO public.clinic_staff_memberships (staff_member_id, clinic_id, role, is_active, joined_at)
  VALUES (v_staff_id, v_clinic_id, 'owner', true, now());

  RETURN v_clinic_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_clinic_with_serial(text, text, uuid, text, text) TO authenticated;
