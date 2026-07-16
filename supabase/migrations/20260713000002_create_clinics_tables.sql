-- Enums
CREATE TYPE public.clinic_status AS ENUM ('trial', 'active', 'past_due', 'suspended', 'cancelled');
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled');

-- Table: clinics
CREATE TABLE public.clinics (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    clinic_type_id uuid NOT NULL,
    owner_full_name text NOT NULL,
    owner_email text NOT NULL,
    owner_phone text NOT NULL,
    status public.clinic_status NOT NULL,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT clinics_pkey PRIMARY KEY (id),
    CONSTRAINT clinics_owner_email_key UNIQUE (owner_email),
    CONSTRAINT clinics_clinic_type_id_fkey FOREIGN KEY (clinic_type_id) REFERENCES public.clinic_types(id)
);

-- Table: clinic_subscriptions
CREATE TABLE public.clinic_subscriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status public.subscription_status NOT NULL,
    price_locked_egp numeric(10,2) NOT NULL,
    trial_ends_at timestamp with time zone,
    current_period_start timestamp with time zone NOT NULL,
    current_period_end timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT clinic_subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_subscriptions_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE,
    CONSTRAINT clinic_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);

-- Enable RLS
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clinics
CREATE POLICY "Super admins and accountants can manage clinics" ON public.clinics
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant'))
    );

CREATE POLICY "Support can view clinics" ON public.clinics
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid()));

-- RLS Policies for clinic_subscriptions
CREATE POLICY "Super admins and accountants can manage clinic_subscriptions" ON public.clinic_subscriptions
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant'))
    );

CREATE POLICY "Support can view clinic_subscriptions" ON public.clinic_subscriptions
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid()));
