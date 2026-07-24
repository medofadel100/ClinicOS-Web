-- HR & Payroll Updates

-- 1. Create staff_attendance
DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent', 'on_leave');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS staff_attendance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    membership_id uuid NOT NULL REFERENCES clinic_staff_memberships(id) ON DELETE CASCADE,
    work_date date NOT NULL,
    check_in_at timestamptz,
    check_out_at timestamptz,
    status attendance_status NOT NULL DEFAULT 'present',
    created_at timestamptz DEFAULT now(),
    UNIQUE(membership_id, work_date)
);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_clinic ON staff_attendance(clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_membership ON staff_attendance(membership_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON staff_attendance(work_date);

ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own attendance" ON staff_attendance FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM clinic_staff_memberships m 
  JOIN staff_members s ON m.staff_member_id = s.id 
  WHERE m.id = staff_attendance.membership_id 
    AND s.auth_user_id = auth.uid()
));

CREATE POLICY "Staff can insert own attendance" ON staff_attendance FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_staff_memberships m 
  JOIN staff_members s ON m.staff_member_id = s.id 
  WHERE m.id = staff_attendance.membership_id 
    AND s.auth_user_id = auth.uid()
));

CREATE POLICY "Staff can update own attendance" ON staff_attendance FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM clinic_staff_memberships m 
  JOIN staff_members s ON m.staff_member_id = s.id 
  WHERE m.id = staff_attendance.membership_id 
    AND s.auth_user_id = auth.uid()
));

CREATE POLICY "Admin access can select all attendance" ON staff_attendance FOR SELECT USING (public.has_finance_access(clinic_id) OR public.is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Admin access can update all attendance" ON staff_attendance FOR UPDATE USING (public.has_finance_access(clinic_id));

-- 2. Update payroll_runs
DO $$ BEGIN
    CREATE TYPE payroll_status AS ENUM ('draft', 'paid', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS net_pay_egp numeric(10,2) DEFAULT 0;
ALTER TABLE payroll_runs ADD COLUMN IF NOT EXISTS status payroll_status DEFAULT 'draft';
