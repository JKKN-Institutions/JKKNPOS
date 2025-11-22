-- Add Test Business to Database
-- Run this in Supabase Dashboard > SQL Editor

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
)
ON CONFLICT (email) DO NOTHING
RETURNING id, name, email;

-- 2. Optional: Add some test categories for the business
-- First, get the business_id from the above insert, then run:

-- DO $$
-- DECLARE
--   v_business_id UUID;
-- BEGIN
--   -- Get the business ID
--   SELECT id INTO v_business_id FROM public.businesses WHERE email = 'test@jkkndental.com' LIMIT 1;

--   -- Insert test categories
--   INSERT INTO public.categories (business_id, name, description, sort_order)
--   VALUES
--     (v_business_id, 'Dental Instruments', 'Hand instruments for dental procedures', 1),
--     (v_business_id, 'Consumables', 'Disposable dental supplies', 2),
--     (v_business_id, 'Equipment', 'Dental equipment and machines', 3),
--     (v_business_id, 'Medications', 'Dental medications and anesthetics', 4),
--     (v_business_id, 'Orthodontics', 'Braces and orthodontic supplies', 5)
--   ON CONFLICT DO NOTHING;

--   RAISE NOTICE 'Business and categories created successfully!';
-- END $$;
