-- Checkpoint 6: Billing: Treatment Plans & Payments

-- ENUMS
DO $$ BEGIN
    CREATE TYPE plan_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('pending', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE patient_payment_type AS ENUM ('deposit', 'session_payment', 'full_payment', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE approval_method AS ENUM ('whatsapp_reply');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'declined');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. treatment_plans
CREATE TABLE IF NOT EXISTS treatment_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    title text NOT NULL,
    total_price_egp numeric(10,2) NOT NULL,
    status plan_status NOT NULL DEFAULT 'active',
    created_by uuid REFERENCES staff_members(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- 2. treatment_plan_sessions
CREATE TABLE IF NOT EXISTS treatment_plan_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_plan_id uuid NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
    appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
    sequence_number integer NOT NULL,
    session_price_egp numeric(10,2) NOT NULL,
    status session_status NOT NULL DEFAULT 'pending'
);

-- 3. patient_payments
CREATE TABLE IF NOT EXISTS patient_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_plan_id uuid REFERENCES treatment_plans(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
    amount_egp numeric(10,2) NOT NULL,
    payment_type patient_payment_type NOT NULL,
    payment_method payment_method NOT NULL,
    recorded_by uuid REFERENCES staff_members(id) ON DELETE SET NULL,
    paid_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- 4. treatment_plan_approvals
CREATE TABLE IF NOT EXISTS treatment_plan_approvals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_plan_id uuid NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
    sent_at timestamptz NOT NULL DEFAULT now(),
    approval_method approval_method NOT NULL,
    status approval_status NOT NULL DEFAULT 'pending',
    responded_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_treatment_plans_clinic_id ON treatment_plans(clinic_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient_id ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_payments_clinic_id ON patient_payments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patient_payments_patient_id ON patient_payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_sessions_plan_id ON treatment_plan_sessions(treatment_plan_id);

-- Helper Function for Payment Recording RLS
CREATE OR REPLACE FUNCTION public.can_record_payment(target_clinic_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
  allowed_roles text[];
BEGIN
  -- Get the current user's role in this clinic
  SELECT m.role::text INTO user_role
  FROM clinic_staff_memberships m
  JOIN staff_members s ON m.staff_member_id = s.id
  WHERE s.auth_user_id = auth.uid()
    AND m.clinic_id = target_clinic_id
    AND m.is_active = true;

  IF user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Get the allowed roles from clinic_settings
  SELECT who_can_record_payments INTO allowed_roles
  FROM clinic_settings
  WHERE clinic_id = target_clinic_id;

  -- If no settings found, fallback to owner only
  IF allowed_roles IS NULL THEN
    RETURN user_role = 'owner';
  END IF;

  -- Check if user's role is in the allowed array
  RETURN user_role = ANY(allowed_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Enable RLS
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plan_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: treatment_plans
CREATE POLICY "Staff can view treatment plans in their clinic" ON treatment_plans FOR SELECT USING (public.is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert treatment plans in their clinic" ON treatment_plans FOR INSERT WITH CHECK (public.is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update treatment plans in their clinic" ON treatment_plans FOR UPDATE USING (public.is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete treatment plans in their clinic" ON treatment_plans FOR DELETE USING (public.is_staff_member_of_clinic(clinic_id));

-- RLS Policies: treatment_plan_sessions (inherit via plan's clinic_id or just generic since no clinic_id)
-- We must join to treatment_plans to check clinic_id
CREATE POLICY "Staff can view sessions" ON treatment_plan_sessions FOR SELECT 
USING (EXISTS (SELECT 1 FROM treatment_plans tp WHERE tp.id = treatment_plan_sessions.treatment_plan_id AND public.is_staff_member_of_clinic(tp.clinic_id)));
CREATE POLICY "Staff can insert sessions" ON treatment_plan_sessions FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM treatment_plans tp WHERE tp.id = treatment_plan_sessions.treatment_plan_id AND public.is_staff_member_of_clinic(tp.clinic_id)));
CREATE POLICY "Staff can update sessions" ON treatment_plan_sessions FOR UPDATE 
USING (EXISTS (SELECT 1 FROM treatment_plans tp WHERE tp.id = treatment_plan_sessions.treatment_plan_id AND public.is_staff_member_of_clinic(tp.clinic_id)));
CREATE POLICY "Staff can delete sessions" ON treatment_plan_sessions FOR DELETE 
USING (EXISTS (SELECT 1 FROM treatment_plans tp WHERE tp.id = treatment_plan_sessions.treatment_plan_id AND public.is_staff_member_of_clinic(tp.clinic_id)));

-- RLS Policies: patient_payments
CREATE POLICY "Staff can view payments in their clinic" ON patient_payments FOR SELECT USING (public.is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert payments in their clinic based on settings" ON patient_payments FOR INSERT WITH CHECK (public.can_record_payment(clinic_id));
CREATE POLICY "Staff can update payments in their clinic based on settings" ON patient_payments FOR UPDATE USING (public.can_record_payment(clinic_id));
CREATE POLICY "Staff can delete payments in their clinic based on settings" ON patient_payments FOR DELETE USING (public.can_record_payment(clinic_id));

-- RLS Policies: treatment_plan_approvals
CREATE POLICY "Staff can view approvals" ON treatment_plan_approvals FOR SELECT 
USING (EXISTS (SELECT 1 FROM treatment_plans tp WHERE tp.id = treatment_plan_approvals.treatment_plan_id AND public.is_staff_member_of_clinic(tp.clinic_id)));
CREATE POLICY "Staff can insert approvals" ON treatment_plan_approvals FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM treatment_plans tp WHERE tp.id = treatment_plan_approvals.treatment_plan_id AND public.is_staff_member_of_clinic(tp.clinic_id)));
CREATE POLICY "Staff can update approvals" ON treatment_plan_approvals FOR UPDATE 
USING (EXISTS (SELECT 1 FROM treatment_plans tp WHERE tp.id = treatment_plan_approvals.treatment_plan_id AND public.is_staff_member_of_clinic(tp.clinic_id)));
CREATE POLICY "Staff can delete approvals" ON treatment_plan_approvals FOR DELETE 
USING (EXISTS (SELECT 1 FROM treatment_plans tp WHERE tp.id = treatment_plan_approvals.treatment_plan_id AND public.is_staff_member_of_clinic(tp.clinic_id)));
