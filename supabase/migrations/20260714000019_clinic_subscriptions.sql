-- Checkpoint 7: Clinic Subscriptions and Registration

DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('trial', 'pro', 'enterprise');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'pending_payment', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS clinic_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    plan_name subscription_plan NOT NULL DEFAULT 'trial',
    status subscription_status NOT NULL DEFAULT 'active',
    trial_ends_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clinic_subscriptions_clinic_id ON clinic_subscriptions(clinic_id);

-- RLS
ALTER TABLE clinic_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view their clinic subscriptions" ON clinic_subscriptions FOR SELECT USING (
    clinic_id IN (SELECT c.clinic_id FROM get_user_clinics() c)
);