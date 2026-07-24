-- Drop any existing old policies on clinic_settings
DROP POLICY IF EXISTS "Staff can view clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Owners can manage clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Staff can view clinic settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Owners can update clinic settings" ON public.clinic_settings;

-- Drop any existing old policies on clinics (except super admin/support)
DROP POLICY IF EXISTS "Staff can view their clinics" ON public.clinics;
DROP POLICY IF EXISTS "Owners can update their clinics" ON public.clinics;

-- 1. Clinics Table Policies
CREATE POLICY "Staff can view their clinics" ON public.clinics
FOR SELECT 
USING (id IN (SELECT clinic_id FROM public.get_user_clinics()));

CREATE POLICY "Owners can update their clinics" ON public.clinics
FOR UPDATE 
USING (id IN (SELECT clinic_id FROM public.get_user_clinics() WHERE role = 'owner'));

-- 2. Clinic Settings Table Policies
CREATE POLICY "Staff can view clinic settings" ON public.clinic_settings
FOR SELECT 
USING (clinic_id IN (SELECT clinic_id FROM public.get_user_clinics()));

CREATE POLICY "Owners can update clinic settings" ON public.clinic_settings
FOR ALL 
USING (clinic_id IN (SELECT clinic_id FROM public.get_user_clinics() WHERE role = 'owner'));
