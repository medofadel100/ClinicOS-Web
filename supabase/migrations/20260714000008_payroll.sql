-- Checkpoint 9: Staff Management & Payroll

-- ENUMS
DO $$ BEGIN
    CREATE TYPE salary_type AS ENUM ('fixed', 'commission', 'fixed_plus_commission');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. staff_payroll_config
CREATE TABLE IF NOT EXISTS staff_payroll_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id uuid NOT NULL UNIQUE REFERENCES clinic_staff_memberships(id) ON DELETE CASCADE,
    salary_type salary_type NOT NULL,
    base_salary_egp numeric(10,2),
    commission_percentage numeric(5,2)
);

-- 2. payroll_runs
CREATE TABLE IF NOT EXISTS payroll_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    membership_id uuid NOT NULL REFERENCES clinic_staff_memberships(id) ON DELETE CASCADE,
    period_month date NOT NULL,
    base_salary_egp numeric(10,2),
    commission_earned_egp numeric(10,2)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payroll_runs_clinic_id ON payroll_runs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_membership_id ON payroll_runs(membership_id);

-- Enable RLS
ALTER TABLE staff_payroll_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: staff_payroll_config
-- Depends on joining clinic_staff_memberships to get clinic_id
CREATE POLICY "Finance access can select payroll config" ON staff_payroll_config FOR SELECT 
USING (EXISTS (SELECT 1 FROM clinic_staff_memberships m WHERE m.id = staff_payroll_config.membership_id AND public.has_finance_access(m.clinic_id)));

CREATE POLICY "Finance access can insert payroll config" ON staff_payroll_config FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM clinic_staff_memberships m WHERE m.id = staff_payroll_config.membership_id AND public.has_finance_access(m.clinic_id)));

CREATE POLICY "Finance access can update payroll config" ON staff_payroll_config FOR UPDATE 
USING (EXISTS (SELECT 1 FROM clinic_staff_memberships m WHERE m.id = staff_payroll_config.membership_id AND public.has_finance_access(m.clinic_id)));

CREATE POLICY "Finance access can delete payroll config" ON staff_payroll_config FOR DELETE 
USING (EXISTS (SELECT 1 FROM clinic_staff_memberships m WHERE m.id = staff_payroll_config.membership_id AND public.has_finance_access(m.clinic_id)));

-- RLS Policies: payroll_runs
CREATE POLICY "Finance access can select payroll runs" ON payroll_runs FOR SELECT USING (public.has_finance_access(clinic_id));
CREATE POLICY "Finance access can insert payroll runs" ON payroll_runs FOR INSERT WITH CHECK (public.has_finance_access(clinic_id));
CREATE POLICY "Finance access can update payroll runs" ON payroll_runs FOR UPDATE USING (public.has_finance_access(clinic_id));
CREATE POLICY "Finance access can delete payroll runs" ON payroll_runs FOR DELETE USING (public.has_finance_access(clinic_id));
