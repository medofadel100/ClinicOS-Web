-- Checkpoint 1: Staff Auth & Multi-Clinic Identity Data Models

-- Enums
CREATE TYPE language_pref AS ENUM ('ar', 'en');
CREATE TYPE staff_role AS ENUM ('owner', 'doctor', 'reception', 'accountant', 'other');

-- Staff Members Table
CREATE TABLE staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  preferred_language language_pref DEFAULT 'ar',
  created_at timestamptz DEFAULT now()
);

-- Clinic Staff Memberships Table
-- Relies on `clinics` table which already exists in the shared database
CREATE TABLE clinic_staff_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id uuid REFERENCES staff_members(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  role staff_role DEFAULT 'reception',
  is_active boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(staff_member_id, clinic_id)
);

-- Enable RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_staff_memberships ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- RLS Policies for staff_members
-- --------------------------------------------------------

-- 1. A user can read their own staff profile
CREATE POLICY "Staff can view their own profile" 
  ON staff_members FOR SELECT 
  USING (auth.uid() = auth_user_id);

-- 2. A user can update their own staff profile
CREATE POLICY "Staff can update their own profile" 
  ON staff_members FOR UPDATE 
  USING (auth.uid() = auth_user_id);

-- 3. Clinic owners can view profiles of staff in their clinics
CREATE POLICY "Owners can view their clinic staff profiles" 
  ON staff_members FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m1
      JOIN clinic_staff_memberships m2 ON m1.clinic_id = m2.clinic_id
      WHERE m1.staff_member_id = staff_members.id
      AND m2.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m2.role = 'owner'
      AND m2.is_active = true
    )
  );

-- --------------------------------------------------------
-- RLS Policies for clinic_staff_memberships
-- --------------------------------------------------------

-- 1. Staff can read memberships for clinics they belong to
CREATE POLICY "Staff can view memberships for their clinics" 
  ON clinic_staff_memberships FOR SELECT 
  USING (
    clinic_id IN (
      SELECT clinic_id FROM clinic_staff_memberships
      WHERE staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND is_active = true
    )
  );

-- 2. Owners can manage memberships for their clinics (Insert/Update/Delete)
CREATE POLICY "Owners can manage memberships" 
  ON clinic_staff_memberships FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      WHERE m.clinic_id = clinic_staff_memberships.clinic_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.role = 'owner'
      AND m.is_active = true
    )
  );
