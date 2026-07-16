-- Create Enums
CREATE TYPE public.announcement_channel AS ENUM ('email', 'whatsapp', 'both');
CREATE TYPE public.announcement_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');
CREATE TYPE public.delivery_status AS ENUM ('pending', 'sent', 'failed');

-- Announcements Table
CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    channel public.announcement_channel NOT NULL,
    subject text,
    body text NOT NULL,
    audience_filter jsonb NOT NULL,
    status public.announcement_status NOT NULL DEFAULT 'draft'::public.announcement_status,
    scheduled_at timestamp with time zone,
    sent_at timestamp with time zone,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.platform_admins(id);

-- Announcement Recipients Table
CREATE TABLE public.announcement_recipients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    announcement_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    channel public.announcement_channel NOT NULL,
    status public.delivery_status NOT NULL DEFAULT 'pending'::public.delivery_status,
    error_message text,
    sent_at timestamp with time zone
);

ALTER TABLE ONLY public.announcement_recipients
    ADD CONSTRAINT announcement_recipients_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.announcement_recipients
    ADD CONSTRAINT announcement_recipients_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.announcements(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.announcement_recipients
    ADD CONSTRAINT announcement_recipients_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_recipients ENABLE ROW LEVEL SECURITY;

-- Policies for announcements
CREATE POLICY "Super admins can do all on announcements" ON public.announcements
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE platform_admins.auth_user_id = auth.uid()
            AND platform_admins.role = 'super_admin'
        )
    );

CREATE POLICY "Accountant and support can view announcements" ON public.announcements
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE platform_admins.auth_user_id = auth.uid()
        )
    );

-- Policies for announcement_recipients
CREATE POLICY "Super admins can do all on announcement_recipients" ON public.announcement_recipients
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE platform_admins.auth_user_id = auth.uid()
            AND platform_admins.role = 'super_admin'
        )
    );

CREATE POLICY "Accountant and support can view announcement_recipients" ON public.announcement_recipients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.platform_admins
            WHERE platform_admins.auth_user_id = auth.uid()
        )
    );
