ALTER TYPE public.license_status ADD VALUE IF NOT EXISTS 'trial';

ALTER TABLE public.clinic_licenses 
  ADD COLUMN IF NOT EXISTS license_version int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS trial_expires_at timestamp with time zone;

-- Function to auto-set trial_expires_at if status is 'trial'
CREATE OR REPLACE FUNCTION public.set_trial_expires_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'trial' AND NEW.trial_expires_at IS NULL THEN
        NEW.trial_expires_at := now() + interval '7 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_trial_expires_at ON public.clinic_licenses;
CREATE TRIGGER trg_set_trial_expires_at
    BEFORE INSERT OR UPDATE OF status
    ON public.clinic_licenses
    FOR EACH ROW
    EXECUTE FUNCTION public.set_trial_expires_at();
