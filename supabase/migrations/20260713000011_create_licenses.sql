CREATE TYPE public.license_status AS ENUM ('active', 'suspended', 'revoked', 'expired');

CREATE TABLE public.clinic_licenses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL,
    serial_code text NOT NULL,
    signed_payload text NOT NULL,
    status public.license_status NOT NULL DEFAULT 'active',
    issued_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    max_activations integer NOT NULL DEFAULT 1,
    activation_count integer NOT NULL DEFAULT 0,
    created_by uuid,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT clinic_licenses_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_licenses_clinic_id_key UNIQUE (clinic_id),
    CONSTRAINT clinic_licenses_serial_code_key UNIQUE (serial_code),
    CONSTRAINT clinic_licenses_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE,
    CONSTRAINT clinic_licenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.platform_admins(id) ON DELETE SET NULL
);

CREATE TABLE public.license_activations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    license_id uuid NOT NULL,
    hardware_fingerprint text NOT NULL,
    device_label text,
    activated_at timestamp with time zone NOT NULL DEFAULT now(),
    deactivated_at timestamp with time zone,
    CONSTRAINT license_activations_pkey PRIMARY KEY (id),
    CONSTRAINT license_activations_license_id_fkey FOREIGN KEY (license_id) REFERENCES public.clinic_licenses(id) ON DELETE CASCADE
);

ALTER TABLE public.clinic_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;

-- clinic_licenses RLS
CREATE POLICY "Super admins can manage clinic_licenses"
    ON public.clinic_licenses FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Accountants can manage clinic_licenses"
    ON public.clinic_licenses FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'accountant')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'accountant')
    );

CREATE POLICY "Support can view clinic_licenses"
    ON public.clinic_licenses FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'support')
    );

-- license_activations RLS
CREATE POLICY "Super admins can manage license_activations"
    ON public.license_activations FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Accountants can manage license_activations"
    ON public.license_activations FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'accountant')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'accountant')
    );

CREATE POLICY "Support can view license_activations"
    ON public.license_activations FOR SELECT TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'support')
    );
