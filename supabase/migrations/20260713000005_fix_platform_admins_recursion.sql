-- Function to check if a user is a super admin, avoiding recursion
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE auth_user_id = user_id AND role = 'super_admin' AND is_active = true
  );
$$;

-- Drop recursive policies
DROP POLICY IF EXISTS "Super admins can view all" ON public.platform_admins;
DROP POLICY IF EXISTS "Super admins can insert" ON public.platform_admins;
DROP POLICY IF EXISTS "Super admins can update" ON public.platform_admins;

-- Recreate policies using the helper function
CREATE POLICY "Super admins can view all" ON public.platform_admins
    FOR SELECT
    TO authenticated
    USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert" ON public.platform_admins
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update" ON public.platform_admins
    FOR UPDATE
    TO authenticated
    USING (public.is_super_admin(auth.uid()));
