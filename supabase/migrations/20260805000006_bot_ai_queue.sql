-- =============================================================================
-- Migration: AI bot naming + AI reply queue + service followup deliveries
-- 1) whatsapp_bot_config.bot_name  -> the name the AI bot introduces itself with
-- 2) ai_reply_queue                -> AI messages are queued here and answered
--                                     by a scheduled cron (keeps Gemini paced
--                                     under free-tier rate limits + avoids
--                                     Vercel function timeouts)
-- 3) patient_followup_deliveries   -> dedupe log for service follow-up messages
-- =============================================================================

-- 1. bot_name
ALTER TABLE public.whatsapp_bot_config
ADD COLUMN IF NOT EXISTS bot_name text;

-- 2. ai_reply_queue
CREATE TABLE IF NOT EXISTS public.ai_reply_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    phone_number text NOT NULL,
    message_body text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
    error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    processed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ai_reply_queue_pending
    ON public.ai_reply_queue(status, created_at) WHERE status = 'pending';

ALTER TABLE public.ai_reply_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view ai reply queue"
    ON public.ai_reply_queue FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));

-- 3. patient_followup_deliveries
CREATE TABLE IF NOT EXISTS public.patient_followup_deliveries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    rule_id uuid NOT NULL REFERENCES public.service_followup_rules(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    procedure_id uuid REFERENCES public.patient_procedures(id) ON DELETE CASCADE,
    scheduled_date timestamptz NOT NULL,
    sent_at timestamptz,
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'failed')),
    error text,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (rule_id, procedure_id)
);

CREATE INDEX IF NOT EXISTS idx_followup_deliveries_pending
    ON public.patient_followup_deliveries(status, scheduled_date) WHERE status = 'scheduled';

ALTER TABLE public.patient_followup_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view followup deliveries"
    ON public.patient_followup_deliveries FOR SELECT
    USING (public.is_staff_member_of_clinic(clinic_id));
