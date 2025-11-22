-- =============================================
-- Purchase Orders & Suppliers Module - Complete Implementation
-- Migration: 012_purchase_orders_suppliers_module
-- =============================================
-- This migration creates comprehensive purchase order and supplier management
-- for inventory restocking, supplier tracking, and procurement analytics.

-- =============================================
-- TABLES
-- =============================================

-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    gstin TEXT,
    payment_terms TEXT, -- NET30, NET60, COD, etc
    credit_limit NUMERIC DEFAULT 0,
    current_balance NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_supplier_name UNIQUE(business_id, name)
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    po_number TEXT NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    shipping_cost NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_po_status CHECK (status IN ('DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')),
    CONSTRAINT unique_po_number UNIQUE(business_id, po_number)
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id),
    quantity_ordered NUMERIC NOT NULL,
    quantity_received NUMERIC DEFAULT 0,
    unit_cost NUMERIC NOT NULL,
    tax_rate NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create supplier_payments table
CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    purchase_order_id UUID REFERENCES public.purchase_orders(id),
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    reference TEXT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 1. GET BUSINESS SUPPLIERS
-- =============================================
-- Retrieves all suppliers with purchase statistics
CREATE OR REPLACE FUNCTION public.get_business_suppliers(
    p_business_id UUID,
    p_is_active BOOLEAN DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'name',
    p_sort_order TEXT DEFAULT 'ASC'
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    gstin TEXT,
    payment_terms TEXT,
    credit_limit NUMERIC,
    current_balance NUMERIC,
    is_active BOOLEAN,
    total_purchases NUMERIC,
    purchase_count BIGINT,
    last_purchase_date DATE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.contact_person,
        s.email,
        s.phone,
        s.address,
        s.gstin,
        s.payment_terms,
        s.credit_limit,
        s.current_balance,
        s.is_active,
        COALESCE(SUM(po.total), 0) as total_purchases,
        COUNT(po.id)::BIGINT as purchase_count,
        MAX(po.order_date) as last_purchase_date,
        s.created_at,
        s.updated_at
    FROM public.suppliers s
    LEFT JOIN public.purchase_orders po ON s.id = po.supplier_id AND po.status != 'CANCELLED'
    WHERE s.business_id = p_business_id
        AND (p_is_active IS NULL OR s.is_active = p_is_active)
        AND (
            p_search_term IS NULL OR
            s.name ILIKE '%' || p_search_term || '%' OR
            s.contact_person ILIKE '%' || p_search_term || '%' OR
            s.phone ILIKE '%' || p_search_term || '%'
        )
    GROUP BY s.id, s.name, s.contact_person, s.email, s.phone, s.address,
             s.gstin, s.payment_terms, s.credit_limit, s.current_balance,
             s.is_active, s.created_at, s.updated_at
    ORDER BY
        CASE WHEN p_sort_by = 'name' AND p_sort_order = 'ASC' THEN s.name END ASC,
        CASE WHEN p_sort_by = 'name' AND p_sort_order = 'DESC' THEN s.name END DESC,
        CASE WHEN p_sort_by = 'total_purchases' AND p_sort_order = 'ASC' THEN SUM(po.total) END ASC,
        CASE WHEN p_sort_by = 'total_purchases' AND p_sort_order = 'DESC' THEN SUM(po.total) END DESC,
        s.name;
END;
$$;

-- =============================================
-- 2. GET SUPPLIER DETAILS
-- =============================================
-- Gets complete supplier information with purchase history
CREATE OR REPLACE FUNCTION public.get_supplier_details(
    p_business_id UUID,
    p_supplier_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT JSONB_BUILD_OBJECT(
        'id', s.id,
        'name', s.name,
        'contact_person', s.contact_person,
        'email', s.email,
        'phone', s.phone,
        'address', s.address,
        'gstin', s.gstin,
        'payment_terms', s.payment_terms,
        'credit_limit', s.credit_limit,
        'current_balance', s.current_balance,
        'is_active', s.is_active,
        'notes', s.notes,
        'created_at', s.created_at,
        'updated_at', s.updated_at,
        'statistics', JSONB_BUILD_OBJECT(
            'total_purchases', COALESCE(SUM(po.total), 0),
            'purchase_count', COUNT(po.id),
            'total_paid', COALESCE(SUM(sp.amount), 0),
            'last_purchase_date', MAX(po.order_date),
            'average_order_value', COALESCE(AVG(po.total), 0)
        ),
        'recent_purchases', COALESCE(
            (
                SELECT JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', po2.id,
                        'po_number', po2.po_number,
                        'order_date', po2.order_date,
                        'status', po2.status,
                        'total', po2.total
                    ) ORDER BY po2.order_date DESC
                )
                FROM public.purchase_orders po2
                WHERE po2.supplier_id = s.id AND po2.business_id = p_business_id
                LIMIT 10
            ),
            '[]'::JSONB
        )
    ) INTO v_result
    FROM public.suppliers s
    LEFT JOIN public.purchase_orders po ON s.id = po.supplier_id AND po.status != 'CANCELLED'
    LEFT JOIN public.supplier_payments sp ON s.id = sp.supplier_id
    WHERE s.id = p_supplier_id AND s.business_id = p_business_id
    GROUP BY s.id;

    RETURN v_result;
END;
$$;

-- =============================================
-- 3. CREATE SUPPLIER
-- =============================================
-- Creates a new supplier with validation
CREATE OR REPLACE FUNCTION public.create_supplier(
    p_business_id UUID,
    p_name TEXT,
    p_contact_person TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_address TEXT,
    p_gstin TEXT,
    p_payment_terms TEXT,
    p_credit_limit NUMERIC,
    p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_supplier_id UUID;
BEGIN
    -- Validate supplier name
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Supplier name cannot be empty';
    END IF;

    -- Check for duplicate name
    IF EXISTS (
        SELECT 1 FROM public.suppliers
        WHERE business_id = p_business_id AND name = TRIM(p_name)
    ) THEN
        RAISE EXCEPTION 'Supplier "%" already exists', TRIM(p_name);
    END IF;

    -- Insert supplier
    INSERT INTO public.suppliers (
        business_id,
        name,
        contact_person,
        email,
        phone,
        address,
        gstin,
        payment_terms,
        credit_limit,
        notes
    ) VALUES (
        p_business_id,
        TRIM(p_name),
        NULLIF(TRIM(p_contact_person), ''),
        NULLIF(TRIM(p_email), ''),
        NULLIF(TRIM(p_phone), ''),
        NULLIF(TRIM(p_address), ''),
        NULLIF(TRIM(p_gstin), ''),
        COALESCE(NULLIF(TRIM(p_payment_terms), ''), 'NET30'),
        COALESCE(p_credit_limit, 0),
        NULLIF(TRIM(p_notes), '')
    )
    RETURNING id INTO v_supplier_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'supplier_id', v_supplier_id,
        'name', TRIM(p_name),
        'created_at', NOW()
    );
END;
$$;

-- =============================================
-- 4. UPDATE SUPPLIER
-- =============================================
-- Updates supplier information
CREATE OR REPLACE FUNCTION public.update_supplier(
    p_business_id UUID,
    p_supplier_id UUID,
    p_name TEXT,
    p_contact_person TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_address TEXT,
    p_gstin TEXT,
    p_payment_terms TEXT,
    p_credit_limit NUMERIC,
    p_is_active BOOLEAN,
    p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_old_name TEXT;
BEGIN
    -- Get current supplier name
    SELECT name INTO v_old_name
    FROM public.suppliers
    WHERE id = p_supplier_id AND business_id = p_business_id;

    IF v_old_name IS NULL THEN
        RAISE EXCEPTION 'Supplier not found';
    END IF;

    -- Check for duplicate name if changing
    IF p_name IS NOT NULL AND TRIM(p_name) != '' AND TRIM(p_name) != v_old_name THEN
        IF EXISTS (
            SELECT 1 FROM public.suppliers
            WHERE business_id = p_business_id
                AND name = TRIM(p_name)
                AND id != p_supplier_id
        ) THEN
            RAISE EXCEPTION 'Supplier "%" already exists', TRIM(p_name);
        END IF;
    END IF;

    -- Update supplier
    UPDATE public.suppliers
    SET
        name = COALESCE(NULLIF(TRIM(p_name), ''), name),
        contact_person = COALESCE(NULLIF(TRIM(p_contact_person), ''), contact_person),
        email = COALESCE(NULLIF(TRIM(p_email), ''), email),
        phone = COALESCE(NULLIF(TRIM(p_phone), ''), phone),
        address = COALESCE(NULLIF(TRIM(p_address), ''), address),
        gstin = COALESCE(NULLIF(TRIM(p_gstin), ''), gstin),
        payment_terms = COALESCE(NULLIF(TRIM(p_payment_terms), ''), payment_terms),
        credit_limit = CASE WHEN p_credit_limit IS NOT NULL AND p_credit_limit >= 0 THEN p_credit_limit ELSE credit_limit END,
        is_active = COALESCE(p_is_active, is_active),
        notes = COALESCE(NULLIF(TRIM(p_notes), ''), notes),
        updated_at = NOW()
    WHERE id = p_supplier_id AND business_id = p_business_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'supplier_id', p_supplier_id,
        'old_name', v_old_name,
        'new_name', COALESCE(TRIM(p_name), v_old_name),
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 5. RECORD SUPPLIER PAYMENT
-- =============================================
-- Records a payment to supplier and updates balance
CREATE OR REPLACE FUNCTION public.record_supplier_payment(
    p_business_id UUID,
    p_supplier_id UUID,
    p_amount NUMERIC,
    p_payment_method TEXT,
    p_payment_date DATE,
    p_reference TEXT,
    p_purchase_order_id UUID,
    p_notes TEXT,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_payment_id UUID;
    v_new_balance NUMERIC;
BEGIN
    -- Validate amount
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero';
    END IF;

    -- Validate supplier
    IF NOT EXISTS (
        SELECT 1 FROM public.suppliers
        WHERE id = p_supplier_id AND business_id = p_business_id
    ) THEN
        RAISE EXCEPTION 'Supplier not found';
    END IF;

    -- Validate PO if provided
    IF p_purchase_order_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.purchase_orders
            WHERE id = p_purchase_order_id
                AND business_id = p_business_id
                AND supplier_id = p_supplier_id
        ) THEN
            RAISE EXCEPTION 'Purchase order not found or does not belong to this supplier';
        END IF;
    END IF;

    -- Insert payment
    INSERT INTO public.supplier_payments (
        business_id,
        supplier_id,
        purchase_order_id,
        amount,
        payment_method,
        reference,
        payment_date,
        notes,
        created_by
    ) VALUES (
        p_business_id,
        p_supplier_id,
        NULLIF(p_purchase_order_id::TEXT, '')::UUID,
        p_amount,
        p_payment_method,
        NULLIF(TRIM(p_reference), ''),
        COALESCE(p_payment_date, CURRENT_DATE),
        NULLIF(TRIM(p_notes), ''),
        NULLIF(p_user_id::TEXT, '')::UUID
    )
    RETURNING id INTO v_payment_id;

    -- Update supplier balance
    UPDATE public.suppliers
    SET
        current_balance = current_balance - p_amount,
        updated_at = NOW()
    WHERE id = p_supplier_id
    RETURNING current_balance INTO v_new_balance;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'payment_id', v_payment_id,
        'amount', p_amount,
        'new_balance', v_new_balance,
        'payment_date', p_payment_date,
        'created_at', NOW()
    );
END;
$$;

-- =============================================
-- 6. GET SUPPLIER LEDGER
-- =============================================
-- Gets complete payment and purchase history for a supplier
CREATE OR REPLACE FUNCTION public.get_supplier_ledger(
    p_business_id UUID,
    p_supplier_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    transaction_date DATE,
    transaction_type TEXT,
    reference TEXT,
    debit NUMERIC,
    credit NUMERIC,
    balance NUMERIC,
    notes TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_running_balance NUMERIC := 0;
BEGIN
    v_start_date := COALESCE(NULLIF(p_start_date::TEXT, '')::DATE, CURRENT_DATE - INTERVAL '90 days');
    v_end_date := COALESCE(NULLIF(p_end_date::TEXT, '')::DATE, CURRENT_DATE);

    RETURN QUERY
    WITH transactions AS (
        -- Purchase orders (debit)
        SELECT
            po.order_date as transaction_date,
            'PURCHASE' as transaction_type,
            po.po_number as reference,
            po.total as debit,
            0::NUMERIC as credit,
            po.notes
        FROM public.purchase_orders po
        WHERE po.supplier_id = p_supplier_id
            AND po.business_id = p_business_id
            AND po.status != 'CANCELLED'
            AND po.order_date >= v_start_date
            AND po.order_date <= v_end_date

        UNION ALL

        -- Payments (credit)
        SELECT
            sp.payment_date as transaction_date,
            'PAYMENT' as transaction_type,
            sp.reference,
            0::NUMERIC as debit,
            sp.amount as credit,
            sp.notes
        FROM public.supplier_payments sp
        WHERE sp.supplier_id = p_supplier_id
            AND sp.business_id = p_business_id
            AND sp.payment_date >= v_start_date
            AND sp.payment_date <= v_end_date
    )
    SELECT
        t.transaction_date,
        t.transaction_type,
        t.reference,
        t.debit,
        t.credit,
        SUM(t.debit - t.credit) OVER (ORDER BY t.transaction_date, t.transaction_type) as balance,
        t.notes
    FROM transactions t
    ORDER BY t.transaction_date, t.transaction_type;
END;
$$;

-- =============================================
-- 7. GENERATE PO NUMBER
-- =============================================
-- Generates unique purchase order number
CREATE OR REPLACE FUNCTION public.generate_po_number(
    p_business_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_count INTEGER;
    v_po_number TEXT;
BEGIN
    -- Get count of POs for this business
    SELECT COUNT(*) INTO v_count
    FROM public.purchase_orders
    WHERE business_id = p_business_id;

    -- Generate PO number: PO-YYYYMMDD-XXXX
    v_po_number := 'PO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((v_count + 1)::TEXT, 4, '0');

    -- Ensure uniqueness
    WHILE EXISTS (
        SELECT 1 FROM public.purchase_orders
        WHERE business_id = p_business_id AND po_number = v_po_number
    ) LOOP
        v_count := v_count + 1;
        v_po_number := 'PO-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((v_count + 1)::TEXT, 4, '0');
    END LOOP;

    RETURN v_po_number;
END;
$$;

-- =============================================
-- 8. GET BUSINESS PURCHASE ORDERS
-- =============================================
-- Lists all purchase orders with filters
CREATE OR REPLACE FUNCTION public.get_business_purchase_orders(
    p_business_id UUID,
    p_supplier_id UUID,
    p_status TEXT,
    p_start_date DATE,
    p_end_date DATE,
    p_sort_by TEXT,
    p_sort_order TEXT
)
RETURNS TABLE (
    id UUID,
    po_number TEXT,
    supplier_id UUID,
    supplier_name TEXT,
    order_date DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status TEXT,
    subtotal NUMERIC,
    tax NUMERIC,
    discount NUMERIC,
    shipping_cost NUMERIC,
    total NUMERIC,
    items_count BIGINT,
    created_by UUID,
    created_by_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    v_start_date := COALESCE(NULLIF(p_start_date::TEXT, '')::DATE, CURRENT_DATE - INTERVAL '90 days');
    v_end_date := COALESCE(NULLIF(p_end_date::TEXT, '')::DATE, CURRENT_DATE + INTERVAL '30 days');

    RETURN QUERY
    SELECT
        po.id,
        po.po_number,
        po.supplier_id,
        s.name as supplier_name,
        po.order_date,
        po.expected_delivery_date,
        po.actual_delivery_date,
        po.status,
        po.subtotal,
        po.tax,
        po.discount,
        po.shipping_cost,
        po.total,
        COUNT(poi.id)::BIGINT as items_count,
        po.created_by,
        p.full_name as created_by_name,
        po.created_at,
        po.updated_at
    FROM public.purchase_orders po
    INNER JOIN public.suppliers s ON po.supplier_id = s.id
    LEFT JOIN public.profiles p ON po.created_by = p.id
    LEFT JOIN public.purchase_order_items poi ON po.id = poi.purchase_order_id
    WHERE po.business_id = p_business_id
        AND (NULLIF(p_supplier_id::TEXT, '')::UUID IS NULL OR po.supplier_id = p_supplier_id)
        AND (NULLIF(TRIM(p_status), '') IS NULL OR po.status = p_status)
        AND po.order_date >= v_start_date
        AND po.order_date <= v_end_date
    GROUP BY po.id, po.po_number, po.supplier_id, s.name, po.order_date,
             po.expected_delivery_date, po.actual_delivery_date, po.status,
             po.subtotal, po.tax, po.discount, po.shipping_cost, po.total,
             po.created_by, p.full_name, po.created_at, po.updated_at
    ORDER BY
        CASE WHEN COALESCE(NULLIF(TRIM(p_sort_by), ''), 'order_date') = 'order_date' AND COALESCE(NULLIF(TRIM(p_sort_order), ''), 'DESC') = 'DESC' THEN po.order_date END DESC,
        CASE WHEN COALESCE(NULLIF(TRIM(p_sort_by), ''), 'order_date') = 'order_date' AND COALESCE(NULLIF(TRIM(p_sort_order), ''), 'DESC') = 'ASC' THEN po.order_date END ASC,
        CASE WHEN COALESCE(NULLIF(TRIM(p_sort_by), ''), 'order_date') = 'total' AND COALESCE(NULLIF(TRIM(p_sort_order), ''), 'DESC') = 'DESC' THEN po.total END DESC,
        CASE WHEN COALESCE(NULLIF(TRIM(p_sort_by), ''), 'order_date') = 'total' AND COALESCE(NULLIF(TRIM(p_sort_order), ''), 'DESC') = 'ASC' THEN po.total END ASC,
        po.order_date DESC;
END;
$$;

-- =============================================
-- 9. GET PURCHASE ORDER DETAILS
-- =============================================
-- Gets complete PO with all items and supplier info
CREATE OR REPLACE FUNCTION public.get_purchase_order_details(
    p_business_id UUID,
    p_purchase_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT JSONB_BUILD_OBJECT(
        'id', po.id,
        'po_number', po.po_number,
        'order_date', po.order_date,
        'expected_delivery_date', po.expected_delivery_date,
        'actual_delivery_date', po.actual_delivery_date,
        'status', po.status,
        'subtotal', po.subtotal,
        'tax', po.tax,
        'discount', po.discount,
        'shipping_cost', po.shipping_cost,
        'total', po.total,
        'notes', po.notes,
        'created_at', po.created_at,
        'updated_at', po.updated_at,
        'supplier', JSONB_BUILD_OBJECT(
            'id', s.id,
            'name', s.name,
            'contact_person', s.contact_person,
            'phone', s.phone,
            'email', s.email,
            'address', s.address
        ),
        'created_by', JSONB_BUILD_OBJECT(
            'id', p.id,
            'name', p.full_name
        ),
        'items', COALESCE(
            (
                SELECT JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', poi.id,
                        'item_id', poi.item_id,
                        'item_name', i.name,
                        'quantity_ordered', poi.quantity_ordered,
                        'quantity_received', poi.quantity_received,
                        'unit_cost', poi.unit_cost,
                        'tax_rate', poi.tax_rate,
                        'discount', poi.discount,
                        'total', poi.total
                    )
                )
                FROM public.purchase_order_items poi
                INNER JOIN public.items i ON poi.item_id = i.id
                WHERE poi.purchase_order_id = po.id
            ),
            '[]'::JSONB
        )
    ) INTO v_result
    FROM public.purchase_orders po
    INNER JOIN public.suppliers s ON po.supplier_id = s.id
    LEFT JOIN public.profiles p ON po.created_by = p.id
    WHERE po.id = p_purchase_order_id AND po.business_id = p_business_id;

    RETURN v_result;
END;
$$;

-- =============================================
-- 10. CREATE PURCHASE ORDER
-- =============================================
-- Creates new purchase order with items
CREATE OR REPLACE FUNCTION public.create_purchase_order(
    p_business_id UUID,
    p_supplier_id UUID,
    p_items JSONB, -- Array of {item_id, quantity, unit_cost, tax_rate, discount}
    p_order_date DATE,
    p_expected_delivery_date DATE,
    p_shipping_cost NUMERIC,
    p_discount NUMERIC,
    p_notes TEXT,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_po_id UUID;
    v_po_number TEXT;
    v_item JSONB;
    v_subtotal NUMERIC := 0;
    v_total_tax NUMERIC := 0;
    v_total NUMERIC := 0;
    v_item_total NUMERIC;
BEGIN
    -- Validate supplier
    IF NOT EXISTS (
        SELECT 1 FROM public.suppliers
        WHERE id = p_supplier_id AND business_id = p_business_id AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'Supplier not found or inactive';
    END IF;

    -- Validate items
    IF p_items IS NULL OR JSONB_ARRAY_LENGTH(p_items) = 0 THEN
        RAISE EXCEPTION 'Purchase order must have at least one item';
    END IF;

    -- Generate PO number
    v_po_number := public.generate_po_number(p_business_id);

    -- Calculate totals
    FOR v_item IN SELECT * FROM JSONB_ARRAY_ELEMENTS(p_items)
    LOOP
        v_item_total := (v_item->>'quantity')::NUMERIC * (v_item->>'unit_cost')::NUMERIC;
        v_item_total := v_item_total - COALESCE((v_item->>'discount')::NUMERIC, 0);
        v_subtotal := v_subtotal + v_item_total;
        v_total_tax := v_total_tax + (v_item_total * COALESCE((v_item->>'tax_rate')::NUMERIC, 0) / 100);
    END LOOP;

    v_subtotal := v_subtotal - p_discount;
    v_total := v_subtotal + v_total_tax + p_shipping_cost;

    -- Create purchase order
    INSERT INTO public.purchase_orders (
        business_id,
        supplier_id,
        po_number,
        order_date,
        expected_delivery_date,
        status,
        subtotal,
        tax,
        discount,
        shipping_cost,
        total,
        notes,
        created_by
    ) VALUES (
        p_business_id,
        p_supplier_id,
        v_po_number,
        COALESCE(NULLIF(p_order_date::TEXT, '')::DATE, CURRENT_DATE),
        NULLIF(p_expected_delivery_date::TEXT, '')::DATE,
        'DRAFT',
        v_subtotal,
        v_total_tax,
        COALESCE(p_discount, 0),
        COALESCE(p_shipping_cost, 0),
        v_total,
        NULLIF(TRIM(p_notes), ''),
        NULLIF(p_user_id::TEXT, '')::UUID
    )
    RETURNING id INTO v_po_id;

    -- Insert items
    FOR v_item IN SELECT * FROM JSONB_ARRAY_ELEMENTS(p_items)
    LOOP
        v_item_total := (v_item->>'quantity')::NUMERIC * (v_item->>'unit_cost')::NUMERIC;
        v_item_total := v_item_total - COALESCE((v_item->>'discount')::NUMERIC, 0);

        INSERT INTO public.purchase_order_items (
            purchase_order_id,
            item_id,
            quantity_ordered,
            unit_cost,
            tax_rate,
            discount,
            total
        ) VALUES (
            v_po_id,
            (v_item->>'item_id')::UUID,
            (v_item->>'quantity')::NUMERIC,
            (v_item->>'unit_cost')::NUMERIC,
            COALESCE((v_item->>'tax_rate')::NUMERIC, 0),
            COALESCE((v_item->>'discount')::NUMERIC, 0),
            v_item_total
        );
    END LOOP;

    -- Update supplier balance
    UPDATE public.suppliers
    SET current_balance = current_balance + v_total
    WHERE id = p_supplier_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'purchase_order_id', v_po_id,
        'po_number', v_po_number,
        'total', v_total,
        'created_at', NOW()
    );
END;
$$;

-- =============================================
-- 11. UPDATE PURCHASE ORDER STATUS
-- =============================================
-- Updates PO status and optionally delivery dates
CREATE OR REPLACE FUNCTION public.update_purchase_order_status(
    p_business_id UUID,
    p_purchase_order_id UUID,
    p_status TEXT,
    p_actual_delivery_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_old_status TEXT;
BEGIN
    -- Validate status
    IF p_status NOT IN ('DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED') THEN
        RAISE EXCEPTION 'Invalid status: %', p_status;
    END IF;

    -- Get current status
    SELECT status INTO v_old_status
    FROM public.purchase_orders
    WHERE id = p_purchase_order_id AND business_id = p_business_id;

    IF v_old_status IS NULL THEN
        RAISE EXCEPTION 'Purchase order not found';
    END IF;

    -- Update status
    UPDATE public.purchase_orders
    SET
        status = p_status,
        actual_delivery_date = COALESCE(NULLIF(p_actual_delivery_date::TEXT, '')::DATE, actual_delivery_date),
        updated_at = NOW()
    WHERE id = p_purchase_order_id AND business_id = p_business_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'purchase_order_id', p_purchase_order_id,
        'old_status', v_old_status,
        'new_status', p_status,
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 12. RECEIVE PURCHASE ORDER ITEMS
-- =============================================
-- Records receipt of items and updates inventory
CREATE OR REPLACE FUNCTION public.receive_purchase_order_items(
    p_business_id UUID,
    p_purchase_order_id UUID,
    p_received_items JSONB, -- Array of {item_id, quantity_received}
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_item JSONB;
    v_items_received INTEGER := 0;
    v_total_ordered NUMERIC;
    v_total_received NUMERIC;
    v_new_status TEXT;
BEGIN
    -- Validate PO
    IF NOT EXISTS (
        SELECT 1 FROM public.purchase_orders
        WHERE id = p_purchase_order_id
            AND business_id = p_business_id
            AND status IN ('SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED')
    ) THEN
        RAISE EXCEPTION 'Purchase order not found or cannot receive items';
    END IF;

    -- Process each received item
    FOR v_item IN SELECT * FROM JSONB_ARRAY_ELEMENTS(p_received_items)
    LOOP
        -- Update PO item
        UPDATE public.purchase_order_items
        SET quantity_received = quantity_received + (v_item->>'quantity_received')::NUMERIC
        WHERE purchase_order_id = p_purchase_order_id
            AND item_id = (v_item->>'item_id')::UUID;

        -- Update item stock
        UPDATE public.items
        SET
            stock = stock + (v_item->>'quantity_received')::NUMERIC,
            updated_at = NOW()
        WHERE id = (v_item->>'item_id')::UUID
            AND business_id = p_business_id;

        -- Record stock movement
        INSERT INTO public.stock_movements (
            business_id,
            item_id,
            quantity,
            type,
            reason,
            reference,
            user_id
        ) VALUES (
            p_business_id,
            (v_item->>'item_id')::UUID,
            (v_item->>'quantity_received')::NUMERIC,
            'IN',
            'Purchase Order Receipt',
            (SELECT po_number FROM public.purchase_orders WHERE id = p_purchase_order_id),
            p_user_id
        );

        v_items_received := v_items_received + 1;
    END LOOP;

    -- Determine new status
    SELECT
        SUM(quantity_ordered),
        SUM(quantity_received)
    INTO v_total_ordered, v_total_received
    FROM public.purchase_order_items
    WHERE purchase_order_id = p_purchase_order_id;

    IF v_total_received >= v_total_ordered THEN
        v_new_status := 'RECEIVED';
    ELSIF v_total_received > 0 THEN
        v_new_status := 'PARTIALLY_RECEIVED';
    ELSE
        v_new_status := 'CONFIRMED';
    END IF;

    -- Update PO status
    UPDATE public.purchase_orders
    SET
        status = v_new_status,
        actual_delivery_date = COALESCE(actual_delivery_date, CURRENT_DATE),
        updated_at = NOW()
    WHERE id = p_purchase_order_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'purchase_order_id', p_purchase_order_id,
        'items_received', v_items_received,
        'new_status', v_new_status,
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 13. CANCEL PURCHASE ORDER
-- =============================================
-- Cancels PO and reverses supplier balance
CREATE OR REPLACE FUNCTION public.cancel_purchase_order(
    p_business_id UUID,
    p_purchase_order_id UUID,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_po_number TEXT;
    v_total NUMERIC;
    v_supplier_id UUID;
    v_old_status TEXT;
BEGIN
    -- Get PO details
    SELECT po_number, total, supplier_id, status
    INTO v_po_number, v_total, v_supplier_id, v_old_status
    FROM public.purchase_orders
    WHERE id = p_purchase_order_id AND business_id = p_business_id;

    IF v_po_number IS NULL THEN
        RAISE EXCEPTION 'Purchase order not found';
    END IF;

    IF v_old_status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Purchase order already cancelled';
    END IF;

    IF v_old_status IN ('RECEIVED', 'PARTIALLY_RECEIVED') THEN
        RAISE EXCEPTION 'Cannot cancel purchase order that has received items';
    END IF;

    -- Cancel PO
    UPDATE public.purchase_orders
    SET
        status = 'CANCELLED',
        notes = COALESCE(notes || E'\n\nCancellation Reason: ', 'Cancellation Reason: ') || p_reason,
        updated_at = NOW()
    WHERE id = p_purchase_order_id;

    -- Reverse supplier balance if not draft
    IF v_old_status != 'DRAFT' THEN
        UPDATE public.suppliers
        SET current_balance = current_balance - v_total
        WHERE id = v_supplier_id;
    END IF;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'purchase_order_id', p_purchase_order_id,
        'po_number', v_po_number,
        'old_status', v_old_status,
        'cancelled_at', NOW()
    );
END;
$$;

-- =============================================
-- 14. GET SUPPLIER PERFORMANCE
-- =============================================
-- Analyzes supplier delivery performance
CREATE OR REPLACE FUNCTION public.get_supplier_performance(
    p_business_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    supplier_id UUID,
    supplier_name TEXT,
    total_orders BIGINT,
    total_value NUMERIC,
    avg_order_value NUMERIC,
    on_time_deliveries BIGINT,
    late_deliveries BIGINT,
    on_time_percentage NUMERIC,
    avg_delivery_days NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    v_start_date := COALESCE(NULLIF(p_start_date::TEXT, '')::DATE, CURRENT_DATE - INTERVAL '90 days');
    v_end_date := COALESCE(NULLIF(p_end_date::TEXT, '')::DATE, CURRENT_DATE);

    RETURN QUERY
    SELECT
        s.id as supplier_id,
        s.name as supplier_name,
        COUNT(po.id)::BIGINT as total_orders,
        COALESCE(SUM(po.total), 0) as total_value,
        COALESCE(AVG(po.total), 0) as avg_order_value,
        COUNT(CASE WHEN po.actual_delivery_date IS NOT NULL
                   AND po.actual_delivery_date <= po.expected_delivery_date
                   THEN 1 END)::BIGINT as on_time_deliveries,
        COUNT(CASE WHEN po.actual_delivery_date IS NOT NULL
                   AND po.actual_delivery_date > po.expected_delivery_date
                   THEN 1 END)::BIGINT as late_deliveries,
        ROUND(
            CASE WHEN COUNT(po.id) > 0 THEN
                (COUNT(CASE WHEN po.actual_delivery_date IS NOT NULL
                           AND po.actual_delivery_date <= po.expected_delivery_date
                           THEN 1 END)::NUMERIC / COUNT(po.id)::NUMERIC * 100)
            ELSE 0 END,
            2
        ) as on_time_percentage,
        COALESCE(
            AVG(
                CASE WHEN po.actual_delivery_date IS NOT NULL AND po.expected_delivery_date IS NOT NULL
                THEN po.actual_delivery_date - po.expected_delivery_date
                ELSE NULL END
            ),
            0
        ) as avg_delivery_days
    FROM public.suppliers s
    LEFT JOIN public.purchase_orders po ON s.id = po.supplier_id
        AND po.business_id = p_business_id
        AND po.status IN ('RECEIVED', 'PARTIALLY_RECEIVED')
        AND po.order_date >= v_start_date
        AND po.order_date <= v_end_date
    WHERE s.business_id = p_business_id
        AND s.is_active = TRUE
    GROUP BY s.id, s.name
    HAVING COUNT(po.id) > 0
    ORDER BY total_value DESC;
END;
$$;

-- =============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_business_active
    ON public.suppliers(business_id, is_active);

CREATE INDEX IF NOT EXISTS idx_suppliers_name
    ON public.suppliers(business_id, name);

-- Purchase orders indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_business_status
    ON public.purchase_orders(business_id, status);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier
    ON public.purchase_orders(supplier_id, order_date);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_dates
    ON public.purchase_orders(business_id, order_date);

-- Purchase order items indexes
CREATE INDEX IF NOT EXISTS idx_po_items_po
    ON public.purchase_order_items(purchase_order_id);

CREATE INDEX IF NOT EXISTS idx_po_items_item
    ON public.purchase_order_items(item_id);

-- Supplier payments indexes
CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplier
    ON public.supplier_payments(supplier_id, payment_date);

CREATE INDEX IF NOT EXISTS idx_supplier_payments_business
    ON public.supplier_payments(business_id, payment_date);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_business_suppliers(UUID, BOOLEAN, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_supplier_details(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_supplier(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_supplier(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_supplier_payment(UUID, UUID, NUMERIC, TEXT, DATE, TEXT, UUID, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_supplier_ledger(UUID, UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_po_number(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_business_purchase_orders(UUID, UUID, TEXT, DATE, DATE, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_purchase_order_details(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_purchase_order(UUID, UUID, JSONB, DATE, DATE, NUMERIC, NUMERIC, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_purchase_order_status(UUID, UUID, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.receive_purchase_order_items(UUID, UUID, JSONB, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_purchase_order(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_supplier_performance(UUID, DATE, DATE) TO authenticated;
