-- Enums
CREATE TYPE public.payment_method AS ENUM ('bank_transfer', 'cash', 'vodafone_cash', 'instapay', 'other');
CREATE TYPE public.payment_status AS ENUM ('pending', 'confirmed', 'failed');

-- Table: payments
CREATE TABLE public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL,
    subscription_id uuid,
    amount_egp numeric(10,2) NOT NULL,
    payment_method public.payment_method NOT NULL,
    status public.payment_status NOT NULL,
    reference_note text,
    recorded_by uuid NOT NULL,
    paid_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE,
    CONSTRAINT payments_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.clinic_subscriptions(id) ON DELETE SET NULL,
    CONSTRAINT payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.platform_admins(id)
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admins and accountants can manage payments" ON public.payments
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant'))
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid() AND role IN ('super_admin', 'accountant'))
    );

CREATE POLICY "Support can view payments" ON public.payments
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE auth_user_id = auth.uid()));
