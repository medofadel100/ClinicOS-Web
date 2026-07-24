-- Add email_changed_at to track one-time email changes
ALTER TABLE public.staff_members
ADD COLUMN email_changed_at timestamp with time zone DEFAULT NULL;

-- Ensure auth trigger syncs any manual auth email changes to staff_members if needed
-- (Though typically we update auth, and then update staff_members explicitly)
