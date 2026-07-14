-- Checkpoint 8: Clinic Finance

-- ENUMS
DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM ('rent', 'salaries', 'installment', 'utilities', 'supplies', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE expense_recurrence AS ENUM ('one_time', 'weekly', 'monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE occurrence_status AS ENUM ('pending', 'paid');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. clinic_expenses
CREATE TABLE IF NOT EXISTS clinic_expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    title text NOT NULL,
    category expense_category NOT NULL,
    amount_egp numeric(10,2) NOT NULL,
    recurrence expense_recurrence NOT NULL,
    start_date date NOT NULL,
    end_date date,
    is_active boolean NOT NULL DEFAULT true,
    created_by uuid REFERENCES staff_members(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- 2. expense_occurrences
CREATE TABLE IF NOT EXISTS expense_occurrences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id uuid NOT NULL REFERENCES clinic_expenses(id) ON DELETE CASCADE,
    period_date date NOT NULL,
    amount_egp numeric(10,2) NOT NULL,
    status occurrence_status NOT NULL DEFAULT 'pending',
    paid_at timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinic_expenses_clinic_id ON clinic_expenses(clinic_id);
CREATE INDEX IF NOT EXISTS idx_expense_occurrences_expense_id ON expense_occurrences(expense_id);

-- Helper Function for Finance Access
CREATE OR REPLACE FUNCTION public.has_finance_access(target_clinic_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM clinic_staff_memberships m
    JOIN staff_members s ON m.staff_member_id = s.id
    WHERE s.auth_user_id = auth.uid()
      AND m.clinic_id = target_clinic_id
      AND m.is_active = true
      AND m.role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE clinic_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_occurrences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: clinic_expenses
CREATE POLICY "Finance access can select expenses" ON clinic_expenses FOR SELECT USING (public.has_finance_access(clinic_id));
CREATE POLICY "Finance access can insert expenses" ON clinic_expenses FOR INSERT WITH CHECK (public.has_finance_access(clinic_id));
CREATE POLICY "Finance access can update expenses" ON clinic_expenses FOR UPDATE USING (public.has_finance_access(clinic_id));
CREATE POLICY "Finance access can delete expenses" ON clinic_expenses FOR DELETE USING (public.has_finance_access(clinic_id));

-- RLS Policies: expense_occurrences
-- For occurrences, we need to join back to expenses to check clinic_id
CREATE POLICY "Finance access can select occurrences" ON expense_occurrences FOR SELECT 
USING (EXISTS (SELECT 1 FROM clinic_expenses ce WHERE ce.id = expense_occurrences.expense_id AND public.has_finance_access(ce.clinic_id)));
CREATE POLICY "Finance access can insert occurrences" ON expense_occurrences FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM clinic_expenses ce WHERE ce.id = expense_occurrences.expense_id AND public.has_finance_access(ce.clinic_id)));
CREATE POLICY "Finance access can update occurrences" ON expense_occurrences FOR UPDATE 
USING (EXISTS (SELECT 1 FROM clinic_expenses ce WHERE ce.id = expense_occurrences.expense_id AND public.has_finance_access(ce.clinic_id)));
CREATE POLICY "Finance access can delete occurrences" ON expense_occurrences FOR DELETE 
USING (EXISTS (SELECT 1 FROM clinic_expenses ce WHERE ce.id = expense_occurrences.expense_id AND public.has_finance_access(ce.clinic_id)));
