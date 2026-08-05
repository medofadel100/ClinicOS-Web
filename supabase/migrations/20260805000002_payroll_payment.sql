-- Payroll payment tracking: link payroll runs to expense records

ALTER TABLE public.payroll_runs
    ADD COLUMN IF NOT EXISTS paid_at timestamptz,
    ADD COLUMN IF NOT EXISTS expense_id uuid REFERENCES public.clinic_expenses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS payroll_runs_paid_at_idx ON public.payroll_runs (paid_at);
CREATE INDEX IF NOT EXISTS payroll_runs_expense_id_idx ON public.payroll_runs (expense_id);
