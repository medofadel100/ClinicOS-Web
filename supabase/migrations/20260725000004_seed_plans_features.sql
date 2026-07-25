-- Seed: Plans, Features, Plan Limits, Plan Features
-- Date: 2026-07-25
-- Purpose: Populate initial data for subscription system

-- ============================================
-- 1. Add storage_mb to plan_limit_type enum
-- ============================================
DO $$ BEGIN
  ALTER TYPE plan_limit_type ADD VALUE 'storage_mb';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. Plans (Subscription Packages)
-- ============================================

INSERT INTO plans (code, name_ar, name_en, price_egp, billing_cycle, is_active)
VALUES
  ('starter', 'باقة ستارتر', 'Starter', 299.00, 'monthly', true),
  ('pro', 'باقة برو', 'Pro', 799.00, 'monthly', true),
  ('enterprise', 'باقة إنتربرايز', 'Enterprise', 1999.00, 'monthly', true)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  price_egp = EXCLUDED.price_egp;

-- ============================================
-- 3. Features
-- ============================================
INSERT INTO features (code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active)
VALUES
  ('dental_module', 'وحدة الأسنان', 'Dental Module', 'عرض وتسجيل بيانات الأسنان', 'Dental charting and records management', 'modules', 0.00, true),
  ('whatsapp_ai', 'واتساب ذكي', 'WhatsApp AI Bot', 'بوت واتساب بالذكاء الاصطناعي', 'AI-powered WhatsApp bot for patient communication', 'integrations', 0.00, true),
  ('whatsapp_rule_based', 'واتساب قواعد', 'WhatsApp Rule-Based Bot', 'بوت واتساب مبني على القواعد', 'Rule-based WhatsApp bot', 'integrations', 0.00, true),
  ('extra_storage_5gb', 'مساحة إضافية 5 جيجا', 'Extra Storage 5GB', 'مساحة تخزين إضافية 5 جيجابايت', 'Additional 5GB cloud storage', 'storage', 50.00, true),
  ('extra_storage_10gb', 'مساحة إضافية 10 جيجا', 'Extra Storage 10GB', 'مساحة تخزين إضافية 10 جيجابايت', 'Additional 10GB cloud storage', 'storage', 90.00, true),
  ('extra_storage_50gb', 'مساحة إضافية 50 جيجا', 'Extra Storage 50GB', 'مساحة تخزين إضافية 50 جيجابايت', 'Additional 50GB cloud storage', 'storage', 400.00, true)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description_ar = EXCLUDED.description_ar,
  description_en = EXCLUDED.description_en,
  base_price_egp = EXCLUDED.base_price_egp;

-- ============================================
-- 4. Plan Limits (per plan)
-- ============================================

-- Starter Plan Limits
INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'provider_seats', 2 FROM plans WHERE code = 'starter'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'patients', 200 FROM plans WHERE code = 'starter'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'staff_accounts', 3 FROM plans WHERE code = 'starter'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'storage_mb', 5120 FROM plans WHERE code = 'starter'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

-- Pro Plan Limits
INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'provider_seats', 5 FROM plans WHERE code = 'pro'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'patients', 1000 FROM plans WHERE code = 'pro'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'staff_accounts', 10 FROM plans WHERE code = 'pro'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'storage_mb', 15360 FROM plans WHERE code = 'pro'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

-- Enterprise Plan Limits
INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'provider_seats', 20 FROM plans WHERE code = 'enterprise'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'patients', 5000 FROM plans WHERE code = 'enterprise'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'staff_accounts', 50 FROM plans WHERE code = 'enterprise'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

INSERT INTO plan_limits (plan_id, limit_type, max_value)
SELECT id, 'storage_mb', 51200 FROM plans WHERE code = 'enterprise'
ON CONFLICT (plan_id, limit_type) DO UPDATE SET max_value = EXCLUDED.max_value;

-- ============================================
-- 5. Plan Features (which features each plan includes)
-- ============================================

-- Starter: dental_module only
INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'starter' AND f.code = 'dental_module'
ON CONFLICT DO NOTHING;

-- Pro: dental_module + whatsapp_ai + whatsapp_rule_based
INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'pro' AND f.code = 'dental_module'
ON CONFLICT DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'pro' AND f.code = 'whatsapp_ai'
ON CONFLICT DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'pro' AND f.code = 'whatsapp_rule_based'
ON CONFLICT DO NOTHING;

-- Enterprise: everything
INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'enterprise' AND f.code = 'dental_module'
ON CONFLICT DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'enterprise' AND f.code = 'whatsapp_ai'
ON CONFLICT DO NOTHING;

INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'enterprise' AND f.code = 'whatsapp_rule_based'
ON CONFLICT DO NOTHING;
