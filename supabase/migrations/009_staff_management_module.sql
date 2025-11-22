-- =============================================
-- Staff Management Module - Complete Implementation
-- Migration: 009_staff_management_module
-- =============================================
-- This migration creates comprehensive staff management functions
-- for the POS system including attendance, performance tracking, and user management.

-- =============================================
-- 1. GET BUSINESS STAFF
-- =============================================
-- Retrieves all staff members for a business with filtering and sorting
CREATE OR REPLACE FUNCTION public.get_business_staff(
    p_business_id UUID,
    p_role TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'created_at',
    p_sort_order TEXT DEFAULT 'DESC'
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    phone TEXT,
    role TEXT,
    is_active BOOLEAN,
    permissions JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    total_sales NUMERIC,
    total_transactions BIGINT,
    avg_transaction_value NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.full_name,
        p.phone,
        p.role::TEXT,
        p.is_active,
        p.permissions,
        p.created_at,
        p.updated_at,
        ROUND(COALESCE(SUM(s.total), 0), 2) as total_sales,
        COUNT(s.id)::BIGINT as total_transactions,
        ROUND(COALESCE(AVG(s.total), 0), 2) as avg_transaction_value
    FROM public.profiles p
    LEFT JOIN public.sales s ON p.id = s.user_id
        AND s.business_id = p_business_id
        AND s.status = 'COMPLETED'
    WHERE p.business_id = p_business_id
        AND (p_role IS NULL OR p.role::TEXT = p_role)
        AND (p_is_active IS NULL OR p.is_active = p_is_active)
        AND (
            p_search_term IS NULL
            OR p.full_name ILIKE '%' || p_search_term || '%'
            OR p.phone ILIKE '%' || p_search_term || '%'
        )
    GROUP BY p.id, p.full_name, p.phone, p.role, p.is_active, p.permissions, p.created_at, p.updated_at
    ORDER BY
        CASE WHEN p_sort_by = 'full_name' AND p_sort_order = 'ASC' THEN p.full_name END ASC,
        CASE WHEN p_sort_by = 'full_name' AND p_sort_order = 'DESC' THEN p.full_name END DESC,
        CASE WHEN p_sort_by = 'total_sales' AND p_sort_order = 'ASC' THEN SUM(s.total) END ASC,
        CASE WHEN p_sort_by = 'total_sales' AND p_sort_order = 'DESC' THEN SUM(s.total) END DESC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'ASC' THEN p.created_at END ASC,
        CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'DESC' THEN p.created_at END DESC;
END;
$$;

-- =============================================
-- 2. GET STAFF DETAILS
-- =============================================
-- Retrieves detailed information about a specific staff member
CREATE OR REPLACE FUNCTION public.get_staff_details(
    p_business_id UUID,
    p_staff_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_staff_info JSONB;
    v_sales_summary JSONB;
    v_recent_sales JSONB;
BEGIN
    -- Get staff basic info
    SELECT JSONB_BUILD_OBJECT(
        'id', p.id,
        'full_name', p.full_name,
        'phone', p.phone,
        'role', p.role,
        'is_active', p.is_active,
        'permissions', p.permissions,
        'created_at', p.created_at,
        'updated_at', p.updated_at
    ) INTO v_staff_info
    FROM public.profiles p
    WHERE p.id = p_staff_id AND p.business_id = p_business_id;

    IF v_staff_info IS NULL THEN
        RAISE EXCEPTION 'Staff member not found';
    END IF;

    -- Get sales summary
    SELECT JSONB_BUILD_OBJECT(
        'total_sales', ROUND(COALESCE(SUM(total), 0), 2),
        'total_transactions', COUNT(*),
        'avg_transaction_value', ROUND(COALESCE(AVG(total), 0), 2),
        'today_sales', ROUND(COALESCE(SUM(CASE WHEN created_at::DATE = CURRENT_DATE THEN total ELSE 0 END), 0), 2),
        'this_month_sales', ROUND(COALESCE(SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN total ELSE 0 END), 0), 2)
    ) INTO v_sales_summary
    FROM public.sales
    WHERE user_id = p_staff_id
        AND business_id = p_business_id
        AND status = 'COMPLETED';

    -- Get recent sales (last 10)
    SELECT JSONB_AGG(
        JSONB_BUILD_OBJECT(
            'id', id,
            'sale_number', sale_number,
            'total', ROUND(total, 2),
            'created_at', created_at,
            'customer_id', customer_id
        ) ORDER BY created_at DESC
    ) INTO v_recent_sales
    FROM (
        SELECT id, sale_number, total, created_at, customer_id
        FROM public.sales
        WHERE user_id = p_staff_id
            AND business_id = p_business_id
            AND status = 'COMPLETED'
        ORDER BY created_at DESC
        LIMIT 10
    ) recent;

    RETURN JSONB_BUILD_OBJECT(
        'staff', v_staff_info,
        'sales_summary', v_sales_summary,
        'recent_sales', COALESCE(v_recent_sales, '[]'::JSONB)
    );
END;
$$;

-- =============================================
-- 3. GET STAFF PERFORMANCE
-- =============================================
-- Analyzes staff performance metrics for a date range
CREATE OR REPLACE FUNCTION public.get_staff_performance(
    p_business_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    staff_id UUID,
    staff_name TEXT,
    role TEXT,
    total_sales NUMERIC,
    transaction_count BIGINT,
    avg_transaction_value NUMERIC,
    total_items_sold BIGINT,
    unique_customers BIGINT,
    cash_sales NUMERIC,
    card_sales NUMERIC,
    upi_sales NUMERIC,
    performance_rank INTEGER
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
    WITH staff_metrics AS (
        SELECT
            p.id as staff_id,
            p.full_name as staff_name,
            p.role::TEXT,
            ROUND(COALESCE(SUM(s.total), 0), 2) as total_sales,
            COUNT(s.id)::BIGINT as transaction_count,
            ROUND(COALESCE(AVG(s.total), 0), 2) as avg_transaction_value,
            COALESCE(SUM(
                (SELECT COUNT(*) FROM public.sale_items si WHERE si.sale_id = s.id)
            ), 0)::BIGINT as total_items_sold,
            COUNT(DISTINCT s.customer_id)::BIGINT as unique_customers,
            ROUND(COALESCE(SUM(CASE WHEN s.payment_method = 'CASH' THEN s.total ELSE 0 END), 0), 2) as cash_sales,
            ROUND(COALESCE(SUM(CASE WHEN s.payment_method = 'CARD' THEN s.total ELSE 0 END), 0), 2) as card_sales,
            ROUND(COALESCE(SUM(CASE WHEN s.payment_method = 'UPI' THEN s.total ELSE 0 END), 0), 2) as upi_sales
        FROM public.profiles p
        LEFT JOIN public.sales s ON p.id = s.user_id
            AND s.business_id = p_business_id
            AND s.status = 'COMPLETED'
            AND s.created_at::DATE >= v_start_date
            AND s.created_at::DATE <= v_end_date
        WHERE p.business_id = p_business_id
            AND p.is_active = TRUE
        GROUP BY p.id, p.full_name, p.role
    )
    SELECT
        sm.*,
        RANK() OVER (ORDER BY sm.total_sales DESC)::INTEGER as performance_rank
    FROM staff_metrics sm
    ORDER BY performance_rank;
END;
$$;

-- =============================================
-- 4. GET STAFF SALES COMPARISON
-- =============================================
-- Compares staff sales performance across periods
CREATE OR REPLACE FUNCTION public.get_staff_sales_comparison(
    p_business_id UUID,
    p_current_start DATE,
    p_current_end DATE,
    p_previous_start DATE,
    p_previous_end DATE
)
RETURNS TABLE (
    staff_id UUID,
    staff_name TEXT,
    role TEXT,
    current_period_sales NUMERIC,
    previous_period_sales NUMERIC,
    sales_growth NUMERIC,
    current_transactions BIGINT,
    previous_transactions BIGINT,
    transaction_growth NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT
            s.user_id,
            SUM(s.total) as sales,
            COUNT(*) as transactions
        FROM public.sales s
        WHERE s.business_id = p_business_id
            AND s.status = 'COMPLETED'
            AND s.created_at::DATE >= p_current_start
            AND s.created_at::DATE <= p_current_end
        GROUP BY s.user_id
    ),
    previous_period AS (
        SELECT
            s.user_id,
            SUM(s.total) as sales,
            COUNT(*) as transactions
        FROM public.sales s
        WHERE s.business_id = p_business_id
            AND s.status = 'COMPLETED'
            AND s.created_at::DATE >= p_previous_start
            AND s.created_at::DATE <= p_previous_end
        GROUP BY s.user_id
    )
    SELECT
        p.id as staff_id,
        p.full_name as staff_name,
        p.role::TEXT,
        ROUND(COALESCE(cp.sales, 0), 2) as current_period_sales,
        ROUND(COALESCE(pp.sales, 0), 2) as previous_period_sales,
        ROUND(
            CASE
                WHEN COALESCE(pp.sales, 0) > 0
                THEN ((COALESCE(cp.sales, 0) - COALESCE(pp.sales, 0)) / pp.sales * 100)
                ELSE NULL
            END,
            2
        ) as sales_growth,
        COALESCE(cp.transactions, 0)::BIGINT as current_transactions,
        COALESCE(pp.transactions, 0)::BIGINT as previous_transactions,
        ROUND(
            CASE
                WHEN COALESCE(pp.transactions, 0) > 0
                THEN ((COALESCE(cp.transactions, 0) - COALESCE(pp.transactions, 0))::NUMERIC / pp.transactions * 100)
                ELSE NULL
            END,
            2
        ) as transaction_growth
    FROM public.profiles p
    LEFT JOIN current_period cp ON p.id = cp.user_id
    LEFT JOIN previous_period pp ON p.id = pp.user_id
    WHERE p.business_id = p_business_id
        AND p.is_active = TRUE
    ORDER BY current_period_sales DESC;
END;
$$;

-- =============================================
-- 5. GET TOP PERFORMING STAFF
-- =============================================
-- Retrieves top performing staff by various metrics
CREATE OR REPLACE FUNCTION public.get_top_performing_staff(
    p_business_id UUID,
    p_metric TEXT DEFAULT 'sales',  -- 'sales', 'transactions', 'avg_value'
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    staff_id UUID,
    staff_name TEXT,
    role TEXT,
    metric_value NUMERIC,
    total_sales NUMERIC,
    transaction_count BIGINT,
    avg_transaction_value NUMERIC
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
        p.id as staff_id,
        p.full_name as staff_name,
        p.role::TEXT,
        CASE p_metric
            WHEN 'sales' THEN ROUND(COALESCE(SUM(s.total), 0), 2)
            WHEN 'transactions' THEN COUNT(s.id)::NUMERIC
            WHEN 'avg_value' THEN ROUND(COALESCE(AVG(s.total), 0), 2)
            ELSE ROUND(COALESCE(SUM(s.total), 0), 2)
        END as metric_value,
        ROUND(COALESCE(SUM(s.total), 0), 2) as total_sales,
        COUNT(s.id)::BIGINT as transaction_count,
        ROUND(COALESCE(AVG(s.total), 0), 2) as avg_transaction_value
    FROM public.profiles p
    LEFT JOIN public.sales s ON p.id = s.user_id
        AND s.business_id = p_business_id
        AND s.status = 'COMPLETED'
        AND s.created_at::DATE >= v_start_date
        AND s.created_at::DATE <= v_end_date
    WHERE p.business_id = p_business_id
        AND p.is_active = TRUE
    GROUP BY p.id, p.full_name, p.role
    ORDER BY metric_value DESC
    LIMIT p_limit;
END;
$$;

-- =============================================
-- 6. UPDATE STAFF ROLE
-- =============================================
-- Updates a staff member's role and permissions
CREATE OR REPLACE FUNCTION public.update_staff_role(
    p_business_id UUID,
    p_staff_id UUID,
    p_new_role TEXT,
    p_permissions JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_old_role TEXT;
    v_staff_name TEXT;
BEGIN
    -- Get current role and name
    SELECT role::TEXT, full_name INTO v_old_role, v_staff_name
    FROM public.profiles
    WHERE id = p_staff_id AND business_id = p_business_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Staff member not found';
    END IF;

    -- Validate new role
    IF p_new_role NOT IN ('OWNER', 'MANAGER', 'STAFF', 'HELPER') THEN
        RAISE EXCEPTION 'Invalid role. Must be OWNER, MANAGER, STAFF, or HELPER';
    END IF;

    -- Update role and permissions
    UPDATE public.profiles
    SET
        role = p_new_role::public.user_role,
        permissions = COALESCE(p_permissions, permissions),
        updated_at = NOW()
    WHERE id = p_staff_id AND business_id = p_business_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'staff_id', p_staff_id,
        'staff_name', v_staff_name,
        'old_role', v_old_role,
        'new_role', p_new_role,
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 7. ACTIVATE/DEACTIVATE STAFF
-- =============================================
-- Activates or deactivates a staff member
CREATE OR REPLACE FUNCTION public.toggle_staff_status(
    p_business_id UUID,
    p_staff_id UUID,
    p_is_active BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_staff_name TEXT;
    v_old_status BOOLEAN;
BEGIN
    -- Get current status
    SELECT full_name, is_active INTO v_staff_name, v_old_status
    FROM public.profiles
    WHERE id = p_staff_id AND business_id = p_business_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Staff member not found';
    END IF;

    -- Update status
    UPDATE public.profiles
    SET
        is_active = p_is_active,
        updated_at = NOW()
    WHERE id = p_staff_id AND business_id = p_business_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'staff_id', p_staff_id,
        'staff_name', v_staff_name,
        'old_status', v_old_status,
        'new_status', p_is_active,
        'action', CASE WHEN p_is_active THEN 'activated' ELSE 'deactivated' END,
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 8. GET STAFF HOURLY PERFORMANCE
-- =============================================
-- Analyzes staff performance by hour of day
CREATE OR REPLACE FUNCTION public.get_staff_hourly_performance(
    p_business_id UUID,
    p_staff_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    staff_id UUID,
    staff_name TEXT,
    hour INTEGER,
    total_sales NUMERIC,
    transaction_count BIGINT,
    avg_transaction_value NUMERIC
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
        p.id as staff_id,
        p.full_name as staff_name,
        EXTRACT(HOUR FROM s.created_at)::INTEGER as hour,
        ROUND(COALESCE(SUM(s.total), 0), 2) as total_sales,
        COUNT(s.id)::BIGINT as transaction_count,
        ROUND(COALESCE(AVG(s.total), 0), 2) as avg_transaction_value
    FROM public.profiles p
    JOIN public.sales s ON p.id = s.user_id
        AND s.business_id = p_business_id
        AND s.status = 'COMPLETED'
        AND s.created_at::DATE >= v_start_date
        AND s.created_at::DATE <= v_end_date
    WHERE p.business_id = p_business_id
        AND (p_staff_id IS NULL OR p.id = p_staff_id)
    GROUP BY p.id, p.full_name, EXTRACT(HOUR FROM s.created_at)
    ORDER BY staff_id, hour;
END;
$$;

-- =============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Index for profiles queries
CREATE INDEX IF NOT EXISTS idx_profiles_business_active
    ON public.profiles(business_id, is_active)
    WHERE is_active = TRUE;

-- Index for sales by user queries
CREATE INDEX IF NOT EXISTS idx_sales_user_date
    ON public.sales(user_id, business_id, created_at)
    WHERE status = 'COMPLETED';

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_business_staff(UUID, TEXT, BOOLEAN, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_details(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_performance(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_sales_comparison(UUID, DATE, DATE, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_performing_staff(UUID, TEXT, DATE, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_staff_role(UUID, UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_staff_status(UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_hourly_performance(UUID, UUID, DATE, DATE) TO authenticated;
