-- Enums
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'accountant', 'support');
CREATE TYPE public.language_pref AS ENUM ('ar', 'en');

-- Table: platform_admins
CREATE TABLE public.platform_admins (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL,
    full_name text NOT NULL,
    role public.admin_role NOT NULL,
    preferred_language public.language_pref NOT NULL DEFAULT 'ar',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT platform_admins_pkey PRIMARY KEY (id),
    CONSTRAINT platform_admins_auth_user_id_key UNIQUE (auth_user_id),
    CONSTRAINT platform_admins_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view their own row" ON public.platform_admins
    FOR SELECT
    TO authenticated
    USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can update their own row" ON public.platform_admins
    FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Super admins can view all" ON public.platform_admins
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE auth_user_id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can insert" ON public.platform_admins
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE auth_user_id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admins can update" ON public.platform_admins
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE auth_user_id = auth.uid() AND role = 'super_admin'
        )
    );
