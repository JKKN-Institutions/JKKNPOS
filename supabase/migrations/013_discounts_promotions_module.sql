-- =============================================
-- Migration: 013_discounts_promotions_module
-- Description: Discounts and Promotions Management Module
-- Version: 1.0
-- =============================================

-- =============================================
-- TABLES
-- =============================================

-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT, -- Optional promo code
    type TEXT NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'BUNDLE')),
    value NUMERIC NOT NULL, -- Percentage (e.g., 10 for 10%) or fixed amount
    min_purchase_amount NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC, -- Cap for percentage discounts
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_to TEXT NOT NULL CHECK (applicable_to IN ('ALL', 'CATEGORIES', 'ITEMS', 'CUSTOMERS')),
    applicable_ids UUID[], -- Array of category/item/customer IDs
    buy_quantity INTEGER, -- For BUY_X_GET_Y
    get_quantity INTEGER, -- For BUY_X_GET_Y
    usage_limit INTEGER, -- Total times promotion can be used
    usage_count INTEGER DEFAULT 0,
    customer_usage_limit INTEGER DEFAULT 1, -- Per customer limit
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_promo_code UNIQUE(business_id, code)
);

-- Create promotion_usage table (track customer usage)
CREATE TABLE IF NOT EXISTS public.promotion_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id),
    customer_id UUID REFERENCES public.customers(id),
    discount_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_promotions_business_active
    ON public.promotions(business_id, is_active);

CREATE INDEX IF NOT EXISTS idx_promotions_dates
    ON public.promotions(business_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_promotions_code
    ON public.promotions(business_id, code) WHERE code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_promotion_usage_promotion
    ON public.promotion_usage(promotion_id, created_at);

CREATE INDEX IF NOT EXISTS idx_promotion_usage_customer
    ON public.promotion_usage(customer_id, promotion_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- =============================================
-- 1. GET ACTIVE PROMOTIONS
-- =============================================
-- Lists active promotions for a specific date and optional customer
CREATE OR REPLACE FUNCTION public.get_active_promotions(
    p_business_id UUID,
    p_date DATE,
    p_customer_id UUID
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    code TEXT,
    type TEXT,
    value NUMERIC,
    min_purchase_amount NUMERIC,
    max_discount_amount NUMERIC,
    start_date DATE,
    end_date DATE,
    applicable_to TEXT,
    applicable_ids UUID[],
    buy_quantity INTEGER,
    get_quantity INTEGER,
    usage_limit INTEGER,
    usage_count INTEGER,
    customer_usage_limit INTEGER,
    customer_usage_count BIGINT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_date DATE;
BEGIN
    v_date := COALESCE(NULLIF(p_date::TEXT, '')::DATE, CURRENT_DATE);

    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.description,
        p.code,
        p.type,
        p.value,
        p.min_purchase_amount,
        p.max_discount_amount,
        p.start_date,
        p.end_date,
        p.applicable_to,
        p.applicable_ids,
        p.buy_quantity,
        p.get_quantity,
        p.usage_limit,
        p.usage_count,
        p.customer_usage_limit,
        COALESCE(COUNT(pu.id), 0)::BIGINT as customer_usage_count
    FROM public.promotions p
    LEFT JOIN public.promotion_usage pu ON p.id = pu.promotion_id
        AND pu.customer_id = NULLIF(p_customer_id::TEXT, '')::UUID
    WHERE p.business_id = p_business_id
        AND p.is_active = TRUE
        AND v_date >= p.start_date
        AND v_date <= p.end_date
        AND (p.usage_limit IS NULL OR p.usage_count < p.usage_limit)
    GROUP BY p.id, p.name, p.description, p.code, p.type, p.value,
             p.min_purchase_amount, p.max_discount_amount, p.start_date,
             p.end_date, p.applicable_to, p.applicable_ids, p.buy_quantity,
             p.get_quantity, p.usage_limit, p.usage_count,
             p.customer_usage_limit, p.created_at
    HAVING (p.customer_usage_limit IS NULL OR COUNT(pu.id) < p.customer_usage_limit)
    ORDER BY p.created_at DESC;
END;
$$;

-- =============================================
-- 2. GET APPLICABLE PROMOTIONS
-- =============================================
-- Gets promotions applicable to specific items/categories/customer
CREATE OR REPLACE FUNCTION public.get_applicable_promotions(
    p_business_id UUID,
    p_item_ids UUID[],
    p_category_ids UUID[],
    p_customer_id UUID,
    p_date DATE
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    code TEXT,
    type TEXT,
    value NUMERIC,
    min_purchase_amount NUMERIC,
    max_discount_amount NUMERIC,
    applicable_to TEXT,
    buy_quantity INTEGER,
    get_quantity INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_date DATE;
    v_customer_id UUID;
BEGIN
    v_date := COALESCE(NULLIF(p_date::TEXT, '')::DATE, CURRENT_DATE);
    v_customer_id := NULLIF(p_customer_id::TEXT, '')::UUID;

    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.description,
        p.code,
        p.type,
        p.value,
        p.min_purchase_amount,
        p.max_discount_amount,
        p.applicable_to,
        p.buy_quantity,
        p.get_quantity
    FROM public.promotions p
    WHERE p.business_id = p_business_id
        AND p.is_active = TRUE
        AND v_date >= p.start_date
        AND v_date <= p.end_date
        AND (p.usage_limit IS NULL OR p.usage_count < p.usage_limit)
        AND (
            p.applicable_to = 'ALL'
            OR (p.applicable_to = 'ITEMS' AND p.applicable_ids && p_item_ids)
            OR (p.applicable_to = 'CATEGORIES' AND p.applicable_ids && p_category_ids)
            OR (p.applicable_to = 'CUSTOMERS' AND v_customer_id = ANY(p.applicable_ids))
        )
    ORDER BY p.value DESC;
END;
$$;

-- =============================================
-- 3. CALCULATE PROMOTION DISCOUNT
-- =============================================
-- Calculates discount amount for a cart based on promotion
CREATE OR REPLACE FUNCTION public.calculate_promotion_discount(
    p_business_id UUID,
    p_promotion_id UUID,
    p_items JSONB, -- Array of {item_id, quantity, price, category_id}
    p_subtotal NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_promotion RECORD;
    v_discount_amount NUMERIC := 0;
    v_applicable_items JSONB := '[]'::JSONB;
    v_item JSONB;
    v_item_total NUMERIC;
    v_eligible_quantity INTEGER := 0;
    v_free_quantity INTEGER := 0;
BEGIN
    -- Get promotion details
    SELECT * INTO v_promotion
    FROM public.promotions
    WHERE id = p_promotion_id AND business_id = p_business_id;

    IF v_promotion IS NULL THEN
        RAISE EXCEPTION 'Promotion not found';
    END IF;

    -- Check if promotion is active
    IF NOT v_promotion.is_active THEN
        RAISE EXCEPTION 'Promotion is not active';
    END IF;

    -- Check date range
    IF CURRENT_DATE < v_promotion.start_date OR CURRENT_DATE > v_promotion.end_date THEN
        RAISE EXCEPTION 'Promotion is not valid for current date';
    END IF;

    -- Check minimum purchase amount
    IF p_subtotal < v_promotion.min_purchase_amount THEN
        RETURN JSONB_BUILD_OBJECT(
            'eligible', FALSE,
            'discount_amount', 0,
            'message', 'Minimum purchase amount not met'
        );
    END IF;

    -- Calculate discount based on type
    CASE v_promotion.type
        WHEN 'PERCENTAGE' THEN
            v_discount_amount := (p_subtotal * v_promotion.value / 100);

            -- Apply max discount cap if set
            IF v_promotion.max_discount_amount IS NOT NULL AND v_discount_amount > v_promotion.max_discount_amount THEN
                v_discount_amount := v_promotion.max_discount_amount;
            END IF;

        WHEN 'FIXED_AMOUNT' THEN
            v_discount_amount := v_promotion.value;

            -- Don't discount more than subtotal
            IF v_discount_amount > p_subtotal THEN
                v_discount_amount := p_subtotal;
            END IF;

        WHEN 'BUY_X_GET_Y' THEN
            -- Find eligible items
            FOR v_item IN SELECT * FROM JSONB_ARRAY_ELEMENTS(p_items)
            LOOP
                -- Check if item is applicable
                IF v_promotion.applicable_to = 'ALL'
                   OR (v_promotion.applicable_to = 'ITEMS' AND (v_item->>'item_id')::UUID = ANY(v_promotion.applicable_ids))
                   OR (v_promotion.applicable_to = 'CATEGORIES' AND (v_item->>'category_id')::UUID = ANY(v_promotion.applicable_ids))
                THEN
                    v_eligible_quantity := v_eligible_quantity + (v_item->>'quantity')::INTEGER;
                    v_applicable_items := v_applicable_items || v_item;
                END IF;
            END LOOP;

            -- Calculate free items
            IF v_eligible_quantity >= v_promotion.buy_quantity THEN
                v_free_quantity := (v_eligible_quantity / v_promotion.buy_quantity) * v_promotion.get_quantity;

                -- Calculate discount (price of free items)
                -- Take cheapest items as free
                SELECT COALESCE(SUM((item->>'price')::NUMERIC), 0) INTO v_discount_amount
                FROM (
                    SELECT item
                    FROM JSONB_ARRAY_ELEMENTS(v_applicable_items) item
                    ORDER BY (item->>'price')::NUMERIC ASC
                    LIMIT v_free_quantity
                ) cheapest_items;
            END IF;

        WHEN 'BUNDLE' THEN
            -- For bundle, value represents the bundle price
            -- Discount is difference between sum of items and bundle price
            v_discount_amount := GREATEST(0, p_subtotal - v_promotion.value);
    END CASE;

    RETURN JSONB_BUILD_OBJECT(
        'eligible', TRUE,
        'discount_amount', ROUND(v_discount_amount, 2),
        'promotion_id', v_promotion.id,
        'promotion_name', v_promotion.name,
        'promotion_type', v_promotion.type,
        'message', 'Promotion applied successfully'
    );
END;
$$;

-- =============================================
-- 4. CREATE PROMOTION
-- =============================================
-- Creates a new promotion with validation
CREATE OR REPLACE FUNCTION public.create_promotion(
    p_business_id UUID,
    p_name TEXT,
    p_description TEXT,
    p_code TEXT,
    p_type TEXT,
    p_value NUMERIC,
    p_min_purchase_amount NUMERIC,
    p_max_discount_amount NUMERIC,
    p_start_date DATE,
    p_end_date DATE,
    p_applicable_to TEXT,
    p_applicable_ids UUID[],
    p_buy_quantity INTEGER,
    p_get_quantity INTEGER,
    p_usage_limit INTEGER,
    p_customer_usage_limit INTEGER,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_promotion_id UUID;
BEGIN
    -- Validate promotion name
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Promotion name cannot be empty';
    END IF;

    -- Validate type
    IF p_type NOT IN ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'BUNDLE') THEN
        RAISE EXCEPTION 'Invalid promotion type';
    END IF;

    -- Validate value
    IF p_value IS NULL OR p_value <= 0 THEN
        RAISE EXCEPTION 'Promotion value must be greater than zero';
    END IF;

    -- Validate percentage value
    IF p_type = 'PERCENTAGE' AND p_value > 100 THEN
        RAISE EXCEPTION 'Percentage discount cannot exceed 100%%';
    END IF;

    -- Validate date range
    IF p_end_date < p_start_date THEN
        RAISE EXCEPTION 'End date must be after start date';
    END IF;

    -- Validate BUY_X_GET_Y quantities
    IF p_type = 'BUY_X_GET_Y' THEN
        IF p_buy_quantity IS NULL OR p_buy_quantity <= 0 THEN
            RAISE EXCEPTION 'Buy quantity must be greater than zero for BUY_X_GET_Y promotion';
        END IF;
        IF p_get_quantity IS NULL OR p_get_quantity <= 0 THEN
            RAISE EXCEPTION 'Get quantity must be greater than zero for BUY_X_GET_Y promotion';
        END IF;
    END IF;

    -- Check for duplicate code
    IF p_code IS NOT NULL AND TRIM(p_code) != '' THEN
        IF EXISTS (
            SELECT 1 FROM public.promotions
            WHERE business_id = p_business_id
                AND code = TRIM(p_code)
        ) THEN
            RAISE EXCEPTION 'Promotion code already exists';
        END IF;
    END IF;

    -- Insert promotion
    INSERT INTO public.promotions (
        business_id,
        name,
        description,
        code,
        type,
        value,
        min_purchase_amount,
        max_discount_amount,
        start_date,
        end_date,
        applicable_to,
        applicable_ids,
        buy_quantity,
        get_quantity,
        usage_limit,
        customer_usage_limit,
        created_by
    ) VALUES (
        p_business_id,
        TRIM(p_name),
        NULLIF(TRIM(p_description), ''),
        NULLIF(TRIM(p_code), ''),
        p_type,
        p_value,
        COALESCE(p_min_purchase_amount, 0),
        NULLIF(p_max_discount_amount::TEXT, '')::NUMERIC,
        p_start_date,
        p_end_date,
        p_applicable_to,
        p_applicable_ids,
        NULLIF(p_buy_quantity::TEXT, '')::INTEGER,
        NULLIF(p_get_quantity::TEXT, '')::INTEGER,
        NULLIF(p_usage_limit::TEXT, '')::INTEGER,
        COALESCE(p_customer_usage_limit, 1),
        p_user_id
    )
    RETURNING id INTO v_promotion_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'promotion_id', v_promotion_id,
        'name', TRIM(p_name),
        'created_at', NOW()
    );
END;
$$;

-- =============================================
-- 5. UPDATE PROMOTION
-- =============================================
-- Updates promotion details
CREATE OR REPLACE FUNCTION public.update_promotion(
    p_business_id UUID,
    p_promotion_id UUID,
    p_name TEXT,
    p_description TEXT,
    p_value NUMERIC,
    p_min_purchase_amount NUMERIC,
    p_max_discount_amount NUMERIC,
    p_start_date DATE,
    p_end_date DATE,
    p_is_active BOOLEAN,
    p_usage_limit INTEGER,
    p_customer_usage_limit INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_old_name TEXT;
    v_type TEXT;
BEGIN
    -- Get current promotion
    SELECT name, type INTO v_old_name, v_type
    FROM public.promotions
    WHERE id = p_promotion_id AND business_id = p_business_id;

    IF v_old_name IS NULL THEN
        RAISE EXCEPTION 'Promotion not found';
    END IF;

    -- Validate value if provided
    IF p_value IS NOT NULL AND p_value <= 0 THEN
        RAISE EXCEPTION 'Promotion value must be greater than zero';
    END IF;

    -- Validate percentage value
    IF v_type = 'PERCENTAGE' AND p_value IS NOT NULL AND p_value > 100 THEN
        RAISE EXCEPTION 'Percentage discount cannot exceed 100%%';
    END IF;

    -- Validate date range if both provided
    IF p_start_date IS NOT NULL AND p_end_date IS NOT NULL AND p_end_date < p_start_date THEN
        RAISE EXCEPTION 'End date must be after start date';
    END IF;

    -- Update promotion
    UPDATE public.promotions
    SET
        name = COALESCE(NULLIF(TRIM(p_name), ''), name),
        description = COALESCE(NULLIF(TRIM(p_description), ''), description),
        value = COALESCE(p_value, value),
        min_purchase_amount = COALESCE(p_min_purchase_amount, min_purchase_amount),
        max_discount_amount = COALESCE(NULLIF(p_max_discount_amount::TEXT, '')::NUMERIC, max_discount_amount),
        start_date = COALESCE(NULLIF(p_start_date::TEXT, '')::DATE, start_date),
        end_date = COALESCE(NULLIF(p_end_date::TEXT, '')::DATE, end_date),
        is_active = COALESCE(p_is_active, is_active),
        usage_limit = COALESCE(NULLIF(p_usage_limit::TEXT, '')::INTEGER, usage_limit),
        customer_usage_limit = COALESCE(p_customer_usage_limit, customer_usage_limit),
        updated_at = NOW()
    WHERE id = p_promotion_id AND business_id = p_business_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'promotion_id', p_promotion_id,
        'old_name', v_old_name,
        'new_name', COALESCE(TRIM(p_name), v_old_name),
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 6. DEACTIVATE PROMOTION
-- =============================================
-- Deactivates a promotion
CREATE OR REPLACE FUNCTION public.deactivate_promotion(
    p_business_id UUID,
    p_promotion_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_promotion_name TEXT;
BEGIN
    -- Get promotion name
    SELECT name INTO v_promotion_name
    FROM public.promotions
    WHERE id = p_promotion_id AND business_id = p_business_id;

    IF v_promotion_name IS NULL THEN
        RAISE EXCEPTION 'Promotion not found';
    END IF;

    -- Deactivate
    UPDATE public.promotions
    SET
        is_active = FALSE,
        updated_at = NOW()
    WHERE id = p_promotion_id AND business_id = p_business_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'promotion_id', p_promotion_id,
        'promotion_name', v_promotion_name,
        'deactivated_at', NOW()
    );
END;
$$;

-- =============================================
-- 7. APPLY PROMOTION TO SALE
-- =============================================
-- Records promotion usage for a sale
CREATE OR REPLACE FUNCTION public.apply_promotion_to_sale(
    p_business_id UUID,
    p_promotion_id UUID,
    p_sale_id UUID,
    p_customer_id UUID,
    p_discount_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_usage_id UUID;
    v_promotion_name TEXT;
BEGIN
    -- Validate promotion exists
    SELECT name INTO v_promotion_name
    FROM public.promotions
    WHERE id = p_promotion_id AND business_id = p_business_id;

    IF v_promotion_name IS NULL THEN
        RAISE EXCEPTION 'Promotion not found';
    END IF;

    -- Record usage
    INSERT INTO public.promotion_usage (
        promotion_id,
        sale_id,
        customer_id,
        discount_amount
    ) VALUES (
        p_promotion_id,
        p_sale_id,
        NULLIF(p_customer_id::TEXT, '')::UUID,
        p_discount_amount
    )
    RETURNING id INTO v_usage_id;

    -- Update promotion usage count
    UPDATE public.promotions
    SET usage_count = usage_count + 1
    WHERE id = p_promotion_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'usage_id', v_usage_id,
        'promotion_id', p_promotion_id,
        'promotion_name', v_promotion_name,
        'discount_amount', p_discount_amount,
        'created_at', NOW()
    );
END;
$$;

-- =============================================
-- 8. GET PROMOTION PERFORMANCE
-- =============================================
-- Analyzes promotion performance and usage
CREATE OR REPLACE FUNCTION public.get_promotion_performance(
    p_business_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    promotion_id UUID,
    promotion_name TEXT,
    promotion_type TEXT,
    total_usage BIGINT,
    total_discount_given NUMERIC,
    total_revenue NUMERIC,
    avg_discount_per_use NUMERIC,
    unique_customers BIGINT,
    is_active BOOLEAN,
    start_date DATE,
    end_date DATE
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
    v_start_date := COALESCE(NULLIF(p_start_date::TEXT, '')::DATE, CURRENT_DATE - INTERVAL '30 days');
    v_end_date := COALESCE(NULLIF(p_end_date::TEXT, '')::DATE, CURRENT_DATE);

    RETURN QUERY
    SELECT
        p.id as promotion_id,
        p.name as promotion_name,
        p.type as promotion_type,
        COUNT(pu.id)::BIGINT as total_usage,
        COALESCE(SUM(pu.discount_amount), 0) as total_discount_given,
        COALESCE(SUM(s.total), 0) as total_revenue,
        COALESCE(AVG(pu.discount_amount), 0) as avg_discount_per_use,
        COUNT(DISTINCT pu.customer_id)::BIGINT as unique_customers,
        p.is_active,
        p.start_date,
        p.end_date
    FROM public.promotions p
    LEFT JOIN public.promotion_usage pu ON p.id = pu.promotion_id
        AND pu.created_at >= v_start_date
        AND pu.created_at <= v_end_date + INTERVAL '1 day'
    LEFT JOIN public.sales s ON pu.sale_id = s.id
    WHERE p.business_id = p_business_id
    GROUP BY p.id, p.name, p.type, p.is_active, p.start_date, p.end_date
    ORDER BY total_usage DESC, total_discount_given DESC;
END;
$$;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_usage ENABLE ROW LEVEL SECURITY;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION public.get_active_promotions(UUID, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_applicable_promotions(UUID, UUID[], UUID[], UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_promotion_discount(UUID, UUID, JSONB, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_promotion(UUID, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, DATE, DATE, TEXT, UUID[], INTEGER, INTEGER, INTEGER, INTEGER, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_promotion(UUID, UUID, TEXT, TEXT, NUMERIC, NUMERIC, NUMERIC, DATE, DATE, BOOLEAN, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deactivate_promotion(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_promotion_to_sale(UUID, UUID, UUID, UUID, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_promotion_performance(UUID, DATE, DATE) TO authenticated;
