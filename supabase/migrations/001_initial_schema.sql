-- =====================================================
-- JKKN Dental Store POS - Database Schema
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('OWNER', 'MANAGER', 'STAFF', 'HELPER');
CREATE TYPE sale_status AS ENUM ('COMPLETED', 'PARKED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'UPI', 'WALLET');
CREATE TYPE stock_movement_type AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

-- =====================================================
-- TABLES
-- =====================================================

-- Businesses Table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    tax_rate DECIMAL(5, 2) DEFAULT 18.00,
    currency TEXT DEFAULT 'INR',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'STAFF',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items Table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    cost DECIMAL(12, 2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    unit TEXT DEFAULT 'pieces',
    barcode TEXT,
    sku TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    credit_balance DECIMAL(12, 2) DEFAULT 0,
    total_purchases DECIMAL(12, 2) DEFAULT 0,
    last_visit TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    sale_number TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(12, 2) DEFAULT 0,
    discount_type TEXT DEFAULT 'fixed',
    tax DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status sale_status DEFAULT 'COMPLETED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, sale_number)
);

-- Sale Items Table
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id),
    name TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    discount DECIMAL(12, 2) DEFAULT 0,
    tax DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    method payment_method NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Movements Table
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    type stock_movement_type NOT NULL,
    reason TEXT,
    user_id UUID NOT NULL REFERENCES profiles(id),
    reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    payment_method TEXT,
    user_id UUID NOT NULL REFERENCES profiles(id),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Items indexes
CREATE INDEX idx_items_business ON items(business_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_active ON items(business_id, is_active);

-- Sales indexes
CREATE INDEX idx_sales_business ON sales(business_id);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_user ON sales(user_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_created ON sales(created_at);
CREATE INDEX idx_sales_business_date ON sales(business_id, created_at);

-- Sale items indexes
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_item ON sale_items(item_id);

-- Customers indexes
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Stock movements indexes
CREATE INDEX idx_stock_movements_item ON stock_movements(item_id);
CREATE INDEX idx_stock_movements_business ON stock_movements(business_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate sale number
CREATE OR REPLACE FUNCTION generate_sale_number(p_business_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_count INTEGER;
    v_date TEXT;
BEGIN
    v_date := TO_CHAR(NOW(), 'YYMMDD');

    SELECT COUNT(*) + 1 INTO v_count
    FROM sales
    WHERE business_id = p_business_id
    AND created_at::DATE = CURRENT_DATE;

    RETURN 'INV-' || v_date || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update item stock after sale
CREATE OR REPLACE FUNCTION update_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE items
        SET stock = stock - NEW.quantity
        WHERE id = NEW.item_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE items
        SET stock = stock + OLD.quantity
        WHERE id = OLD.item_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to add loyalty points
CREATE OR REPLACE FUNCTION add_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_id IS NOT NULL AND NEW.status = 'COMPLETED' THEN
        UPDATE customers
        SET loyalty_points = loyalty_points + FLOOR(NEW.total),
            total_purchases = total_purchases + NEW.total,
            last_visit = NOW()
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at triggers
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
    BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stock update trigger
CREATE TRIGGER update_stock_on_sale_item
    AFTER INSERT OR DELETE ON sale_items
    FOR EACH ROW EXECUTE FUNCTION update_stock_after_sale();

-- Loyalty points trigger
CREATE TRIGGER add_loyalty_points_on_sale
    AFTER INSERT OR UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION add_loyalty_points();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Businesses policies
CREATE POLICY "Users can view their business"
    ON businesses FOR SELECT
    USING (
        id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Owners can update their business"
    ON businesses FOR UPDATE
    USING (
        id IN (
            SELECT business_id FROM profiles
            WHERE id = auth.uid() AND role = 'OWNER'
        )
    );

-- Profiles policies
CREATE POLICY "Users can view profiles in their business"
    ON profiles FOR SELECT
    USING (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Owners can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (
        business_id IN (
            SELECT business_id FROM profiles
            WHERE id = auth.uid() AND role IN ('OWNER', 'MANAGER')
        )
        OR
        NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
    );

-- Categories policies
CREATE POLICY "Users can view categories in their business"
    ON categories FOR SELECT
    USING (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert categories"
    ON categories FOR INSERT
    WITH CHECK (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update categories"
    ON categories FOR UPDATE
    USING (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Managers can delete categories"
    ON categories FOR DELETE
    USING (
        business_id IN (
            SELECT business_id FROM profiles
            WHERE id = auth.uid() AND role IN ('OWNER', 'MANAGER')
        )
    );

-- Items policies
CREATE POLICY "Users can view items in their business"
    ON items FOR SELECT
    USING (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert items"
    ON items FOR INSERT
    WITH CHECK (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update items"
    ON items FOR UPDATE
    USING (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Managers can delete items"
    ON items FOR DELETE
    USING (
        business_id IN (
            SELECT business_id FROM profiles
            WHERE id = auth.uid() AND role IN ('OWNER', 'MANAGER')
        )
    );

-- Customers policies
CREATE POLICY "Users can view customers in their business"
    ON customers FOR SELECT
    USING (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert customers"
    ON customers FOR INSERT
    WITH CHECK (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update customers"
    ON customers FOR UPDATE
    USING (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Managers can delete customers"
    ON customers FOR DELETE
    USING (
        business_id IN (
            SELECT business_id FROM profiles
            WHERE id = auth.uid() AND role IN ('OWNER', 'MANAGER')
        )
    );

-- Sales policies
CREATE POLICY "Users can view sales in their business"
    ON sales FOR SELECT
    USING (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert sales"
    ON sales FOR INSERT
    WITH CHECK (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update sales"
    ON sales FOR UPDATE
    USING (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

-- Sale items policies
CREATE POLICY "Users can view sale items"
    ON sale_items FOR SELECT
    USING (
        sale_id IN (
            SELECT id FROM sales
            WHERE business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can insert sale items"
    ON sale_items FOR INSERT
    WITH CHECK (
        sale_id IN (
            SELECT id FROM sales
            WHERE business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Payments policies
CREATE POLICY "Users can view payments"
    ON payments FOR SELECT
    USING (
        sale_id IN (
            SELECT id FROM sales
            WHERE business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can insert payments"
    ON payments FOR INSERT
    WITH CHECK (
        sale_id IN (
            SELECT id FROM sales
            WHERE business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Stock movements policies
CREATE POLICY "Users can view stock movements"
    ON stock_movements FOR SELECT
    USING (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert stock movements"
    ON stock_movements FOR INSERT
    WITH CHECK (
        business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
    );

-- Expenses policies
CREATE POLICY "Users with access can view expenses"
    ON expenses FOR SELECT
    USING (
        business_id IN (
            SELECT business_id FROM profiles
            WHERE id = auth.uid() AND role IN ('OWNER', 'MANAGER')
        )
    );

CREATE POLICY "Users with access can insert expenses"
    ON expenses FOR INSERT
    WITH CHECK (
        business_id IN (
            SELECT business_id FROM profiles
            WHERE id = auth.uid() AND role IN ('OWNER', 'MANAGER')
        )
    );

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage buckets (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Storage policies (run after creating buckets)
-- CREATE POLICY "Anyone can view item images" ON storage.objects FOR SELECT USING (bucket_id = 'item-images');
-- CREATE POLICY "Authenticated users can upload item images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');
