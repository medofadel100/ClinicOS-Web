-- Checkpoint 10: Role-based Entitlements (Leaves)

-- ENUMS
DO $$ BEGIN
    CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'unpaid');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. staff_entitlements
CREATE TABLE IF NOT EXISTS staff_entitlements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id uuid NOT NULL REFERENCES clinic_staff_memberships(id) ON DELETE CASCADE,
    leave_type leave_type NOT NULL,
    total_days_allowed integer NOT NULL DEFAULT 0,
    days_used integer NOT NULL DEFAULT 0,
    UNIQUE(membership_id, leave_type)
);

-- 2. staff_leave_requests
CREATE TABLE IF NOT EXISTS staff_leave_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    membership_id uuid NOT NULL REFERENCES clinic_staff_memberships(id) ON DELETE CASCADE,
    leave_type leave_type NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status leave_status NOT NULL DEFAULT 'pending',
    reason text,
    reviewed_by uuid REFERENCES staff_members(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_entitlements_membership ON staff_entitlements(membership_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_clinic ON staff_leave_requests(clinic_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_membership ON staff_leave_requests(membership_id);

-- Enable RLS
ALTER TABLE staff_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_leave_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: staff_entitlements
-- A staff member can view their own entitlements, OR an admin/owner can view/edit all.
CREATE POLICY "Staff can view own entitlements" ON staff_entitlements FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM clinic_staff_memberships m 
  JOIN staff_members s ON m.staff_member_id = s.id 
  WHERE m.id = staff_entitlements.membership_id 
    AND s.auth_user_id = auth.uid()
));

CREATE POLICY "Finance/Admin access can select entitlements" ON staff_entitlements FOR SELECT 
USING (EXISTS (SELECT 1 FROM clinic_staff_memberships m WHERE m.id = staff_entitlements.membership_id AND public.has_finance_access(m.clinic_id)));

CREATE POLICY "Finance/Admin access can insert entitlements" ON staff_entitlements FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM clinic_staff_memberships m WHERE m.id = staff_entitlements.membership_id AND public.has_finance_access(m.clinic_id)));

CREATE POLICY "Finance/Admin access can update entitlements" ON staff_entitlements FOR UPDATE 
USING (EXISTS (SELECT 1 FROM clinic_staff_memberships m WHERE m.id = staff_entitlements.membership_id AND public.has_finance_access(m.clinic_id)));

CREATE POLICY "Finance/Admin access can delete entitlements" ON staff_entitlements FOR DELETE 
USING (EXISTS (SELECT 1 FROM clinic_staff_memberships m WHERE m.id = staff_entitlements.membership_id AND public.has_finance_access(m.clinic_id)));


-- RLS Policies: staff_leave_requests
-- A staff member can view their own requests and insert them.
CREATE POLICY "Staff can view own leave requests" ON staff_leave_requests FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM clinic_staff_memberships m 
  JOIN staff_members s ON m.staff_member_id = s.id 
  WHERE m.id = staff_leave_requests.membership_id 
    AND s.auth_user_id = auth.uid()
));

CREATE POLICY "Staff can insert own leave requests" ON staff_leave_requests FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM clinic_staff_memberships m 
  JOIN staff_members s ON m.staff_member_id = s.id 
  WHERE m.id = staff_leave_requests.membership_id 
    AND s.auth_user_id = auth.uid()
));

-- Admin/Owner can view and update all requests in their clinic.
CREATE POLICY "Finance/Admin access can select leave requests" ON staff_leave_requests FOR SELECT USING (public.has_finance_access(clinic_id));
CREATE POLICY "Finance/Admin access can update leave requests" ON staff_leave_requests FOR UPDATE USING (public.has_finance_access(clinic_id));
