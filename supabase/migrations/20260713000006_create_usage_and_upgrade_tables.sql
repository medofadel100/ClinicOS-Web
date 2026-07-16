-- Enums
CREATE TYPE public.usage_type AS ENUM ('ai_tokens', 'whatsapp_messages', 'sms');
CREATE TYPE public.request_status AS ENUM ('open', 'contacted', 'resolved');

-- Table: usage_logs
CREATE TABLE public.usage_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL,
    usage_type public.usage_type NOT NULL,
    quantity numeric NOT NULL,
    period_month date NOT NULL,
    recorded_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT usage_logs_pkey PRIMARY KEY (id),
    CONSTRAINT usage_logs_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE
);

-- Table: upgrade_requests
CREATE TABLE public.upgrade_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL,
    feature_id uuid,
    requested_by_name text,
    message text,
    status public.request_status NOT NULL DEFAULT 'open',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT upgrade_requests_pkey PRIMARY KEY (id),
    CONSTRAINT upgrade_requests_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE,
    CONSTRAINT upgrade_requests_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.features(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Policies for usage_logs
CREATE POLICY "Admins can view usage logs" ON public.usage_logs
    FOR SELECT
    TO authenticated
    USING (public.is_super_admin(auth.uid()) OR EXISTS (
        SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND is_active = true
    ));

-- Policies for upgrade_requests
CREATE POLICY "Admins can view upgrade requests" ON public.upgrade_requests
    FOR SELECT
    TO authenticated
    USING (public.is_super_admin(auth.uid()) OR EXISTS (
        SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND is_active = true
    ));

CREATE POLICY "Admins can update upgrade requests" ON public.upgrade_requests
    FOR UPDATE
    TO authenticated
    USING (public.is_super_admin(auth.uid()) OR EXISTS (
        SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND is_active = true
    ));
