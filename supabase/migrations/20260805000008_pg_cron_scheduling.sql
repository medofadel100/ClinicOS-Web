-- ============================================================================
-- pg_cron scheduling for ClinicOS background jobs
-- Replaces Vercel Cron (Hobby plan blocks schedules that run more than once
-- per day, which fails deployments with the old `vercel.json` crons config).
--
-- The three jobs below fire an authenticated HTTP request at the production
-- app endpoints. The Next.js cron routes validate `Authorization: Bearer
-- <cron_secret>` (the same CRON_SECRET env var), so the value stored in
-- public.cron_settings MUST equal the CRON_SECRET set in Vercel/.env.local.
--
-- The secret is intentionally left blank in this file (never committed to git).
-- After applying, set it once:
--   UPDATE public.cron_settings SET value = '<CRON_SECRET>' WHERE key = 'cron_secret';
-- ============================================================================

-- 1) Extensions --------------------------------------------------------------
create extension if not exists pg_cron with schema pg_cron;
create extension if not exists pg_net;

-- 2) Settings -----------------------------------------------------------------
-- base_url    : production app origin, no trailing slash
-- cron_secret : leave blank in git; set via UPDATE after applying
create table if not exists public.cron_settings (
  key   text primary key,
  value text not null
);

insert into public.cron_settings (key, value) values
  ('base_url',    'https://clinicoseg.vercel.app'),
  ('cron_secret', '')
on conflict (key) do nothing;

-- The table and helper hold the cron secret, so keep them away from
-- anon/authenticated roles (the helper is security definer and reads it).
revoke all on table public.cron_settings from public, anon, authenticated;
grant  all on table public.cron_settings to service_role;

-- 3) Helper: fire an authenticated request at one of the /api/cron/* routes ---
create or replace function public.cron_ping(p_path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base   text;
  v_secret text;
begin
  select value into v_base   from public.cron_settings where key = 'base_url';
  select value into v_secret from public.cron_settings where key = 'cron_secret';

  if v_base is null or v_secret is null or v_secret = '' then
    return; -- not configured yet; skip
  end if;

  perform net.http_get(
    url     := v_base || p_path,
    headers := jsonb_build_object('authorization', 'Bearer ' || v_secret)
  );
end;
$$;

revoke all on function public.cron_ping(text) from public, anon, authenticated;
grant  all on function public.cron_ping(text) to service_role;

-- 4) Jobs ---------------------------------------------------------------------
-- Idempotent: unschedule existing jobs with these names, then recreate them.
select cron.unschedule(jobid)
from cron.job
where jobname in ('ai-replies', 'automations', 'marketing');

-- AI WhatsApp replies: every minute (route paces Gemini calls internally)
select cron.schedule('ai-replies', '* * * * *', $$ select public.cron_ping('/api/cron/ai-replies') $$);

-- Automations + service follow-ups: hourly
select cron.schedule('automations', '0 * * * *', $$ select public.cron_ping('/api/cron/automations') $$);

-- Marketing campaigns: every 5 minutes
select cron.schedule('marketing', '*/5 * * * *', $$ select public.cron_ping('/api/cron/marketing') $$);
