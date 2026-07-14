-- Checkpoint 10: Entitlements Integration
-- Creates the upgrade_requests table (shared with Admin) so we can request feature upgrades.

CREATE TABLE IF NOT EXISTS upgrade_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    requested_feature text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upgrade_requests_clinic_id ON upgrade_requests(clinic_id);

ALTER TABLE upgrade_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view upgrade requests for their clinic"
    ON upgrade_requests FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can insert upgrade requests for their clinic"
    ON upgrade_requests FOR INSERT
    WITH CHECK (public.is_staff_member_of_clinic(clinic_id));
