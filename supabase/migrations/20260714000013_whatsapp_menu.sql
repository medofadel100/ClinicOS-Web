-- Checkpoint 12: Rule-based WhatsApp bot

DO $$ BEGIN
    CREATE TYPE menu_response_type AS ENUM ('action_book', 'action_cancel', 'action_inquiry', 'static_text');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table for Menu Options
CREATE TABLE IF NOT EXISTS whatsapp_menu_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    option_number integer NOT NULL,
    label_ar text NOT NULL,
    label_en text NOT NULL,
    response_type menu_response_type NOT NULL,
    static_response text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    UNIQUE (clinic_id, option_number)
);

-- Table for Tracking Conversation State
CREATE TABLE IF NOT EXISTS whatsapp_conversation_states (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    phone_number text NOT NULL,
    state jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamptz DEFAULT now(),
    UNIQUE (clinic_id, phone_number)
);

ALTER TABLE whatsapp_menu_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversation_states ENABLE ROW LEVEL SECURITY;

-- Staff can view menu options
CREATE POLICY "Staff can view whatsapp menu options"
    ON whatsapp_menu_options FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

-- Owners can manage menu options
CREATE POLICY "Owners can manage whatsapp menu options"
    ON whatsapp_menu_options FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff_memberships m
            JOIN staff_members s ON m.staff_member_id = s.id
            WHERE s.auth_user_id = auth.uid()
              AND m.clinic_id = whatsapp_menu_options.clinic_id
              AND m.role = 'owner'
              AND m.is_active = true
        )
    );

-- Conversation states are managed by service role (webhook), so no broad RLS needed, 
-- but allow staff to view if necessary for debugging.
CREATE POLICY "Staff can view conversation states"
    ON whatsapp_conversation_states FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

-- Seed default menu options for newly created clinics (Optional trigger, but for now we rely on app logic to seed if empty)
