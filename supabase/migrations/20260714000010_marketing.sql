-- Checkpoint 11: Marketing Tracking

-- 1. marketing_campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name text NOT NULL,
    platform text NOT NULL,
    start_date date,
    end_date date,
    budget_egp numeric(10,2),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_clinic ON marketing_campaigns(clinic_id);

-- Enable RLS
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Staff can read active campaigns (for the dropdown)
CREATE POLICY "Staff can view active marketing campaigns" ON marketing_campaigns FOR SELECT
USING (
  is_active = true AND
  EXISTS (
    SELECT 1 FROM clinic_staff_memberships m 
    JOIN staff_members s ON m.staff_member_id = s.id 
    WHERE m.clinic_id = marketing_campaigns.clinic_id 
      AND m.is_active = true
      AND s.auth_user_id = auth.uid()
  )
);

-- Owners/Admins can do everything
CREATE POLICY "Finance/Admin access can select marketing" ON marketing_campaigns FOR SELECT USING (public.has_finance_access(clinic_id));
CREATE POLICY "Finance/Admin access can insert marketing" ON marketing_campaigns FOR INSERT WITH CHECK (public.has_finance_access(clinic_id));
CREATE POLICY "Finance/Admin access can update marketing" ON marketing_campaigns FOR UPDATE USING (public.has_finance_access(clinic_id));
CREATE POLICY "Finance/Admin access can delete marketing" ON marketing_campaigns FOR DELETE USING (public.has_finance_access(clinic_id));


-- 2. Alter patients table to add marketing_campaign_id
ALTER TABLE patients ADD COLUMN IF NOT EXISTS marketing_campaign_id uuid REFERENCES marketing_campaigns(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_patients_marketing_campaign ON patients(marketing_campaign_id);
