DO $$ 
DECLARE 
  pol record;
BEGIN 
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename IN ('clinic_staff_memberships', 'staff_members')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

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

-- Staff Members Policies
CREATE POLICY "Staff can view their own profile" ON staff_members FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Staff can update their own profile" ON staff_members FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Owners can view their clinic staff profiles" ON staff_members FOR SELECT USING (
  id IN (SELECT m.staff_member_id FROM clinic_staff_memberships m WHERE m.clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c WHERE c.role = 'owner'))
);

-- Clinic Staff Memberships Policies
CREATE POLICY "Staff can view their own memberships" ON clinic_staff_memberships FOR SELECT USING (staff_member_id IN (SELECT id FROM staff_members WHERE auth_user_id = auth.uid()));
CREATE POLICY "Staff can view others in their clinics" ON clinic_staff_memberships FOR SELECT USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c));
CREATE POLICY "Owners can manage memberships" ON clinic_staff_memberships FOR ALL USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c WHERE c.role = 'owner'));
