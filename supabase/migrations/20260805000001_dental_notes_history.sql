-- Dental Chart: Per-tooth notes + treatment history
-- Adds a notes column to dental_chart_entries and a history table
-- that logs every change made to a tooth (condition + notes + who + when).

-- 1. Add notes column to the current tooth state
ALTER TABLE dental_chart_entries
    ADD COLUMN IF NOT EXISTS notes text;

-- 2. dental_chart_history: immutable log of every change per tooth
CREATE TABLE IF NOT EXISTS dental_chart_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    tooth_number integer NOT NULL CHECK (tooth_number >= 11 AND tooth_number <= 48),
    condition tooth_condition NOT NULL DEFAULT 'normal',
    notes text,
    changed_by uuid REFERENCES staff_members(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dental_history_clinic_id ON dental_chart_history(clinic_id);
CREATE INDEX IF NOT EXISTS idx_dental_history_patient_id ON dental_chart_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_dental_history_patient_tooth ON dental_chart_history(patient_id, tooth_number);
CREATE INDEX IF NOT EXISTS idx_dental_history_created_at ON dental_chart_history(created_at);

-- Enable RLS
ALTER TABLE dental_chart_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dental_chart_history
DROP POLICY IF EXISTS "Staff can view dental history in their clinic" ON dental_chart_history;
CREATE POLICY "Staff can view dental history in their clinic"
    ON dental_chart_history FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

DROP POLICY IF EXISTS "Staff can insert dental history in their clinic" ON dental_chart_history;
CREATE POLICY "Staff can insert dental history in their clinic"
    ON dental_chart_history FOR INSERT
    WITH CHECK (public.is_staff_member_of_clinic(clinic_id));

DROP POLICY IF EXISTS "Staff can update dental history in their clinic" ON dental_chart_history;
CREATE POLICY "Staff can update dental history in their clinic"
    ON dental_chart_history FOR UPDATE
    USING (public.is_staff_member_of_clinic(clinic_id));

DROP POLICY IF EXISTS "Staff can delete dental history in their clinic" ON dental_chart_history;
CREATE POLICY "Staff can delete dental history in their clinic"
    ON dental_chart_history FOR DELETE
    USING (public.is_staff_member_of_clinic(clinic_id));
