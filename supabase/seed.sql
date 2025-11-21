-- =====================================================
-- JKKN Dental Store POS - Seed Data
-- Run after creating the schema and a test user
-- =====================================================

-- Note: Replace 'YOUR_USER_ID' and 'YOUR_BUSINESS_ID' with actual UUIDs after creating a user

-- Sample Categories for Dental Store
-- INSERT INTO categories (id, business_id, name, description, sort_order) VALUES
-- (uuid_generate_v4(), 'YOUR_BUSINESS_ID', 'Dental Instruments', 'Dental examination and treatment instruments', 1),
-- (uuid_generate_v4(), 'YOUR_BUSINESS_ID', 'Dental Materials', 'Filling materials, cements, and composites', 2),
-- (uuid_generate_v4(), 'YOUR_BUSINESS_ID', 'Oral Care Products', 'Toothpaste, mouthwash, and oral hygiene products', 3),
-- (uuid_generate_v4(), 'YOUR_BUSINESS_ID', 'Dental Equipment', 'Dental chairs, lights, and machinery', 4),
-- (uuid_generate_v4(), 'YOUR_BUSINESS_ID', 'Orthodontic Supplies', 'Braces, wires, and orthodontic materials', 5),
-- (uuid_generate_v4(), 'YOUR_BUSINESS_ID', 'Disposables', 'Gloves, masks, and disposable items', 6),
-- (uuid_generate_v4(), 'YOUR_BUSINESS_ID', 'Medicines', 'Dental medications and prescriptions', 7);

-- Sample Dental Items
-- After inserting categories, use the category IDs to insert items

-- Example dental items (prices in INR):
-- - Dental Mirror: ₹150
-- - Dental Explorer: ₹120
-- - Composite Filling Kit: ₹2500
-- - Dental Cement: ₹850
-- - Tooth Extraction Forceps: ₹1200
-- - Dental Floss (Pack of 50): ₹450
-- - Mouthwash 500ml: ₹180
-- - Disposable Dental Gloves (Box of 100): ₹550
-- - N95 Masks (Box of 50): ₹750
-- - Anesthetic Cartridges (Box of 50): ₹1800
-- - Scaling Instruments Set: ₹3500
-- - Orthodontic Brackets Kit: ₹4500
-- - Dental X-Ray Film (Box of 100): ₹2200
-- - Impression Material: ₹1650
-- - Temporary Crown Kit: ₹950

-- Sample Insert Statements (uncomment and modify with actual IDs):
/*
INSERT INTO items (business_id, category_id, name, description, price, cost, stock, min_stock, unit, barcode, sku, is_active) VALUES
('YOUR_BUSINESS_ID', 'INSTRUMENTS_CATEGORY_ID', 'Dental Mirror', 'Stainless steel dental examination mirror', 150.00, 80.00, 50, 10, 'pieces', '8901234567890', 'DM-001', true),
('YOUR_BUSINESS_ID', 'INSTRUMENTS_CATEGORY_ID', 'Dental Explorer', 'Double-ended dental explorer probe', 120.00, 65.00, 40, 10, 'pieces', '8901234567891', 'DE-001', true),
('YOUR_BUSINESS_ID', 'MATERIALS_CATEGORY_ID', 'Composite Filling Kit', 'Universal composite resin filling kit', 2500.00, 1800.00, 15, 5, 'kit', '8901234567892', 'CF-001', true),
('YOUR_BUSINESS_ID', 'MATERIALS_CATEGORY_ID', 'Dental Cement GIC', 'Glass Ionomer Cement for restorations', 850.00, 600.00, 25, 10, 'bottle', '8901234567893', 'DC-001', true),
('YOUR_BUSINESS_ID', 'INSTRUMENTS_CATEGORY_ID', 'Extraction Forceps Set', 'Complete tooth extraction forceps set', 3500.00, 2500.00, 10, 3, 'set', '8901234567894', 'EF-001', true),
('YOUR_BUSINESS_ID', 'ORAL_CARE_CATEGORY_ID', 'Premium Dental Floss', 'Waxed dental floss 50m pack', 450.00, 280.00, 100, 20, 'pack', '8901234567895', 'DF-001', true),
('YOUR_BUSINESS_ID', 'ORAL_CARE_CATEGORY_ID', 'Antiseptic Mouthwash 500ml', 'Chlorhexidine mouthwash', 180.00, 100.00, 80, 20, 'bottle', '8901234567896', 'MW-001', true),
('YOUR_BUSINESS_ID', 'DISPOSABLES_CATEGORY_ID', 'Latex Gloves Box', 'Disposable latex examination gloves - 100 pcs', 550.00, 380.00, 50, 15, 'box', '8901234567897', 'LG-001', true),
('YOUR_BUSINESS_ID', 'DISPOSABLES_CATEGORY_ID', 'N95 Masks Box', 'Medical N95 respirator masks - 50 pcs', 750.00, 500.00, 40, 10, 'box', '8901234567898', 'NM-001', true),
('YOUR_BUSINESS_ID', 'MEDICINES_CATEGORY_ID', 'Anesthetic Cartridges', 'Lidocaine 2% with epinephrine - 50 cartridges', 1800.00, 1200.00, 30, 10, 'box', '8901234567899', 'AC-001', true);
*/

-- Sample Customers
/*
INSERT INTO customers (business_id, name, phone, email, address, loyalty_points) VALUES
('YOUR_BUSINESS_ID', 'Dr. Clinic A', '9876543210', 'clinica@email.com', '123 Medical Street, City', 500),
('YOUR_BUSINESS_ID', 'Smile Dental Care', '9876543211', 'smile@dental.com', '456 Health Avenue, Town', 1200),
('YOUR_BUSINESS_ID', 'City Dental Hospital', '9876543212', 'city@dental.com', '789 Hospital Road, Metro', 2500),
('YOUR_BUSINESS_ID', 'Dr. Kumar Dental', '9876543213', 'kumar@dental.com', '321 Clinic Lane, Village', 800);
*/
