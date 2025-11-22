-- =====================================================
-- EXPENSE MANAGEMENT MODULE - COMPLETE IMPLEMENTATION
-- =====================================================
-- Migration: 007_expense_module_complete
-- Description: Complete expense tracking and management system
-- Created: 2025-01-22
-- Features:
--   - Expense CRUD with category management
--   - Expense analytics and reporting
--   - Payment method tracking
--   - Date range filtering
--   - Category-wise breakdown
--   - Staff expense tracking
--   - Expense approval workflow
-- =====================================================

-- =====================================================
-- 1. ADD MISSING EXPENSE FIELDS
-- =====================================================

-- Add expense approval and attachment fields
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_interval TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
ADD COLUMN IF NOT EXISTS notes TEXT;

COMMENT ON COLUMN public.expenses.receipt_url IS 'URL to receipt/invoice image';
COMMENT ON COLUMN public.expenses.approved_by IS 'User who approved the expense';
COMMENT ON COLUMN public.expenses.approved_at IS 'Timestamp of expense approval';
COMMENT ON COLUMN public.expenses.is_recurring IS 'Whether this is a recurring expense';
COMMENT ON COLUMN public.expenses.recurrence_interval IS 'Frequency for recurring expenses';

-- =====================================================
-- 2. FUNCTION: get_business_expenses()
-- Get expenses with advanced filtering
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_business_expenses(
    p_business_id UUID,
    p_category TEXT DEFAULT NULL,
    p_payment_method TEXT DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_approved_only BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    business_id UUID,
    category TEXT,
    amount NUMERIC,
    description TEXT,
    payment_method TEXT,
    user_id UUID,
    user_name TEXT,
    date DATE,
    receipt_url TEXT,
    approved_by UUID,
    approver_name TEXT,
    approved_at TIMESTAMPTZ,
    is_recurring BOOLEAN,
    recurrence_interval TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.business_id,
        e.category,
        e.amount,
        e.description,
        e.payment_method,
        e.user_id,
        p.full_name as user_name,
        e.date,
        e.receipt_url,
        e.approved_by,
        ap.full_name as approver_name,
        e.approved_at,
        e.is_recurring,
        e.recurrence_interval,
        e.notes,
        e.created_at
    FROM public.expenses e
    LEFT JOIN public.profiles p ON e.user_id = p.id
    LEFT JOIN public.profiles ap ON e.approved_by = ap.id
    WHERE e.business_id = p_business_id
        AND (p_category IS NULL OR e.category = p_category)
        AND (p_payment_method IS NULL OR e.payment_method = p_payment_method)
        AND (p_start_date IS NULL OR e.date >= p_start_date)
        AND (p_end_date IS NULL OR e.date <= p_end_date)
        AND (p_user_id IS NULL OR e.user_id = p_user_id)
        AND (p_approved_only IS NULL OR (p_approved_only = TRUE AND e.approved_by IS NOT NULL) OR (p_approved_only = FALSE AND e.approved_by IS NULL))
    ORDER BY e.date DESC, e.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.get_business_expenses IS 'Get expenses with advanced filtering by category, payment method, date range, user, and approval status';

-- =====================================================
-- 3. FUNCTION: create_expense()
-- Create new expense with validation
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_expense(
    p_business_id UUID,
    p_category TEXT,
    p_amount NUMERIC,
    p_user_id UUID,
    p_date DATE,
    p_description TEXT DEFAULT NULL,
    p_payment_method TEXT DEFAULT 'CASH',
    p_receipt_url TEXT DEFAULT NULL,
    p_is_recurring BOOLEAN DEFAULT FALSE,
    p_recurrence_interval TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_expense_id UUID;
    v_expense_number TEXT;
BEGIN
    -- Validate amount
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Expense amount must be greater than zero';
    END IF;

    -- Validate category
    IF p_category IS NULL OR p_category = '' THEN
        RAISE EXCEPTION 'Expense category is required';
    END IF;

    -- Validate recurrence
    IF p_is_recurring = TRUE AND p_recurrence_interval IS NULL THEN
        RAISE EXCEPTION 'Recurrence interval is required for recurring expenses';
    END IF;

    -- Insert expense
    INSERT INTO public.expenses (
        business_id,
        category,
        amount,
        description,
        payment_method,
        user_id,
        date,
        receipt_url,
        is_recurring,
        recurrence_interval,
        notes
    ) VALUES (
        p_business_id,
        p_category,
        p_amount,
        p_description,
        p_payment_method,
        p_user_id,
        p_date,
        p_receipt_url,
        p_is_recurring,
        p_recurrence_interval,
        p_notes
    )
    RETURNING id INTO v_expense_id;

    -- Generate expense number
    v_expense_number := 'EXP-' || TO_CHAR(p_date, 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT % 10000)::TEXT, 4, '0');

    RETURN jsonb_build_object(
        'success', TRUE,
        'expense_id', v_expense_id,
        'expense_number', v_expense_number,
        'amount', p_amount,
        'category', p_category,
        'date', p_date
    );
END;
$$;

COMMENT ON FUNCTION public.create_expense IS 'Create new expense with validation and automatic numbering';

-- =====================================================
-- 4. FUNCTION: approve_expense()
-- Approve pending expense
-- =====================================================

CREATE OR REPLACE FUNCTION public.approve_expense(
    p_expense_id UUID,
    p_business_id UUID,
    p_approver_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_expense RECORD;
BEGIN
    -- Get expense details
    SELECT * INTO v_expense
    FROM public.expenses
    WHERE id = p_expense_id AND business_id = p_business_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Expense not found';
    END IF;

    -- Check if already approved
    IF v_expense.approved_by IS NOT NULL THEN
        RAISE EXCEPTION 'Expense already approved by %', (SELECT full_name FROM public.profiles WHERE id = v_expense.approved_by);
    END IF;

    -- Approve expense
    UPDATE public.expenses
    SET
        approved_by = p_approver_id,
        approved_at = NOW()
    WHERE id = p_expense_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'expense_id', p_expense_id,
        'amount', v_expense.amount,
        'category', v_expense.category,
        'approved_by', p_approver_id,
        'approved_at', NOW()
    );
END;
$$;

COMMENT ON FUNCTION public.approve_expense IS 'Approve pending expense';

-- =====================================================
-- 5. FUNCTION: get_expense_summary()
-- Get expense summary for date range
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_expense_summary(
    p_business_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_total_expenses NUMERIC;
    v_approved_expenses NUMERIC;
    v_pending_expenses NUMERIC;
    v_expense_count INTEGER;
    v_avg_expense NUMERIC;
    v_category_breakdown JSONB;
    v_payment_breakdown JSONB;
    v_monthly_trend JSONB;
BEGIN
    -- Default to current month if no dates provided
    v_start_date := COALESCE(p_start_date, DATE_TRUNC('month', CURRENT_DATE)::DATE);
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);

    -- Total expenses
    SELECT
        COALESCE(SUM(amount), 0),
        COALESCE(SUM(CASE WHEN approved_by IS NOT NULL THEN amount END), 0),
        COALESCE(SUM(CASE WHEN approved_by IS NULL THEN amount END), 0),
        COUNT(*),
        COALESCE(AVG(amount), 0)
    INTO v_total_expenses, v_approved_expenses, v_pending_expenses, v_expense_count, v_avg_expense
    FROM public.expenses
    WHERE business_id = p_business_id
        AND date >= v_start_date
        AND date <= v_end_date;

    -- Category breakdown
    SELECT jsonb_agg(
        jsonb_build_object(
            'category', category,
            'total', total,
            'count', count,
            'percentage', ROUND((total / NULLIF(v_total_expenses, 0) * 100)::NUMERIC, 2)
        ) ORDER BY total DESC
    )
    INTO v_category_breakdown
    FROM (
        SELECT
            category,
            SUM(amount) as total,
            COUNT(*) as count
        FROM public.expenses
        WHERE business_id = p_business_id
            AND date >= v_start_date
            AND date <= v_end_date
        GROUP BY category
    ) cat;

    -- Payment method breakdown
    SELECT jsonb_agg(
        jsonb_build_object(
            'method', payment_method,
            'total', total,
            'count', count
        ) ORDER BY total DESC
    )
    INTO v_payment_breakdown
    FROM (
        SELECT
            payment_method,
            SUM(amount) as total,
            COUNT(*) as count
        FROM public.expenses
        WHERE business_id = p_business_id
            AND date >= v_start_date
            AND date <= v_end_date
            AND payment_method IS NOT NULL
        GROUP BY payment_method
    ) pm;

    -- Monthly trend (last 12 months)
    SELECT jsonb_agg(
        jsonb_build_object(
            'month', month,
            'total', total,
            'count', count
        ) ORDER BY month DESC
    )
    INTO v_monthly_trend
    FROM (
        SELECT
            TO_CHAR(date, 'YYYY-MM') as month,
            SUM(amount) as total,
            COUNT(*) as count
        FROM public.expenses
        WHERE business_id = p_business_id
            AND date >= (CURRENT_DATE - INTERVAL '12 months')
        GROUP BY TO_CHAR(date, 'YYYY-MM')
    ) mt;

    RETURN jsonb_build_object(
        'period', jsonb_build_object(
            'start_date', v_start_date,
            'end_date', v_end_date
        ),
        'totals', jsonb_build_object(
            'total_expenses', v_total_expenses,
            'approved_expenses', v_approved_expenses,
            'pending_expenses', v_pending_expenses,
            'expense_count', v_expense_count,
            'avg_expense', ROUND(v_avg_expense, 2)
        ),
        'by_category', COALESCE(v_category_breakdown, '[]'::jsonb),
        'by_payment_method', COALESCE(v_payment_breakdown, '[]'::jsonb),
        'monthly_trend', COALESCE(v_monthly_trend, '[]'::jsonb)
    );
END;
$$;

COMMENT ON FUNCTION public.get_expense_summary IS 'Get comprehensive expense summary with breakdowns and trends';

-- =====================================================
-- 6. FUNCTION: get_expense_categories()
-- Get distinct expense categories with totals
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_expense_categories(
    p_business_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    category TEXT,
    total_amount NUMERIC,
    expense_count BIGINT,
    avg_amount NUMERIC,
    last_expense_date DATE
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.category,
        SUM(e.amount) as total_amount,
        COUNT(*) as expense_count,
        ROUND(AVG(e.amount), 2) as avg_amount,
        MAX(e.date) as last_expense_date
    FROM public.expenses e
    WHERE e.business_id = p_business_id
        AND (p_start_date IS NULL OR e.date >= p_start_date)
        AND (p_end_date IS NULL OR e.date <= p_end_date)
    GROUP BY e.category
    ORDER BY total_amount DESC;
END;
$$;

COMMENT ON FUNCTION public.get_expense_categories IS 'Get expense categories with statistics';

-- =====================================================
-- 7. FUNCTION: get_recurring_expenses()
-- Get all recurring expenses
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_recurring_expenses(
    p_business_id UUID,
    p_active_only BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    id UUID,
    category TEXT,
    amount NUMERIC,
    description TEXT,
    recurrence_interval TEXT,
    payment_method TEXT,
    last_occurrence_date DATE,
    next_occurrence_date DATE,
    user_name TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.category,
        e.amount,
        e.description,
        e.recurrence_interval,
        e.payment_method,
        e.date as last_occurrence_date,
        CASE
            WHEN e.recurrence_interval = 'daily' THEN e.date + INTERVAL '1 day'
            WHEN e.recurrence_interval = 'weekly' THEN e.date + INTERVAL '1 week'
            WHEN e.recurrence_interval = 'monthly' THEN e.date + INTERVAL '1 month'
            WHEN e.recurrence_interval = 'yearly' THEN e.date + INTERVAL '1 year'
            ELSE NULL
        END::DATE as next_occurrence_date,
        p.full_name as user_name
    FROM public.expenses e
    LEFT JOIN public.profiles p ON e.user_id = p.id
    WHERE e.business_id = p_business_id
        AND e.is_recurring = TRUE
        AND (p_active_only = FALSE OR e.date <= CURRENT_DATE)
    ORDER BY e.date DESC;
END;
$$;

COMMENT ON FUNCTION public.get_recurring_expenses IS 'Get recurring expenses with next occurrence dates';

-- =====================================================
-- 8. FUNCTION: get_top_expense_categories()
-- Get top expense categories by total amount
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_top_expense_categories(
    p_business_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    category TEXT,
    total_amount NUMERIC,
    expense_count BIGINT,
    percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_total NUMERIC;
BEGIN
    -- Calculate total expenses for percentage
    SELECT COALESCE(SUM(amount), 0) INTO v_total
    FROM public.expenses
    WHERE business_id = p_business_id
        AND (p_start_date IS NULL OR date >= p_start_date)
        AND (p_end_date IS NULL OR date <= p_end_date);

    RETURN QUERY
    SELECT
        e.category,
        SUM(e.amount) as total_amount,
        COUNT(*) as expense_count,
        ROUND((SUM(e.amount) / NULLIF(v_total, 0) * 100)::NUMERIC, 2) as percentage
    FROM public.expenses e
    WHERE e.business_id = p_business_id
        AND (p_start_date IS NULL OR e.date >= p_start_date)
        AND (p_end_date IS NULL OR e.date <= p_end_date)
    GROUP BY e.category
    ORDER BY total_amount DESC
    LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION public.get_top_expense_categories IS 'Get top expense categories by total amount with percentage';

-- =====================================================
-- 9. FUNCTION: get_staff_expenses()
-- Get expenses grouped by staff member
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_staff_expenses(
    p_business_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    total_expenses NUMERIC,
    expense_count BIGINT,
    approved_count BIGINT,
    pending_count BIGINT,
    avg_expense NUMERIC
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.user_id,
        p.full_name as user_name,
        SUM(e.amount) as total_expenses,
        COUNT(*) as expense_count,
        COUNT(CASE WHEN e.approved_by IS NOT NULL THEN 1 END) as approved_count,
        COUNT(CASE WHEN e.approved_by IS NULL THEN 1 END) as pending_count,
        ROUND(AVG(e.amount), 2) as avg_expense
    FROM public.expenses e
    LEFT JOIN public.profiles p ON e.user_id = p.id
    WHERE e.business_id = p_business_id
        AND (p_start_date IS NULL OR e.date >= p_start_date)
        AND (p_end_date IS NULL OR e.date <= p_end_date)
    GROUP BY e.user_id, p.full_name
    ORDER BY total_expenses DESC;
END;
$$;

COMMENT ON FUNCTION public.get_staff_expenses IS 'Get expenses grouped by staff member with approval statistics';

-- =====================================================
-- 10. PERFORMANCE INDEXES
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_expenses_business_date
    ON public.expenses(business_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_business_category
    ON public.expenses(business_id, category);

CREATE INDEX IF NOT EXISTS idx_expenses_business_user
    ON public.expenses(business_id, user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_approval_status
    ON public.expenses(business_id, approved_by)
    WHERE approved_by IS NULL; -- Partial index for pending approvals

CREATE INDEX IF NOT EXISTS idx_expenses_recurring
    ON public.expenses(business_id, is_recurring, date)
    WHERE is_recurring = TRUE;

-- Payment method index
CREATE INDEX IF NOT EXISTS idx_expenses_payment_method
    ON public.expenses(business_id, payment_method)
    WHERE payment_method IS NOT NULL;

COMMENT ON INDEX idx_expenses_business_date IS 'Optimize date range queries';
COMMENT ON INDEX idx_expenses_business_category IS 'Optimize category filtering';
COMMENT ON INDEX idx_expenses_business_user IS 'Optimize user expense tracking';
COMMENT ON INDEX idx_expenses_approval_status IS 'Optimize pending approval queries';
COMMENT ON INDEX idx_expenses_recurring IS 'Optimize recurring expense queries';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
