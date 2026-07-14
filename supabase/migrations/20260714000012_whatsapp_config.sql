-- Checkpoint 11: WhatsApp Connection

DO $$ BEGIN
    CREATE TYPE bot_mode AS ENUM ('none', 'rule_based', 'ai');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE bot_personality AS ENUM ('formal', 'friendly', 'playful');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS whatsapp_bot_config (
    clinic_id uuid PRIMARY KEY REFERENCES public.clinics(id) ON DELETE CASCADE,
    mode bot_mode NOT NULL DEFAULT 'none',
    personality bot_personality,
    custom_instructions text,
    is_connected boolean NOT NULL DEFAULT false,
    connected_phone_number text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE whatsapp_bot_config ENABLE ROW LEVEL SECURITY;

-- Staff can view config for their clinic
CREATE POLICY "Staff can view whatsapp config in their clinic"
    ON whatsapp_bot_config FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

-- Only owners can update config (for settings pages)
CREATE POLICY "Owners can update whatsapp config"
    ON whatsapp_bot_config FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff_memberships m
            JOIN staff_members s ON m.staff_member_id = s.id
            WHERE s.auth_user_id = auth.uid()
              AND m.clinic_id = whatsapp_bot_config.clinic_id
              AND m.role = 'owner'
              AND m.is_active = true
        )
    );

-- Owners can insert config
CREATE POLICY "Owners can insert whatsapp config"
    ON whatsapp_bot_config FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinic_staff_memberships m
            JOIN staff_members s ON m.staff_member_id = s.id
            WHERE s.auth_user_id = auth.uid()
              AND m.clinic_id = clinic_id
              AND m.role = 'owner'
              AND m.is_active = true
        )
    );
