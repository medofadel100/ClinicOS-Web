-- Create the audit_log table
CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  actor_admin_id uuid NULL,
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid NOT NULL,
  old_value jsonb NULL,
  new_value jsonb NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT audit_log_actor_admin_id_fkey FOREIGN KEY (actor_admin_id) REFERENCES public.platform_admins(id) ON DELETE SET NULL
);

-- RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Super admins and accountants can read audit logs
CREATE POLICY "Super admins and accountants can view audit logs"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_admins
      WHERE platform_admins.auth_user_id = auth.uid()
      AND platform_admins.role IN ('super_admin', 'accountant')
      AND platform_admins.is_active = true
    )
  );

-- No INSERT, UPDATE, DELETE policies because it's only written to via triggers

-- Function to get the current admin ID based on auth.uid()
CREATE OR REPLACE FUNCTION public.get_current_admin_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  SELECT id INTO v_admin_id
  FROM public.platform_admins
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
  RETURN v_admin_id;
END;
$$;

-- Trigger function for clinic_subscriptions
CREATE OR REPLACE FUNCTION public.audit_clinic_subscription_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id uuid;
  v_action text;
BEGIN
  v_actor_id := public.get_current_admin_id();

  IF (TG_OP = 'INSERT') THEN
    v_action := 'subscription.created';
    INSERT INTO public.audit_log (actor_admin_id, action, target_table, target_id, old_value, new_value)
    VALUES (v_actor_id, v_action, 'clinic_subscriptions', NEW.id, NULL, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.plan_id <> NEW.plan_id) THEN
      v_action := 'subscription.plan_changed';
    ELSIF (OLD.status <> NEW.status) THEN
      v_action := 'subscription.status_changed';
    ELSE
      v_action := 'subscription.updated';
    END IF;
    INSERT INTO public.audit_log (actor_admin_id, action, target_table, target_id, old_value, new_value)
    VALUES (v_actor_id, v_action, 'clinic_subscriptions', NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_clinic_subscriptions_trigger
AFTER INSERT OR UPDATE ON public.clinic_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.audit_clinic_subscription_changes();

-- Trigger function for payments
CREATE OR REPLACE FUNCTION public.audit_payment_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id uuid;
  v_action text;
BEGIN
  -- Payments has recorded_by which is already the platform_admin.id, but we'll use our secure function or fallback
  v_actor_id := COALESCE(public.get_current_admin_id(), NEW.recorded_by);

  IF (TG_OP = 'INSERT') THEN
    v_action := 'payment.recorded';
    INSERT INTO public.audit_log (actor_admin_id, action, target_table, target_id, old_value, new_value)
    VALUES (v_actor_id, v_action, 'payments', NEW.id, NULL, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status <> NEW.status) THEN
      v_action := 'payment.status_changed';
    ELSE
      v_action := 'payment.updated';
    END IF;
    INSERT INTO public.audit_log (actor_admin_id, action, target_table, target_id, old_value, new_value)
    VALUES (v_actor_id, v_action, 'payments', NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_payments_trigger
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.audit_payment_changes();

-- Trigger function for account_feature_overrides
CREATE OR REPLACE FUNCTION public.audit_feature_override_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id uuid;
  v_action text;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    v_actor_id := COALESCE(public.get_current_admin_id(), NEW.granted_by);
    v_action := 'override.granted';
    INSERT INTO public.audit_log (actor_admin_id, action, target_table, target_id, old_value, new_value)
    VALUES (v_actor_id, v_action, 'account_feature_overrides', NEW.id, NULL, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    v_actor_id := COALESCE(public.get_current_admin_id(), NEW.granted_by);
    v_action := 'override.updated';
    INSERT INTO public.audit_log (actor_admin_id, action, target_table, target_id, old_value, new_value)
    VALUES (v_actor_id, v_action, 'account_feature_overrides', NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    v_actor_id := COALESCE(public.get_current_admin_id(), OLD.granted_by);
    v_action := 'override.revoked';
    INSERT INTO public.audit_log (actor_admin_id, action, target_table, target_id, old_value, new_value)
    VALUES (v_actor_id, v_action, 'account_feature_overrides', OLD.id, row_to_json(OLD)::jsonb, NULL);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_feature_overrides_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.account_feature_overrides
FOR EACH ROW EXECUTE FUNCTION public.audit_feature_override_changes();
