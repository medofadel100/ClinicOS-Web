-- Allow anonymous (public) SELECT on pricing tables so the landing page can display plans dynamically

CREATE POLICY "anon_can_view_plans"
    ON public.plans FOR SELECT
    TO anon USING (is_active = true);

CREATE POLICY "anon_can_view_features"
    ON public.features FOR SELECT
    TO anon USING (is_active = true);

CREATE POLICY "anon_can_view_plan_features"
    ON public.plan_features FOR SELECT
    TO anon USING (true);

CREATE POLICY "anon_can_view_plan_limits"
    ON public.plan_limits FOR SELECT
    TO anon USING (true);

CREATE POLICY "anon_can_view_clinic_types"
    ON public.clinic_types FOR SELECT
    TO anon USING (is_active = true);
