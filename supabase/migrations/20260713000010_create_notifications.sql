-- Create Enum
CREATE TYPE public.notification_type AS ENUM ('manual_broadcast', 'system_event');

-- Notifications Table
CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    notification_type public.notification_type NOT NULL DEFAULT 'manual_broadcast'::public.notification_type,
    target_role public.admin_role,
    link_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.platform_admins(id);

-- Notification Recipients Table
CREATE TABLE public.notification_recipients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    notification_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.platform_admins(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
-- Super admins can create notifications
CREATE POLICY "Super admins can create notifications" ON public.notifications
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE platform_admins.auth_user_id = auth.uid()
            AND platform_admins.role = 'super_admin'
        )
    );

-- All admins can view notifications that they received
CREATE POLICY "Admins can view their notifications" ON public.notifications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.notification_recipients r
            JOIN public.platform_admins a ON r.admin_id = a.id
            WHERE r.notification_id = notifications.id
            AND a.auth_user_id = auth.uid()
        ) OR EXISTS (
            -- Also allow super admins to see all broadcasts they sent
            SELECT 1 FROM public.platform_admins
            WHERE platform_admins.auth_user_id = auth.uid()
            AND platform_admins.role = 'super_admin'
        )
    );

-- Policies for notification_recipients
-- Super admins can insert recipients when broadcasting
CREATE POLICY "Super admins can insert recipients" ON public.notification_recipients
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE platform_admins.auth_user_id = auth.uid()
            AND platform_admins.role = 'super_admin'
        )
    );

-- Admins can view their own recipient rows
CREATE POLICY "Admins can view own recipient rows" ON public.notification_recipients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE platform_admins.id = notification_recipients.admin_id
            AND platform_admins.auth_user_id = auth.uid()
        )
    );

-- Admins can update their own recipient rows (to mark as read)
CREATE POLICY "Admins can mark own notifications as read" ON public.notification_recipients
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE platform_admins.id = notification_recipients.admin_id
            AND platform_admins.auth_user_id = auth.uid()
        )
    );
