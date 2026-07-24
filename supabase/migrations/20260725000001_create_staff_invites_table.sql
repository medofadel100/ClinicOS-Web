-- ============================================================
-- Migration: Create staff_invites table
-- ============================================================

-- 1. Create invite_status enum (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
    CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
  END IF;
END $$;

-- 2. Create the staff_invites table
CREATE TABLE IF NOT EXISTS public.staff_invites (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id   uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  invited_role public.staff_role NOT NULL,
  invite_token text NOT NULL UNIQUE,
  created_by_membership_id uuid NOT NULL REFERENCES public.clinic_staff_memberships(id) ON DELETE CASCADE,
  status      public.invite_status NOT NULL DEFAULT 'pending',
  expires_at  timestamptz NOT NULL,
  accepted_by_staff_member_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_staff_invites_clinic ON public.staff_invites(clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_invites_token ON public.staff_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_staff_invites_status ON public.staff_invites(status);

-- 4. RLS
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;

-- Owners can manage invites for their clinic
CREATE POLICY "Owner manages invites"
  ON public.staff_invites FOR ALL
  USING (
    clinic_id IN (
      SELECT csm.clinic_id FROM public.clinic_staff_memberships csm
      WHERE csm.staff_member_id = (
        SELECT id FROM public.staff_members WHERE auth_user_id = auth.uid()
      )
      AND csm.role = 'owner'
      AND csm.is_active = true
    )
  );

-- Staff can view pending invites for their clinic (for display purposes)
CREATE POLICY "Staff view invites"
  ON public.staff_invites FOR SELECT
  USING (
    clinic_id IN (
      SELECT csm.clinic_id FROM public.clinic_staff_memberships csm
      WHERE csm.staff_member_id = (
        SELECT id FROM public.staff_members WHERE auth_user_id = auth.uid()
      )
      AND csm.is_active = true
    )
  );

-- Anonymous users can read a single invite by token (for the invite acceptance page)
CREATE POLICY "Public invite lookup"
  ON public.staff_invites FOR SELECT
  TO anon
  USING (status = 'pending' AND expires_at > now());

-- 5. Cleanup: auto-expire old invites
CREATE OR REPLACE FUNCTION public.expire_old_invites()
RETURNS void AS $$
  UPDATE public.staff_invites SET status = 'expired'
  WHERE status = 'pending' AND expires_at < now();
$$ LANGUAGE sql SECURITY DEFINER;
