-- Add nurse role to staff_role enum
ALTER TYPE staff_role ADD VALUE IF NOT EXISTS 'nurse';

-- Add staff_type to distinguish between system users and payroll-only staff
ALTER TABLE public.staff_members
ADD COLUMN IF NOT EXISTS staff_type text DEFAULT 'system';

COMMENT ON COLUMN public.staff_members.staff_type IS 'system = has login access, payroll_only = name/role for payroll tracking only';
