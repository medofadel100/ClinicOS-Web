-- ============================================================
-- Harden INSERT/UPDATE RLS policies on core clinic tables
-- Applies to the live DB. Safe to run multiple times.
--
-- Findings from pg_policies (live DB):
--   * All INSERT policies already have WITH CHECK (no INSERT-null gap).
--   * UPDATE policies have USING only, NO WITH CHECK -> a user could
--     change clinic_id on an update and move a row to another clinic.
--   * staff_attendance INSERT/WITH-CHECK verifies membership ownership
--     but not that the membership's clinic matches the row's clinic_id.
-- ============================================================

-- ------------------------------------------------------------
-- 1. patients: keep clinic_id inside the actor's clinic on update
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can update patients in their clinic" ON public.patients;
CREATE POLICY "Staff can update patients in their clinic" ON public.patients
  FOR UPDATE TO public
  USING (public.is_staff_member_of_clinic(clinic_id))
  WITH CHECK (public.is_staff_member_of_clinic(clinic_id));

-- ------------------------------------------------------------
-- 2. clinic_expenses: keep clinic_id inside finance-accessible clinic
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Finance access can update expenses" ON public.clinic_expenses;
CREATE POLICY "Finance access can update expenses" ON public.clinic_expenses
  FOR UPDATE TO public
  USING (public.has_finance_access(clinic_id))
  WITH CHECK (public.has_finance_access(clinic_id));

-- ------------------------------------------------------------
-- 3. payroll_runs: keep clinic_id inside finance-accessible clinic
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Finance access can update payroll runs" ON public.payroll_runs;
CREATE POLICY "Finance access can update payroll runs" ON public.payroll_runs
  FOR UPDATE TO public
  USING (public.has_finance_access(clinic_id))
  WITH CHECK (public.has_finance_access(clinic_id));

-- ------------------------------------------------------------
-- 4. marketing_campaigns: keep clinic_id inside finance-accessible clinic
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Finance/Admin access can update marketing" ON public.marketing_campaigns;
CREATE POLICY "Finance/Admin access can update marketing" ON public.marketing_campaigns
  FOR UPDATE TO public
  USING (public.has_finance_access(clinic_id))
  WITH CHECK (public.has_finance_access(clinic_id));

-- ------------------------------------------------------------
-- 5. staff_attendance INSERT: the membership must belong to the
--    acting user AND belong to the row's clinic_id
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can insert own attendance" ON public.staff_attendance;
CREATE POLICY "Staff can insert own attendance" ON public.staff_attendance
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      JOIN staff_members s ON m.staff_member_id = s.id
      WHERE m.id = staff_attendance.membership_id
        AND m.clinic_id = staff_attendance.clinic_id
        AND s.auth_user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 6. staff_attendance own UPDATE: same clinic-match constraint
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can update own attendance" ON public.staff_attendance;
CREATE POLICY "Staff can update own attendance" ON public.staff_attendance
  FOR UPDATE TO public
  USING (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      JOIN staff_members s ON m.staff_member_id = s.id
      WHERE m.id = staff_attendance.membership_id
        AND s.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinic_staff_memberships m
      JOIN staff_members s ON m.staff_member_id = s.id
      WHERE m.id = staff_attendance.membership_id
        AND m.clinic_id = staff_attendance.clinic_id
        AND s.auth_user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 7. staff_attendance admin UPDATE: keep clinic_id in their clinic
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Admin access can update all attendance" ON public.staff_attendance;
CREATE POLICY "Admin access can update all attendance" ON public.staff_attendance
  FOR UPDATE TO public
  USING (public.has_finance_access(clinic_id))
  WITH CHECK (public.has_finance_access(clinic_id));
