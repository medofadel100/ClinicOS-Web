-- Enums
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE public.plan_limit_type AS ENUM ('provider_seats', 'patients', 'staff_accounts');

-- Table: clinic_types
CREATE TABLE public.clinic_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code text NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT clinic_types_pkey PRIMARY KEY (id),
    CONSTRAINT clinic_types_code_key UNIQUE (code)
);

-- Table: features
CREATE TABLE public.features (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code text NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    description_ar text,
    description_en text,
    category text NOT NULL,
    base_price_egp numeric(10,2),
    applicable_clinic_type_ids uuid[],
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT features_pkey PRIMARY KEY (id),
    CONSTRAINT features_code_key UNIQUE (code)
);

-- Table: plans
CREATE TABLE public.plans (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code text NOT NULL,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    price_egp numeric(10,2) NOT NULL,
    billing_cycle public.billing_cycle NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT plans_pkey PRIMARY KEY (id),
    CONSTRAINT plans_code_key UNIQUE (code)
);

-- Table: plan_features (junction)
CREATE TABLE public.plan_features (
    plan_id uuid NOT NULL,
    feature_id uuid NOT NULL,
    CONSTRAINT plan_features_pkey PRIMARY KEY (plan_id, feature_id),
    CONSTRAINT plan_features_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE,
    CONSTRAINT plan_features_feature_id_fkey FOREIGN KEY (feature_id) REFERENCES public.features(id) ON DELETE CASCADE
);

-- Table: plan_limits
CREATE TABLE public.plan_limits (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL,
    limit_type public.plan_limit_type NOT NULL,
    max_value integer,
    CONSTRAINT plan_limits_pkey PRIMARY KEY (id),
    CONSTRAINT plan_limits_plan_id_limit_type_key UNIQUE (plan_id, limit_type),
    CONSTRAINT plan_limits_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- RLS for clinic_types
CREATE POLICY "Admins can view clinic_types" ON public.clinic_types
    FOR SELECT TO authenticated USING (true);
    
CREATE POLICY "Super admins can manage clinic_types" ON public.clinic_types
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'));

-- RLS for features
CREATE POLICY "Admins can view features" ON public.features
    FOR SELECT TO authenticated USING (true);
    
CREATE POLICY "Super admins can manage features" ON public.features
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'));

-- RLS for plans
CREATE POLICY "Admins can view plans" ON public.plans
    FOR SELECT TO authenticated USING (true);
    
CREATE POLICY "Super admins can manage plans" ON public.plans
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'));

-- RLS for plan_features
CREATE POLICY "Admins can view plan_features" ON public.plan_features
    FOR SELECT TO authenticated USING (true);
    
CREATE POLICY "Super admins can manage plan_features" ON public.plan_features
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'));

-- RLS for plan_limits
CREATE POLICY "Admins can view plan_limits" ON public.plan_limits
    FOR SELECT TO authenticated USING (true);
    
CREATE POLICY "Super admins can manage plan_limits" ON public.plan_limits
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role = 'super_admin'));
