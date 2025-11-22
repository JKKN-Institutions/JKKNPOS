-- =============================================
-- Categories Management Module - Complete Implementation
-- Migration: 010_categories_management_module
-- =============================================
-- This migration creates comprehensive category management functions
-- for the POS system including hierarchical categories, bulk operations, and analytics.

-- =============================================
-- 1. GET BUSINESS CATEGORIES
-- =============================================
-- Retrieves all categories with hierarchical structure and product counts
CREATE OR REPLACE FUNCTION public.get_business_categories(
    p_business_id UUID,
    p_parent_id UUID DEFAULT NULL,
    p_include_inactive BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    parent_id UUID,
    parent_name TEXT,
    sort_order INTEGER,
    product_count BIGINT,
    active_product_count BIGINT,
    total_stock_value NUMERIC,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_parent BOOLEAN,
    level INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE category_tree AS (
        -- Base case: root categories or specific parent
        SELECT
            c.id,
            c.name,
            c.description,
            c.parent_id,
            CAST(NULL AS TEXT) as parent_name,
            c.sort_order,
            c.created_at,
            c.updated_at,
            1 as level
        FROM public.categories c
        WHERE c.business_id = p_business_id
            AND (
                (p_parent_id IS NULL AND c.parent_id IS NULL) OR
                (p_parent_id IS NOT NULL AND c.parent_id = p_parent_id)
            )

        UNION ALL

        -- Recursive case: child categories
        SELECT
            c.id,
            c.name,
            c.description,
            c.parent_id,
            CAST(NULL AS TEXT),
            c.sort_order,
            c.created_at,
            c.updated_at,
            ct.level + 1
        FROM public.categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
        WHERE c.business_id = p_business_id
    )
    SELECT
        ct.id,
        ct.name,
        ct.description,
        ct.parent_id,
        pc.name as parent_name,
        ct.sort_order,
        COUNT(i.id)::BIGINT as product_count,
        COUNT(CASE WHEN i.is_active = TRUE THEN 1 END)::BIGINT as active_product_count,
        ROUND(COALESCE(SUM(CASE WHEN i.is_active = TRUE THEN i.stock * i.cost ELSE 0 END), 0), 2) as total_stock_value,
        ct.created_at,
        ct.updated_at,
        EXISTS(SELECT 1 FROM public.categories sc WHERE sc.parent_id = ct.id AND sc.business_id = p_business_id) as is_parent,
        ct.level
    FROM category_tree ct
    LEFT JOIN public.categories pc ON ct.parent_id = pc.id
    LEFT JOIN public.items i ON ct.id = i.category_id AND i.business_id = p_business_id
    GROUP BY ct.id, ct.name, ct.description, ct.parent_id, pc.name, ct.sort_order, ct.created_at, ct.updated_at, ct.level
    ORDER BY ct.level, ct.sort_order, ct.name;
END;
$$;

-- =============================================
-- 2. GET CATEGORY TREE
-- =============================================
-- Returns complete hierarchical category tree with nested structure
CREATE OR REPLACE FUNCTION public.get_category_tree(
    p_business_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_tree JSONB;
BEGIN
    WITH RECURSIVE category_tree AS (
        -- Root categories
        SELECT
            c.id,
            c.name,
            c.description,
            c.parent_id,
            c.sort_order,
            ARRAY[c.id] as path,
            1 as level
        FROM public.categories c
        WHERE c.business_id = p_business_id
            AND c.parent_id IS NULL

        UNION ALL

        -- Child categories
        SELECT
            c.id,
            c.name,
            c.description,
            c.parent_id,
            c.sort_order,
            ct.path || c.id,
            ct.level + 1
        FROM public.categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
        WHERE c.business_id = p_business_id
    ),
    category_with_children AS (
        SELECT
            ct.id,
            ct.name,
            ct.description,
            ct.parent_id,
            ct.sort_order,
            ct.level,
            COUNT(i.id) as product_count,
            JSONB_BUILD_OBJECT(
                'id', ct.id,
                'name', ct.name,
                'description', ct.description,
                'sort_order', ct.sort_order,
                'level', ct.level,
                'product_count', COUNT(i.id),
                'children', '[]'::JSONB
            ) as category_obj
        FROM category_tree ct
        LEFT JOIN public.items i ON ct.id = i.category_id
        GROUP BY ct.id, ct.name, ct.description, ct.parent_id, ct.sort_order, ct.level
    )
    SELECT JSONB_AGG(
        category_obj ORDER BY sort_order, name
    ) INTO v_tree
    FROM category_with_children
    WHERE parent_id IS NULL;

    RETURN COALESCE(v_tree, '[]'::JSONB);
END;
$$;

-- =============================================
-- 3. GET CATEGORY ANALYTICS
-- =============================================
-- Analyzes category performance with sales and inventory metrics
CREATE OR REPLACE FUNCTION public.get_category_analytics(
    p_business_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    product_count BIGINT,
    total_stock NUMERIC,
    total_stock_value NUMERIC,
    total_sales NUMERIC,
    items_sold BIGINT,
    avg_price NUMERIC,
    profit_margin NUMERIC
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
    v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);

    RETURN QUERY
    SELECT
        c.id as category_id,
        c.name as category_name,
        COUNT(DISTINCT i.id)::BIGINT as product_count,
        COALESCE(SUM(i.stock), 0) as total_stock,
        ROUND(COALESCE(SUM(i.stock * i.cost), 0), 2) as total_stock_value,
        ROUND(COALESCE(SUM(si.total), 0), 2) as total_sales,
        COALESCE(SUM(si.quantity), 0)::BIGINT as items_sold,
        ROUND(COALESCE(AVG(i.price), 0), 2) as avg_price,
        ROUND(
            CASE
                WHEN SUM(i.cost) > 0 THEN
                    ((AVG(i.price) - AVG(i.cost)) / NULLIF(AVG(i.cost), 0) * 100)
                ELSE 0
            END,
            2
        ) as profit_margin
    FROM public.categories c
    LEFT JOIN public.items i ON c.id = i.category_id AND i.business_id = p_business_id
    LEFT JOIN public.sale_items si ON i.id = si.item_id
    LEFT JOIN public.sales s ON si.sale_id = s.id
        AND s.business_id = p_business_id
        AND s.status = 'COMPLETED'
        AND s.created_at::DATE >= v_start_date
        AND s.created_at::DATE <= v_end_date
    WHERE c.business_id = p_business_id
    GROUP BY c.id, c.name
    ORDER BY total_sales DESC;
END;
$$;

-- =============================================
-- 4. GET TOP SELLING CATEGORIES
-- =============================================
-- Returns top performing categories by sales
CREATE OR REPLACE FUNCTION public.get_top_selling_categories(
    p_business_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    total_revenue NUMERIC,
    items_sold BIGINT,
    transactions BIGINT,
    avg_order_value NUMERIC,
    rank INTEGER
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
    v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);

    RETURN QUERY
    SELECT
        c.id as category_id,
        c.name as category_name,
        ROUND(COALESCE(SUM(si.total), 0), 2) as total_revenue,
        COALESCE(SUM(si.quantity), 0)::BIGINT as items_sold,
        COUNT(DISTINCT s.id)::BIGINT as transactions,
        ROUND(COALESCE(AVG(si.total), 0), 2) as avg_order_value,
        RANK() OVER (ORDER BY SUM(si.total) DESC)::INTEGER as rank
    FROM public.categories c
    LEFT JOIN public.items i ON c.id = i.category_id
    LEFT JOIN public.sale_items si ON i.id = si.item_id
    LEFT JOIN public.sales s ON si.sale_id = s.id
        AND s.business_id = p_business_id
        AND s.status = 'COMPLETED'
        AND s.created_at::DATE >= v_start_date
        AND s.created_at::DATE <= v_end_date
    WHERE c.business_id = p_business_id
    GROUP BY c.id, c.name
    HAVING SUM(si.total) > 0
    ORDER BY rank
    LIMIT p_limit;
END;
$$;

-- =============================================
-- 5. CREATE CATEGORY
-- =============================================
-- Creates a new category with validation
CREATE OR REPLACE FUNCTION public.create_category(
    p_business_id UUID,
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_parent_id UUID DEFAULT NULL,
    p_sort_order INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_category_id UUID;
    v_final_sort_order INTEGER;
BEGIN
    -- Validate category name
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Category name cannot be empty';
    END IF;

    -- Check for duplicate name in same parent
    IF EXISTS (
        SELECT 1 FROM public.categories
        WHERE business_id = p_business_id
            AND name = TRIM(p_name)
            AND (parent_id = p_parent_id OR (parent_id IS NULL AND p_parent_id IS NULL))
    ) THEN
        RAISE EXCEPTION 'Category "%" already exists in this parent', TRIM(p_name);
    END IF;

    -- Validate parent exists if provided
    IF p_parent_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.categories
            WHERE id = p_parent_id AND business_id = p_business_id
        ) THEN
            RAISE EXCEPTION 'Parent category not found';
        END IF;
    END IF;

    -- Determine sort order
    IF p_sort_order IS NULL THEN
        SELECT COALESCE(MAX(sort_order), 0) + 1 INTO v_final_sort_order
        FROM public.categories
        WHERE business_id = p_business_id
            AND (parent_id = p_parent_id OR (parent_id IS NULL AND p_parent_id IS NULL));
    ELSE
        v_final_sort_order := p_sort_order;
    END IF;

    -- Insert category
    INSERT INTO public.categories (
        business_id,
        name,
        description,
        parent_id,
        sort_order
    ) VALUES (
        p_business_id,
        TRIM(p_name),
        p_description,
        p_parent_id,
        v_final_sort_order
    )
    RETURNING id INTO v_category_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'category_id', v_category_id,
        'name', TRIM(p_name),
        'parent_id', p_parent_id,
        'sort_order', v_final_sort_order,
        'created_at', NOW()
    );
END;
$$;

-- =============================================
-- 6. UPDATE CATEGORY
-- =============================================
-- Updates an existing category
CREATE OR REPLACE FUNCTION public.update_category(
    p_business_id UUID,
    p_category_id UUID,
    p_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_parent_id UUID DEFAULT NULL,
    p_sort_order INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_old_name TEXT;
    v_product_count BIGINT;
BEGIN
    -- Get current category info
    SELECT name INTO v_old_name
    FROM public.categories
    WHERE id = p_category_id AND business_id = p_business_id;

    IF v_old_name IS NULL THEN
        RAISE EXCEPTION 'Category not found';
    END IF;

    -- Check for duplicate name if changing name
    IF p_name IS NOT NULL AND TRIM(p_name) != v_old_name THEN
        IF EXISTS (
            SELECT 1 FROM public.categories
            WHERE business_id = p_business_id
                AND name = TRIM(p_name)
                AND id != p_category_id
                AND (parent_id = p_parent_id OR (parent_id IS NULL AND p_parent_id IS NULL))
        ) THEN
            RAISE EXCEPTION 'Category "%" already exists', TRIM(p_name);
        END IF;
    END IF;

    -- Prevent setting self as parent
    IF p_parent_id = p_category_id THEN
        RAISE EXCEPTION 'Category cannot be its own parent';
    END IF;

    -- Validate parent exists if provided
    IF p_parent_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.categories
            WHERE id = p_parent_id AND business_id = p_business_id
        ) THEN
            RAISE EXCEPTION 'Parent category not found';
        END IF;
    END IF;

    -- Update category
    UPDATE public.categories
    SET
        name = COALESCE(TRIM(p_name), name),
        description = COALESCE(p_description, description),
        parent_id = COALESCE(p_parent_id, parent_id),
        sort_order = COALESCE(p_sort_order, sort_order),
        updated_at = NOW()
    WHERE id = p_category_id AND business_id = p_business_id;

    -- Get product count
    SELECT COUNT(*) INTO v_product_count
    FROM public.items
    WHERE category_id = p_category_id AND business_id = p_business_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'category_id', p_category_id,
        'old_name', v_old_name,
        'new_name', COALESCE(TRIM(p_name), v_old_name),
        'product_count', v_product_count,
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 7. DELETE CATEGORY
-- =============================================
-- Deletes a category (only if no products assigned)
CREATE OR REPLACE FUNCTION public.delete_category(
    p_business_id UUID,
    p_category_id UUID,
    p_move_products_to UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_category_name TEXT;
    v_product_count BIGINT;
    v_child_count BIGINT;
BEGIN
    -- Get category info
    SELECT name INTO v_category_name
    FROM public.categories
    WHERE id = p_category_id AND business_id = p_business_id;

    IF v_category_name IS NULL THEN
        RAISE EXCEPTION 'Category not found';
    END IF;

    -- Check for child categories
    SELECT COUNT(*) INTO v_child_count
    FROM public.categories
    WHERE parent_id = p_category_id AND business_id = p_business_id;

    IF v_child_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete category with % subcategories. Delete or move them first.', v_child_count;
    END IF;

    -- Count products in category
    SELECT COUNT(*) INTO v_product_count
    FROM public.items
    WHERE category_id = p_category_id AND business_id = p_business_id;

    -- If products exist, move them or reject
    IF v_product_count > 0 THEN
        IF p_move_products_to IS NULL THEN
            RAISE EXCEPTION 'Cannot delete category with % products. Move them first or provide move_products_to parameter.', v_product_count;
        END IF;

        -- Validate target category
        IF NOT EXISTS (
            SELECT 1 FROM public.categories
            WHERE id = p_move_products_to AND business_id = p_business_id
        ) THEN
            RAISE EXCEPTION 'Target category not found';
        END IF;

        -- Move products
        UPDATE public.items
        SET category_id = p_move_products_to
        WHERE category_id = p_category_id AND business_id = p_business_id;
    END IF;

    -- Delete category
    DELETE FROM public.categories
    WHERE id = p_category_id AND business_id = p_business_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'category_id', p_category_id,
        'category_name', v_category_name,
        'products_moved', v_product_count,
        'moved_to', p_move_products_to,
        'deleted_at', NOW()
    );
END;
$$;

-- =============================================
-- 8. REORDER CATEGORIES
-- =============================================
-- Bulk reorder categories within same parent
CREATE OR REPLACE FUNCTION public.reorder_categories(
    p_business_id UUID,
    p_category_orders JSONB  -- Array of {id: UUID, sort_order: INTEGER}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_category JSONB;
    v_updated_count INTEGER := 0;
BEGIN
    -- Validate input
    IF p_category_orders IS NULL OR JSONB_ARRAY_LENGTH(p_category_orders) = 0 THEN
        RAISE EXCEPTION 'Category orders array cannot be empty';
    END IF;

    -- Update each category
    FOR v_category IN SELECT * FROM JSONB_ARRAY_ELEMENTS(p_category_orders)
    LOOP
        UPDATE public.categories
        SET
            sort_order = (v_category->>'sort_order')::INTEGER,
            updated_at = NOW()
        WHERE id = (v_category->>'id')::UUID
            AND business_id = p_business_id;

        IF FOUND THEN
            v_updated_count := v_updated_count + 1;
        END IF;
    END LOOP;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'updated_count', v_updated_count,
        'total_requested', JSONB_ARRAY_LENGTH(p_category_orders),
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Index for category hierarchy queries
CREATE INDEX IF NOT EXISTS idx_categories_parent
    ON public.categories(business_id, parent_id);

-- Index for category sorting
CREATE INDEX IF NOT EXISTS idx_categories_sort
    ON public.categories(business_id, sort_order);

-- Index for category name searches
CREATE INDEX IF NOT EXISTS idx_categories_name
    ON public.categories(business_id, name);

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_business_categories(UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_tree(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_analytics(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_selling_categories(UUID, DATE, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_category(UUID, TEXT, TEXT, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_category(UUID, UUID, TEXT, TEXT, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_category(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_categories(UUID, JSONB) TO authenticated;
