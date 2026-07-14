-- 1. Helper Function: Get current staff ID
CREATE OR REPLACE FUNCTION get_staff_id()
RETURNS uuid
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_staff_id uuid;
BEGIN
  SELECT id INTO v_staff_id FROM staff_members WHERE auth_user_id = auth.uid() LIMIT 1;
  RETURN v_staff_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Helper Function: Get current user clinics
CREATE OR REPLACE FUNCTION get_user_clinics()
RETURNS TABLE (clinic_id uuid, role staff_role)
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT m.clinic_id, m.role
  FROM clinic_staff_memberships m
  WHERE m.staff_member_id = get_staff_id() AND m.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Disable RLS temporarily to avoid issues during setup
ALTER TABLE clinic_staff_memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members DISABLE ROW LEVEL SECURITY;

-- Wipe ALL policies on both tables
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

-- Re-enable RLS
ALTER TABLE clinic_staff_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Policies for staff_members
CREATE POLICY "Staff can view their own profile" ON staff_members FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Staff can update their own profile" ON staff_members FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "Owners can view their clinic staff profiles" ON staff_members FOR SELECT USING (
  id IN (
    SELECT m.staff_member_id 
    FROM clinic_staff_memberships m 
    WHERE m.clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c WHERE c.role = 'owner')
  )
);

-- Policies for clinic_staff_memberships
CREATE POLICY "Staff can view their own memberships" ON clinic_staff_memberships FOR SELECT USING (staff_member_id = get_staff_id());
CREATE POLICY "Staff can view others in their clinics" ON clinic_staff_memberships FOR SELECT USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c));
CREATE POLICY "Owners can manage memberships" ON clinic_staff_memberships FOR ALL USING (clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c WHERE c.role = 'owner'));
