-- Enum
CREATE TYPE public.override_type AS ENUM ('grant', 'revoke');

-- Table: account_feature_overrides
CREATE TABLE public.account_feature_overrides (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL,
    feature_id uuid NOT NULL,
    override_type public.override_type NOT NULL,
    price_addon_egp numeric(10,2),
    note text,
    granted_by uuid NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT account_feature_overrides_pkey PRIMARY KEY (id),
    CONSTRAINT account_feature_overrides_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE,
    CONSTRAINT account_feature_overrides_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.features(id) ON DELETE CASCADE,
    CONSTRAINT account_feature_overrides_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.platform_admins(id)
);

-- Enable RLS
ALTER TABLE public.account_feature_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admins and accountants can manage overrides" ON public.account_feature_overrides
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant'))
    );

CREATE POLICY "Support can view overrides" ON public.account_feature_overrides
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid()));
