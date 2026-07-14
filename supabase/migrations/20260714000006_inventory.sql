-- Checkpoint 7: Inventory Management

-- ENUMS
DO $$ BEGIN
    CREATE TYPE inventory_txn_type AS ENUM ('restock', 'usage', 'adjustment');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. medical_inventory_items
CREATE TABLE IF NOT EXISTS medical_inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name text NOT NULL,
    unit text NOT NULL,
    quantity_on_hand numeric NOT NULL DEFAULT 0,
    min_threshold numeric NOT NULL DEFAULT 0,
    category text,
    updated_at timestamptz DEFAULT now()
);

-- 2. inventory_transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES medical_inventory_items(id) ON DELETE CASCADE,
    change_quantity numeric NOT NULL,
    transaction_type inventory_txn_type NOT NULL,
    note text,
    created_by uuid REFERENCES staff_members(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_medical_inventory_items_clinic_id ON medical_inventory_items(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_clinic_id ON inventory_transactions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(item_id);

-- PostgreSQL Trigger for quantity_on_hand
CREATE OR REPLACE FUNCTION update_inventory_quantity_on_hand()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE medical_inventory_items
    SET quantity_on_hand = quantity_on_hand + NEW.change_quantity,
        updated_at = now()
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to allow idempotency
DROP TRIGGER IF EXISTS trg_update_inventory_quantity ON inventory_transactions;

CREATE TRIGGER trg_update_inventory_quantity
AFTER INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION update_inventory_quantity_on_hand();

-- Enable RLS
ALTER TABLE medical_inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: medical_inventory_items
CREATE POLICY "Staff can view inventory items in their clinic" ON medical_inventory_items FOR SELECT USING (public.is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert inventory items in their clinic" ON medical_inventory_items FOR INSERT WITH CHECK (public.is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can update inventory items in their clinic" ON medical_inventory_items FOR UPDATE USING (public.is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete inventory items in their clinic" ON medical_inventory_items FOR DELETE USING (public.is_staff_member_of_clinic(clinic_id));

-- RLS Policies: inventory_transactions
CREATE POLICY "Staff can view inventory transactions in their clinic" ON inventory_transactions FOR SELECT USING (public.is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can insert inventory transactions in their clinic" ON inventory_transactions FOR INSERT WITH CHECK (public.is_staff_member_of_clinic(clinic_id));
-- Transactions should generally be immutable ledger entries, but we allow update/delete just in case, restricted by RLS
CREATE POLICY "Staff can update inventory transactions in their clinic" ON inventory_transactions FOR UPDATE USING (public.is_staff_member_of_clinic(clinic_id));
CREATE POLICY "Staff can delete inventory transactions in their clinic" ON inventory_transactions FOR DELETE USING (public.is_staff_member_of_clinic(clinic_id));
