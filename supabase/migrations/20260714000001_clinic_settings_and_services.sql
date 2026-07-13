-- Checkpoint 2: Clinic profile, services catalog, doctor profiles

-- 1. Clinic Settings
CREATE TABLE clinic_settings (
  clinic_id uuid PRIMARY KEY REFERENCES clinics(id) ON DELETE CASCADE,
  address text,
  contact_email text,
  contact_phone text,
  currency_code text DEFAULT 'EGP',
  who_can_record_payments text[] DEFAULT '{owner,accountant,reception}',
  timezone text DEFAULT 'UTC'
);

-- 2. Doctor Profiles
CREATE TABLE doctor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id uuid REFERENCES staff_members(id) ON DELETE CASCADE,
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  bio text,
  specialty text,
  UNIQUE(staff_member_id, clinic_id)
);

-- 3. Doctor Working Hours
CREATE TABLE doctor_working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_profile_id uuid REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  day_of_week smallint CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true
);

-- 4. Service Categories
CREATE TABLE service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index int DEFAULT 0
);

-- 5. Clinic Services
CREATE TABLE clinic_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  category_id uuid REFERENCES service_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  duration_minutes int DEFAULT 30
);

-- Enable RLS on all new tables
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_services ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- RLS: clinic_settings
-- --------------------------------------------------------
CREATE POLICY "Staff can view clinic_settings" ON clinic_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      WHERE m.clinic_id = clinic_settings.clinic_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.is_active = true
    )
  );

CREATE POLICY "Owners can manage clinic_settings" ON clinic_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      WHERE m.clinic_id = clinic_settings.clinic_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.role = 'owner'
      AND m.is_active = true
    )
  );

-- --------------------------------------------------------
-- RLS: doctor_profiles
-- --------------------------------------------------------
CREATE POLICY "Staff can view doctor_profiles" ON doctor_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      WHERE m.clinic_id = doctor_profiles.clinic_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.is_active = true
    )
  );

CREATE POLICY "Owners can manage doctor_profiles" ON doctor_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      WHERE m.clinic_id = doctor_profiles.clinic_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.role = 'owner'
      AND m.is_active = true
    )
  );

-- --------------------------------------------------------
-- RLS: doctor_working_hours
-- --------------------------------------------------------
CREATE POLICY "Staff can view doctor_working_hours" ON doctor_working_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctor_profiles dp
      JOIN clinic_staff_memberships m ON dp.clinic_id = m.clinic_id
      WHERE dp.id = doctor_working_hours.doctor_profile_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.is_active = true
    )
  );

CREATE POLICY "Owners can manage doctor_working_hours" ON doctor_working_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM doctor_profiles dp
      JOIN clinic_staff_memberships m ON dp.clinic_id = m.clinic_id
      WHERE dp.id = doctor_working_hours.doctor_profile_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.role = 'owner'
      AND m.is_active = true
    )
  );

-- --------------------------------------------------------
-- RLS: service_categories
-- --------------------------------------------------------
CREATE POLICY "Staff can view service_categories" ON service_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      WHERE m.clinic_id = service_categories.clinic_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.is_active = true
    )
  );

CREATE POLICY "Owners can manage service_categories" ON service_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      WHERE m.clinic_id = service_categories.clinic_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.role = 'owner'
      AND m.is_active = true
    )
  );

-- --------------------------------------------------------
-- RLS: clinic_services
-- --------------------------------------------------------
CREATE POLICY "Staff can view clinic_services" ON clinic_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      WHERE m.clinic_id = clinic_services.clinic_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.is_active = true
    )
  );

CREATE POLICY "Owners can manage clinic_services" ON clinic_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      WHERE m.clinic_id = clinic_services.clinic_id
      AND m.staff_member_id = (SELECT id FROM staff_members WHERE auth_user_id = auth.uid())
      AND m.role = 'owner'
      AND m.is_active = true
    )
  );
