-- Migration: Add GST Compliance and Modifiers System
-- Created: 2025-01-21
-- Description: Adds GST fields for India compliance and modifiers system for restaurants

-- ============================================
-- 1. ADD GST FIELDS TO BUSINESSES
-- ============================================

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS gstin VARCHAR(15),
ADD COLUMN IF NOT EXISTS gst_type VARCHAR(20) CHECK (gst_type IN ('regular', 'composition')),
ADD COLUMN IF NOT EXISTS hsn_code_prefix VARCHAR(8);

COMMENT ON COLUMN businesses.gstin IS 'GST Identification Number (15 characters)';
COMMENT ON COLUMN businesses.gst_type IS 'GST registration type: regular or composition';

-- ============================================
-- 2. ADD GST FIELDS TO CUSTOMERS
-- ============================================

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS gstin VARCHAR(15),
ADD COLUMN IF NOT EXISTS customer_type VARCHAR(10) DEFAULT 'B2C' CHECK (customer_type IN ('B2B', 'B2C'));

COMMENT ON COLUMN customers.gstin IS 'Customer GSTIN for B2B invoices';
COMMENT ON COLUMN customers.customer_type IS 'B2B requires GSTIN, B2C does not';

-- ============================================
-- 3. ADD GST FIELDS TO ITEMS
-- ============================================

ALTER TABLE items
ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(8),
ADD COLUMN IF NOT EXISTS gst_rate DECIMAL(5,2) DEFAULT 18.00 CHECK (gst_rate IN (0, 5, 12, 18, 28)),
ADD COLUMN IF NOT EXISTS cess_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expiry_date DATE;

COMMENT ON COLUMN items.hsn_code IS 'Harmonized System of Nomenclature code';
COMMENT ON COLUMN items.gst_rate IS 'GST rate: 0%, 5%, 12%, 18%, or 28%';
COMMENT ON COLUMN items.cess_rate IS 'Additional cess rate (luxury goods)';

-- ============================================
-- 4. ADD GST FIELDS TO SALES
-- ============================================

ALTER TABLE sales
ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(10) DEFAULT 'B2C' CHECK (invoice_type IN ('B2B', 'B2C', 'Export')),
ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cess_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS place_of_supply VARCHAR(50);

COMMENT ON COLUMN sales.invoice_type IS 'B2B, B2C, or Export';
COMMENT ON COLUMN sales.cgst_amount IS 'Central GST (intra-state)';
COMMENT ON COLUMN sales.sgst_amount IS 'State GST (intra-state)';
COMMENT ON COLUMN sales.igst_amount IS 'Integrated GST (inter-state)';
COMMENT ON COLUMN sales.place_of_supply IS 'State name for GST calculation';

-- ============================================
-- 5. CREATE MODIFIERS TABLE (Restaurant Feature)
-- ============================================

CREATE TABLE IF NOT EXISTS modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  selection_type VARCHAR(20) DEFAULT 'single' CHECK (selection_type IN ('single', 'multiple')),
  is_required BOOLEAN DEFAULT false,
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE modifiers IS 'Modifier groups (e.g., Size, Toppings, Add-ons)';
COMMENT ON COLUMN modifiers.selection_type IS 'single: radio button, multiple: checkbox';
COMMENT ON COLUMN modifiers.is_required IS 'Must select at least one option';

-- ============================================
-- 6. CREATE MODIFIER OPTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS modifier_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE modifier_options IS 'Individual options within a modifier group';
COMMENT ON COLUMN modifier_options.price_adjustment IS 'Additional price for this option (can be positive or negative)';

-- ============================================
-- 7. CREATE ITEM MODIFIERS MAPPING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS item_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, modifier_id)
);

COMMENT ON TABLE item_modifiers IS 'Links products to their available modifiers';

-- ============================================
-- 8. CREATE SALE ITEM MODIFIERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS sale_item_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_item_id UUID NOT NULL REFERENCES sale_items(id) ON DELETE CASCADE,
  modifier_id UUID NOT NULL REFERENCES modifiers(id),
  modifier_option_id UUID NOT NULL REFERENCES modifier_options(id),
  modifier_name VARCHAR(100) NOT NULL,
  option_name VARCHAR(100) NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sale_item_modifiers IS 'Stores selected modifiers for each sale item';

-- ============================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- GST indexes
CREATE INDEX IF NOT EXISTS idx_items_hsn_code ON items(hsn_code);
CREATE INDEX IF NOT EXISTS idx_sales_invoice_type ON sales(invoice_type);
CREATE INDEX IF NOT EXISTS idx_sales_place_of_supply ON sales(place_of_supply);

-- Modifier indexes
CREATE INDEX IF NOT EXISTS idx_modifiers_business_id ON modifiers(business_id);
CREATE INDEX IF NOT EXISTS idx_modifier_options_modifier_id ON modifier_options(modifier_id);
CREATE INDEX IF NOT EXISTS idx_item_modifiers_item_id ON item_modifiers(item_id);
CREATE INDEX IF NOT EXISTS idx_sale_item_modifiers_sale_item_id ON sale_item_modifiers(sale_item_id);

-- ============================================
-- 10. ADD RLS POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_item_modifiers ENABLE ROW LEVEL SECURITY;

-- Modifiers policies
CREATE POLICY "Users can view modifiers in their business"
  ON modifiers FOR SELECT
  USING (business_id IN (
    SELECT business_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create modifiers in their business"
  ON modifiers FOR INSERT
  WITH CHECK (business_id IN (
    SELECT business_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update modifiers in their business"
  ON modifiers FOR UPDATE
  USING (business_id IN (
    SELECT business_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete modifiers in their business"
  ON modifiers FOR DELETE
  USING (business_id IN (
    SELECT business_id FROM profiles WHERE id = auth.uid()
  ));

-- Modifier options policies
CREATE POLICY "Users can view modifier options in their business"
  ON modifier_options FOR SELECT
  USING (modifier_id IN (
    SELECT id FROM modifiers WHERE business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can create modifier options"
  ON modifier_options FOR INSERT
  WITH CHECK (modifier_id IN (
    SELECT id FROM modifiers WHERE business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can update modifier options"
  ON modifier_options FOR UPDATE
  USING (modifier_id IN (
    SELECT id FROM modifiers WHERE business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete modifier options"
  ON modifier_options FOR DELETE
  USING (modifier_id IN (
    SELECT id FROM modifiers WHERE business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Item modifiers policies (inherit from items)
CREATE POLICY "Users can view item modifiers"
  ON item_modifiers FOR SELECT
  USING (item_id IN (
    SELECT id FROM items WHERE business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can create item modifiers"
  ON item_modifiers FOR INSERT
  WITH CHECK (item_id IN (
    SELECT id FROM items WHERE business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete item modifiers"
  ON item_modifiers FOR DELETE
  USING (item_id IN (
    SELECT id FROM items WHERE business_id IN (
      SELECT business_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Sale item modifiers policies (inherit from sales)
CREATE POLICY "Users can view sale item modifiers"
  ON sale_item_modifiers FOR SELECT
  USING (sale_item_id IN (
    SELECT id FROM sale_items WHERE sale_id IN (
      SELECT id FROM sales WHERE business_id IN (
        SELECT business_id FROM profiles WHERE id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can create sale item modifiers"
  ON sale_item_modifiers FOR INSERT
  WITH CHECK (sale_item_id IN (
    SELECT id FROM sale_items WHERE sale_id IN (
      SELECT id FROM sales WHERE business_id IN (
        SELECT business_id FROM profiles WHERE id = auth.uid()
      )
    )
  ));

-- ============================================
-- 11. CREATE UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_modifiers_updated_at
  BEFORE UPDATE ON modifiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifier_options_updated_at
  BEFORE UPDATE ON modifier_options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample modifier groups
-- INSERT INTO modifiers (business_id, name, display_name, selection_type, is_required) VALUES
-- ((SELECT id FROM businesses LIMIT 1), 'size', 'Size', 'single', true),
-- ((SELECT id FROM businesses LIMIT 1), 'toppings', 'Toppings', 'multiple', false),
-- ((SELECT id FROM businesses LIMIT 1), 'add_ons', 'Add-ons', 'multiple', false);

-- Insert sample modifier options
-- INSERT INTO modifier_options (modifier_id, name, price_adjustment, is_default) VALUES
-- ((SELECT id FROM modifiers WHERE name = 'size' LIMIT 1), 'Small', 0, true),
-- ((SELECT id FROM modifiers WHERE name = 'size' LIMIT 1), 'Medium', 50, false),
-- ((SELECT id FROM modifiers WHERE name = 'size' LIMIT 1), 'Large', 100, false);
