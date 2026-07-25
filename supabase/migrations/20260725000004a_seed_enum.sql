-- ============================================
-- PART 1: Run this FIRST, then click "Run"
-- ============================================
-- Adds 'storage_mb' to the plan_limit_type enum
ALTER TYPE plan_limit_type ADD VALUE IF NOT EXISTS 'storage_mb';
