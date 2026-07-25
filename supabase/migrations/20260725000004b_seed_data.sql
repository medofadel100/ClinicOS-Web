-- ============================================
-- PART 2: Run AFTER Part 1 succeeds
-- ============================================
-- Seeds plans, features, limits, and plan_features
-- Safe to re-run (all INSERTs use ON CONFLICT)

-- Plans
INSERT INTO plans (code, name_ar, name_en, price_egp, billing_cycle, is_active)
VALUES
  ('starter', 'باقة ستارتر', 'Starter', 299.00, 'monthly', true),
  ('pro', 'باقة برو', 'Pro', 799.00, 'monthly', true),
  ('enterprise', 'باقة إنتربرايز', 'Enterprise', 1999.00, 'monthly', true)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  price_egp = EXCLUDED.price_egp;

-- Features
INSERT INTO features (code, name_ar, name_en, description_ar, description_en, category, base_price_egp, is_active)
VALUES
  ('dental_module', 'وحدة الأسنان', 'Dental Module', 'عرض وتسجيل بيانات الأسنان', 'Dental charting and records management', 'modules', 0.00, true),
  ('whatsapp_ai', 'واتساب ذكي', 'WhatsApp AI Bot', 'بوت واتساب بالذكاء الاصطناعي', 'AI-powered WhatsApp bot', 'integrations', 0.00, true),
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

-- Starter Limits
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

-- Pro Limits
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

-- Enterprise Limits
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

-- Plan Features: Starter (dental only)
INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'starter' AND f.code = 'dental_module'
ON CONFLICT DO NOTHING;

-- Plan Features: Pro (dental + whatsapp)
INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'pro' AND f.code = 'dental_module'
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'pro' AND f.code = 'whatsapp_ai'
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'pro' AND f.code = 'whatsapp_rule_based'
ON CONFLICT DO NOTHING;

-- Plan Features: Enterprise (everything)
INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'enterprise' AND f.code = 'dental_module'
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'enterprise' AND f.code = 'whatsapp_ai'
ON CONFLICT DO NOTHING;
INSERT INTO plan_features (plan_id, feature_id)
SELECT p.id, f.id FROM plans p, features f WHERE p.code = 'enterprise' AND f.code = 'whatsapp_rule_based'
ON CONFLICT DO NOTHING;
