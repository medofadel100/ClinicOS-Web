-- Teams: group staff members into teams (nursing shifts, reception, technicians, etc.)
CREATE TABLE IF NOT EXISTS public.staff_teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL REFERENCES public.staff_teams(id) ON DELETE CASCADE,
    staff_member_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(team_id, staff_member_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_teams_clinic ON public.staff_teams(clinic_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_staff ON public.team_members(staff_member_id);

ALTER TABLE public.staff_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Staff in the clinic can view teams
CREATE POLICY "Staff can view clinic teams" ON public.staff_teams FOR SELECT
USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can view team members" ON public.team_members FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.staff_teams t
  WHERE t.id = team_members.team_id AND public.is_staff_member_of_clinic(t.clinic_id)
));

-- Owners/admins can manage teams
CREATE POLICY "Owners can manage clinic teams" ON public.staff_teams FOR ALL
USING (clinic_id IN (SELECT c.clinic_id FROM public.get_user_clinics() c WHERE c.role IN ('owner', 'admin')))
WITH CHECK (clinic_id IN (SELECT c.clinic_id FROM public.get_user_clinics() c WHERE c.role IN ('owner', 'admin')));

CREATE POLICY "Owners can manage team members" ON public.team_members FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.staff_teams t
  WHERE t.id = team_members.team_id AND t.clinic_id IN (SELECT c.clinic_id FROM public.get_user_clinics() c WHERE c.role IN ('owner', 'admin'))
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.staff_teams t
  WHERE t.id = team_members.team_id AND t.clinic_id IN (SELECT c.clinic_id FROM public.get_user_clinics() c WHERE c.role IN ('owner', 'admin'))
));
