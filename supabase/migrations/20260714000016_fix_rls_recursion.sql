CREATE OR REPLACE FUNCTION get_user_clinics()
RETURNS TABLE (clinic_id uuid, role staff_role)
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT m.clinic_id, m.role
  FROM clinic_staff_memberships m
  JOIN staff_members s ON s.id = m.staff_member_id
  WHERE s.auth_user_id = auth.uid() AND m.is_active = true;
END;
$$ LANGUAGE plpgsql;

DROP POLICY IF EXISTS "Staff can view memberships for their clinics" ON clinic_staff_memberships;
DROP POLICY IF EXISTS "Owners can manage memberships" ON clinic_staff_memberships;
DROP POLICY IF EXISTS "Staff can view their own memberships" ON clinic_staff_memberships;
DROP POLICY IF EXISTS "Staff can view others in their clinics" ON clinic_staff_memberships;

CREATE POLICY "Staff can view their own memberships"
  ON clinic_staff_memberships FOR SELECT
  USING (staff_member_id IN (SELECT id FROM staff_members WHERE auth_user_id = auth.uid()));

CREATE POLICY "Staff can view others in their clinics"
  ON clinic_staff_memberships FOR SELECT
  USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c));

CREATE POLICY "Owners can manage memberships"
  ON clinic_staff_memberships FOR ALL
  USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c WHERE c.role = 'owner'));

DROP POLICY IF EXISTS "Owners can view their clinic staff profiles" ON staff_members;

CREATE POLICY "Owners can view their clinic staff profiles"
  ON staff_members FOR SELECT
  USING (
    id IN (
      SELECT m.staff_member_id FROM clinic_staff_memberships m
      WHERE m.clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c WHERE c.role = 'owner')
    )
  );
