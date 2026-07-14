-- Checkpoint 16: WhatsApp Patient Marketing

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft', 'processing', 'completed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE recipient_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS whatsapp_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name text NOT NULL,
    message_template text NOT NULL,
    status campaign_status NOT NULL DEFAULT 'draft',
    created_by uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_campaign_recipients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid NOT NULL REFERENCES whatsapp_campaigns(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    status recipient_status NOT NULL DEFAULT 'pending',
    error_message text,
    sent_at timestamptz,
    UNIQUE (campaign_id, patient_id)
);

ALTER TABLE whatsapp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Campaigns Policies
CREATE POLICY "Staff can view whatsapp campaigns"
    ON whatsapp_campaigns FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Owners can manage whatsapp campaigns"
    ON whatsapp_campaigns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff_memberships m
            JOIN staff_members s ON m.staff_member_id = s.id
            WHERE s.auth_user_id = auth.uid()
              AND m.clinic_id = whatsapp_campaigns.clinic_id
              AND m.role = 'owner'
              AND m.is_active = true
        )
    );

-- Recipients Policies
CREATE POLICY "Staff can view whatsapp recipients"
    ON whatsapp_campaign_recipients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM whatsapp_campaigns c
            WHERE c.id = whatsapp_campaign_recipients.campaign_id
            AND public.is_staff_member_of_clinic(c.clinic_id)
        )
    );

CREATE POLICY "Owners can manage whatsapp recipients"
    ON whatsapp_campaign_recipients FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM whatsapp_campaigns c
            JOIN clinic_staff_memberships m ON c.clinic_id = m.clinic_id
            JOIN staff_members s ON m.staff_member_id = s.id
            WHERE c.id = whatsapp_campaign_recipients.campaign_id
              AND s.auth_user_id = auth.uid()
              AND m.role = 'owner'
              AND m.is_active = true
        )
    );
