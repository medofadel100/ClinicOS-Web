-- Checkpoint 14: Automations

DO $$ BEGIN
    CREATE TYPE time_unit AS ENUM ('hours', 'days', 'months');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS whatsapp_automation_settings (
    clinic_id uuid PRIMARY KEY REFERENCES public.clinics(id) ON DELETE CASCADE,
    no_show_followup_enabled boolean NOT NULL DEFAULT false,
    pre_appointment_reminder_enabled boolean NOT NULL DEFAULT false,
    pre_appointment_reminder_minutes_before integer,
    morning_summary_enabled boolean NOT NULL DEFAULT false,
    morning_summary_time time,
    waitlist_autofill_enabled boolean NOT NULL DEFAULT false,
    patient_upload_intake_enabled boolean NOT NULL DEFAULT false,
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_followup_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    service_id uuid NOT NULL REFERENCES public.clinic_services(id) ON DELETE CASCADE,
    followup_after_value integer NOT NULL,
    followup_after_unit time_unit NOT NULL,
    message_template text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments_waitlist (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    membership_id uuid REFERENCES public.clinic_staff_memberships(id) ON DELETE CASCADE,
    preferred_date date NOT NULL,
    status text NOT NULL DEFAULT 'waiting', -- waiting, notified, booked
    created_at timestamptz DEFAULT now()
);

ALTER TABLE whatsapp_automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_followup_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments_waitlist ENABLE ROW LEVEL SECURITY;

-- Automation Settings Policies
CREATE POLICY "Staff can view automation settings"
    ON whatsapp_automation_settings FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Owners can update automation settings"
    ON whatsapp_automation_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff_memberships m
            JOIN staff_members s ON m.staff_member_id = s.id
            WHERE s.auth_user_id = auth.uid()
              AND m.clinic_id = whatsapp_automation_settings.clinic_id
              AND m.role = 'owner'
              AND m.is_active = true
        )
    );

-- Followup Rules Policies
CREATE POLICY "Staff can view followup rules"
    ON service_followup_rules FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Owners can manage followup rules"
    ON service_followup_rules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinic_staff_memberships m
            JOIN staff_members s ON m.staff_member_id = s.id
            WHERE s.auth_user_id = auth.uid()
              AND m.clinic_id = service_followup_rules.clinic_id
              AND m.role = 'owner'
              AND m.is_active = true
        )
    );

-- Waitlist Policies
CREATE POLICY "Staff can view waitlist"
    ON appointments_waitlist FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

CREATE POLICY "Staff can manage waitlist"
    ON appointments_waitlist FOR ALL
    USING (public.is_staff_member_of_clinic(clinic_id));
