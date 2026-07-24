-- =============================================================================
-- Migration: Add expiry tracking to medical_inventory_items
-- Adds expires_at column + creates a view for expiry alerts
-- =============================================================================

-- Add expires_at column to track item expiration dates
ALTER TABLE public.medical_inventory_items
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Create index for efficient expiry queries
CREATE INDEX IF NOT EXISTS idx_medical_inventory_items_expires_at
ON public.medical_inventory_items (expires_at)
WHERE expires_at IS NOT NULL;

-- Create a view for items expiring within 30 days (urgent alerts)
CREATE OR REPLACE VIEW public.inventory_expiry_alerts AS
SELECT
  mii.id,
  mii.clinic_id,
  mii.name,
  mii.quantity_on_hand,
  mii.unit,
  mii.category,
  mii.expires_at,
  mii.min_threshold,
  EXTRACT(DAY FROM mii.expires_at - now())::int AS days_until_expiry,
  CASE
    WHEN mii.expires_at <= now() THEN 'expired'
    WHEN mii.expires_at <= now() + interval '7 days' THEN 'critical'
    WHEN mii.expires_at <= now() + interval '30 days' THEN 'warning'
    ELSE 'ok'
  END AS expiry_status
FROM public.medical_inventory_items mii
WHERE mii.expires_at IS NOT NULL
  AND mii.expires_at <= now() + interval '30 days'
  AND mii.quantity_on_hand > 0
ORDER BY mii.expires_at ASC;

-- Add a comment for documentation
COMMENT ON COLUMN public.medical_inventory_items.expires_at IS 'Expiration date for consumable/medication items. NULL means non-perishable.';
COMMENT ON VIEW public.inventory_expiry_alerts IS 'Shows items expiring within 30 days with status: expired, critical (7d), warning (30d)';
