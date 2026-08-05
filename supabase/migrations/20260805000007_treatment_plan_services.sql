-- =============================================================================
-- Migration: treatment_plan_services
-- Links a treatment plan to multiple clinic services with quantity and pricing,
-- so plans are no longer single-price black boxes.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.treatment_plan_services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_plan_id uuid NOT NULL REFERENCES public.treatment_plans(id) ON DELETE CASCADE,
    service_id uuid REFERENCES public.clinic_services(id) ON DELETE SET NULL,
    service_name text,
    quantity integer NOT NULL DEFAULT 1,
    unit_price_egp numeric(10,2) NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_treatment_plan_services_plan
    ON public.treatment_plan_services(treatment_plan_id);

ALTER TABLE public.treatment_plan_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view plan services"
    ON public.treatment_plan_services FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.treatment_plans tp
        WHERE tp.id = treatment_plan_services.treatment_plan_id
        AND public.is_staff_member_of_clinic(tp.clinic_id)
    ));

CREATE POLICY "Staff can insert plan services"
    ON public.treatment_plan_services FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.treatment_plans tp
        WHERE tp.id = treatment_plan_services.treatment_plan_id
        AND public.is_staff_member_of_clinic(tp.clinic_id)
    ));

CREATE POLICY "Staff can update plan services"
    ON public.treatment_plan_services FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.treatment_plans tp
        WHERE tp.id = treatment_plan_services.treatment_plan_id
        AND public.is_staff_member_of_clinic(tp.clinic_id)
    ));

CREATE POLICY "Staff can delete plan services"
    ON public.treatment_plan_services FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.treatment_plans tp
        WHERE tp.id = treatment_plan_services.treatment_plan_id
        AND public.is_staff_member_of_clinic(tp.clinic_id)
    ));
