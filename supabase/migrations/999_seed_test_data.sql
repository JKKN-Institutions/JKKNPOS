-- SEED TEST DATA FOR TESTING
-- This migration adds test data to verify tables are working correctly
-- Run this ONLY in development/test environments

-- Note: This will be automatically run when applying migrations
-- To manually insert test data, run this migration

-- 1. Insert Test Business
INSERT INTO public.businesses (
  name,
  email,
  phone,
  address,
  gstin,
  gst_type,
  currency,
  tax_rate
) VALUES (
  'JKKN Dental Supplies - Test Store',
  'test@jkkndental.com',
  '9876543210',
  '123 Test Street, Anna Nagar, Chennai - 600040, Tamil Nadu, India',
  '33AABCU9603R1ZM',
  'REGULAR',
  'INR',
  18
) ON CONFLICT DO NOTHING;

-- Get the business ID for subsequent inserts
DO $$
DECLARE
  v_business_id UUID;
  v_cat_instruments UUID;
  v_cat_consumables UUID;
  v_cat_equipment UUID;
  v_cat_medications UUID;
  v_cat_orthodontics UUID;
BEGIN
  -- Get business ID
  SELECT id INTO v_business_id FROM public.businesses WHERE email = 'test@jkkndental.com' LIMIT 1;

  -- 2. Insert Categories
  INSERT INTO public.categories (business_id, name, description, sort_order)
  VALUES
    (v_business_id, 'Dental Instruments', 'Hand instruments for dental procedures', 1),
    (v_business_id, 'Consumables', 'Disposable dental supplies', 2),
    (v_business_id, 'Equipment', 'Dental equipment and machines', 3),
    (v_business_id, 'Medications', 'Dental medications and anesthetics', 4),
    (v_business_id, 'Orthodontics', 'Braces and orthodontic supplies', 5)
  ON CONFLICT DO NOTHING;

  -- Get category IDs
  SELECT id INTO v_cat_instruments FROM public.categories WHERE business_id = v_business_id AND name = 'Dental Instruments' LIMIT 1;
  SELECT id INTO v_cat_consumables FROM public.categories WHERE business_id = v_business_id AND name = 'Consumables' LIMIT 1;
  SELECT id INTO v_cat_equipment FROM public.categories WHERE business_id = v_business_id AND name = 'Equipment' LIMIT 1;
  SELECT id INTO v_cat_medications FROM public.categories WHERE business_id = v_business_id AND name = 'Medications' LIMIT 1;
  SELECT id INTO v_cat_orthodontics FROM public.categories WHERE business_id = v_business_id AND name = 'Orthodontics' LIMIT 1;

  -- 3. Insert Items
  INSERT INTO public.items (business_id, category_id, name, sku, barcode, cost_price, sell_price, stock, min_stock, unit, tax_rate)
  VALUES
    (v_business_id, v_cat_instruments, 'Dental Mirror', 'SKU-DM001', 'DM001', 80, 150, 50, 10, 'pieces', 18),
    (v_business_id, v_cat_instruments, 'Explorer Probe', 'SKU-EP001', 'EP001', 60, 120, 45, 10, 'pieces', 18),
    (v_business_id, v_cat_consumables, 'Cotton Rolls (Pack of 100)', 'SKU-CR001', 'CR001', 150, 250, 8, 20, 'pack', 18),
    (v_business_id, v_cat_consumables, 'Disposable Gloves (Box)', 'SKU-DG001', 'DG001', 300, 450, 25, 10, 'box', 18),
    (v_business_id, v_cat_equipment, 'LED Curing Light', 'SKU-LC001', 'LC001', 5500, 8500, 3, 2, 'pieces', 18),
    (v_business_id, v_cat_equipment, 'Ultrasonic Scaler', 'SKU-US001', 'US001', 10000, 15000, 2, 1, 'pieces', 18),
    (v_business_id, v_cat_medications, 'Lidocaine 2% (10 vials)', 'SKU-LD001', 'LD001', 550, 850, 12, 5, 'box', 18),
    (v_business_id, v_cat_consumables, 'Composite Resin Kit', 'SKU-CK001', 'CK001', 2200, 3500, 6, 3, 'kit', 18),
    (v_business_id, v_cat_orthodontics, 'Orthodontic Brackets Set', 'SKU-OB001', 'OB001', 1800, 2800, 4, 2, 'set', 18),
    (v_business_id, v_cat_consumables, 'Dental Chair Cover (100 pcs)', 'SKU-DC001', 'DC001', 100, 180, 15, 10, 'pack', 18)
  ON CONFLICT (business_id, sku) DO NOTHING;

  -- 4. Insert Customers
  INSERT INTO public.customers (business_id, name, phone, email, address, loyalty_points, credit_limit, credit_balance)
  VALUES
    (v_business_id, 'Dr. Rajesh Kumar', '9876543210', 'rajesh@clinic.com', '123 Medical Street, T. Nagar, Chennai - 600017', 500, 50000, 0),
    (v_business_id, 'City Dental Clinic', '9876543211', 'city@dental.com', '456 Healthcare Ave, RS Puram, Coimbatore - 641002', 1200, 100000, 15000),
    (v_business_id, 'Dr. Priya Sharma', '9876543212', 'priya@dentist.com', '789 Smile Road, Anna Salai, Madurai - 625001', 300, 30000, 0),
    (v_business_id, 'Sunshine Dental Care', '9876543213', 'sunshine@care.com', '321 Dental Lane, Fairlands, Salem - 636016', 800, 75000, 5000),
    (v_business_id, 'Dr. Arun Prakash', '9876543214', 'arun@practice.com', '654 Tooth Street, Thillai Nagar, Trichy - 620018', 150, 25000, 0)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Test data seeded successfully for business: %', v_business_id;
  RAISE NOTICE '   • 5 Categories created';
  RAISE NOTICE '   • 10 Items created';
  RAISE NOTICE '   • 5 Customers created';
END $$;

-- Create test user and profile (commented out - run manually if needed)
-- This requires auth.users access which migrations typically don't have

COMMENT ON TABLE businesses IS 'Test data has been seeded. Login: test@jkkndental.com / Test@123456';
