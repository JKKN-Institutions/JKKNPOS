-- =====================================================
-- REPORTS & ANALYTICS MODULE - COMPLETE IMPLEMENTATION
-- =====================================================
-- Migration: 008_reports_analytics_module
-- Description: Comprehensive business intelligence and reporting system
-- Created: 2025-01-22
-- Features:
--   - Profit & Loss statement
--   - Daily/hourly sales analytics
--   - Dead stock detection
--   - Tax reports (GST)
--   - Cash flow analysis
--   - Business dashboard KPIs
--   - Comparative period analysis
-- =====================================================

-- =====================================================
-- 1. FUNCTION: get_profit_loss_statement()
-- Complete P&L statement for date range
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_profit_loss_statement(
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
    v_total_revenue NUMERIC;
    v_total_cost NUMERIC;
    v_gross_profit NUMERIC;
    v_total_expenses NUMERIC;
    v_net_profit NUMERIC;
    v_gross_margin NUMERIC;
    v_net_margin NUMERIC;
    v_revenue_breakdown JSONB;
    v_expense_breakdown JSONB;
BEGIN
    -- Default to current month if no dates provided
    v_start_date := COALESCE(p_start_date, DATE_TRUNC('month', CURRENT_DATE)::DATE);
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);

    -- Calculate total revenue from sales
    SELECT
        COALESCE(SUM(s.total), 0)
    INTO v_total_revenue
    FROM public.sales s
    WHERE s.business_id = p_business_id
        AND s.status = 'COMPLETED'
        AND s.created_at::DATE >= v_start_date
        AND s.created_at::DATE <= v_end_date;

    -- Calculate total cost of goods sold
    SELECT
        COALESCE(SUM(si.quantity * i.cost), 0)
    INTO v_total_cost
    FROM public.sale_items si
    JOIN public.sales s ON si.sale_id = s.id
    JOIN public.items i ON si.item_id = i.id
    WHERE s.business_id = p_business_id
        AND s.status = 'COMPLETED'
        AND s.created_at::DATE >= v_start_date
        AND s.created_at::DATE <= v_end_date;

    -- Calculate gross profit
    v_gross_profit := v_total_revenue - v_total_cost;

    -- Calculate total expenses
    SELECT
        COALESCE(SUM(amount), 0)
    INTO v_total_expenses
    FROM public.expenses
    WHERE business_id = p_business_id
        AND date >= v_start_date
        AND date <= v_end_date;

    -- Calculate net profit
    v_net_profit := v_gross_profit - v_total_expenses;

    -- Calculate margins
    v_gross_margin := CASE WHEN v_total_revenue > 0
        THEN (v_gross_profit / v_total_revenue * 100)
        ELSE 0 END;
    v_net_margin := CASE WHEN v_total_revenue > 0
        THEN (v_net_profit / v_total_revenue * 100)
        ELSE 0 END;

    -- Revenue breakdown by category
    SELECT jsonb_agg(
        jsonb_build_object(
            'category', category_name,
            'revenue', revenue,
            'cost', cost,
            'profit', profit,
            'margin', margin
        ) ORDER BY revenue DESC
    )
    INTO v_revenue_breakdown
    FROM (
        SELECT
            COALESCE(c.name, 'Uncategorized') as category_name,
            SUM(si.total) as revenue,
            SUM(si.quantity * i.cost) as cost,
            SUM(si.total - (si.quantity * i.cost)) as profit,
            ROUND((SUM(si.total - (si.quantity * i.cost)) / NULLIF(SUM(si.total), 0) * 100)::NUMERIC, 2) as margin
        FROM public.sale_items si
        JOIN public.sales s ON si.sale_id = s.id
        JOIN public.items i ON si.item_id = i.id
        LEFT JOIN public.categories c ON i.category_id = c.id
        WHERE s.business_id = p_business_id
            AND s.status = 'COMPLETED'
            AND s.created_at::DATE >= v_start_date
            AND s.created_at::DATE <= v_end_date
        GROUP BY c.name
    ) cat;

    -- Expense breakdown by category
    SELECT jsonb_agg(
        jsonb_build_object(
            'category', category,
            'amount', amount,
            'percentage', percentage
        ) ORDER BY amount DESC
    )
    INTO v_expense_breakdown
    FROM (
        SELECT
            category,
            SUM(amount) as amount,
            ROUND((SUM(amount) / NULLIF(v_total_expenses, 0) * 100)::NUMERIC, 2) as percentage
        FROM public.expenses
        WHERE business_id = p_business_id
            AND date >= v_start_date
            AND date <= v_end_date
        GROUP BY category
    ) exp;

    RETURN jsonb_build_object(
        'period', jsonb_build_object(
            'start_date', v_start_date,
            'end_date', v_end_date
        ),
        'summary', jsonb_build_object(
            'total_revenue', ROUND(v_total_revenue, 2),
            'total_cost', ROUND(v_total_cost, 2),
            'gross_profit', ROUND(v_gross_profit, 2),
            'total_expenses', ROUND(v_total_expenses, 2),
            'net_profit', ROUND(v_net_profit, 2),
            'gross_margin', ROUND(v_gross_margin, 2),
            'net_margin', ROUND(v_net_margin, 2)
        ),
        'revenue_by_category', COALESCE(v_revenue_breakdown, '[]'::jsonb),
        'expenses_by_category', COALESCE(v_expense_breakdown, '[]'::jsonb)
    );
END;
$$;

COMMENT ON FUNCTION public.get_profit_loss_statement IS 'Generate comprehensive Profit & Loss statement with category breakdown';

-- =====================================================
-- 2. FUNCTION: get_hourly_sales_pattern()
-- Identify peak sales hours
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_hourly_sales_pattern(
    p_business_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    hour INTEGER,
    sales_count BIGINT,
    total_revenue NUMERIC,
    avg_sale_value NUMERIC,
    peak_hour BOOLEAN
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_max_revenue NUMERIC;
BEGIN
    -- Find peak revenue hour
    SELECT MAX(hourly_revenue) INTO v_max_revenue
    FROM (
        SELECT
            EXTRACT(HOUR FROM created_at) as hr,
            SUM(total) as hourly_revenue
        FROM public.sales
        WHERE business_id = p_business_id
            AND status = 'COMPLETED'
            AND (p_start_date IS NULL OR created_at::DATE >= p_start_date)
            AND (p_end_date IS NULL OR created_at::DATE <= p_end_date)
        GROUP BY EXTRACT(HOUR FROM created_at)
    ) h;

    RETURN QUERY
    SELECT
        EXTRACT(HOUR FROM s.created_at)::INTEGER as hour,
        COUNT(*) as sales_count,
        ROUND(SUM(s.total), 2) as total_revenue,
        ROUND(AVG(s.total), 2) as avg_sale_value,
        (SUM(s.total) = v_max_revenue) as peak_hour
    FROM public.sales s
    WHERE s.business_id = p_business_id
        AND s.status = 'COMPLETED'
        AND (p_start_date IS NULL OR s.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR s.created_at::DATE <= p_end_date)
    GROUP BY EXTRACT(HOUR FROM s.created_at)
    ORDER BY hour;
END;
$$;

COMMENT ON FUNCTION public.get_hourly_sales_pattern IS 'Analyze sales patterns by hour to identify peak business hours';

-- =====================================================
-- 3. FUNCTION: get_daily_sales_report()
-- Detailed daily sales breakdown
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_daily_sales_report(
    p_business_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_total_sales NUMERIC;
    v_sales_count INTEGER;
    v_avg_sale NUMERIC;
    v_total_discount NUMERIC;
    v_total_tax NUMERIC;
    v_by_payment JSONB;
    v_by_hour JSONB;
    v_top_items JSONB;
    v_by_staff JSONB;
BEGIN
    -- Summary statistics
    SELECT
        COALESCE(SUM(total), 0),
        COUNT(*),
        COALESCE(AVG(total), 0),
        COALESCE(SUM(discount), 0),
        COALESCE(SUM(tax), 0)
    INTO v_total_sales, v_sales_count, v_avg_sale, v_total_discount, v_total_tax
    FROM public.sales
    WHERE business_id = p_business_id
        AND status = 'COMPLETED'
        AND created_at::DATE = p_date;

    -- Sales by payment method
    SELECT jsonb_agg(
        jsonb_build_object(
            'method', method,
            'count', count,
            'total', total
        ) ORDER BY total DESC
    )
    INTO v_by_payment
    FROM (
        SELECT
            p.method::TEXT,
            COUNT(DISTINCT s.id) as count,
            SUM(p.amount) as total
        FROM public.sales s
        JOIN public.payments p ON s.id = p.sale_id
        WHERE s.business_id = p_business_id
            AND s.status = 'COMPLETED'
            AND s.created_at::DATE = p_date
        GROUP BY p.method
    ) pm;

    -- Sales by hour
    SELECT jsonb_agg(
        jsonb_build_object(
            'hour', hour,
            'count', count,
            'total', total
        ) ORDER BY hour
    )
    INTO v_by_hour
    FROM (
        SELECT
            EXTRACT(HOUR FROM created_at)::INTEGER as hour,
            COUNT(*) as count,
            SUM(total) as total
        FROM public.sales
        WHERE business_id = p_business_id
            AND status = 'COMPLETED'
            AND created_at::DATE = p_date
        GROUP BY EXTRACT(HOUR FROM created_at)
    ) h;

    -- Top selling items
    SELECT jsonb_agg(
        jsonb_build_object(
            'item_name', item_name,
            'quantity', quantity,
            'revenue', revenue
        ) ORDER BY revenue DESC
    )
    INTO v_top_items
    FROM (
        SELECT
            si.name as item_name,
            SUM(si.quantity) as quantity,
            SUM(si.total) as revenue
        FROM public.sale_items si
        JOIN public.sales s ON si.sale_id = s.id
        WHERE s.business_id = p_business_id
            AND s.status = 'COMPLETED'
            AND s.created_at::DATE = p_date
        GROUP BY si.name
        ORDER BY revenue DESC
        LIMIT 10
    ) items;

    -- Sales by staff member
    SELECT jsonb_agg(
        jsonb_build_object(
            'staff_name', staff_name,
            'sales_count', sales_count,
            'total_revenue', total_revenue
        ) ORDER BY total_revenue DESC
    )
    INTO v_by_staff
    FROM (
        SELECT
            pr.full_name as staff_name,
            COUNT(*) as sales_count,
            SUM(s.total) as total_revenue
        FROM public.sales s
        JOIN public.profiles pr ON s.user_id = pr.id
        WHERE s.business_id = p_business_id
            AND s.status = 'COMPLETED'
            AND s.created_at::DATE = p_date
        GROUP BY pr.full_name
    ) st;

    RETURN jsonb_build_object(
        'date', p_date,
        'summary', jsonb_build_object(
            'total_sales', ROUND(v_total_sales, 2),
            'sales_count', v_sales_count,
            'avg_sale', ROUND(v_avg_sale, 2),
            'total_discount', ROUND(v_total_discount, 2),
            'total_tax', ROUND(v_total_tax, 2)
        ),
        'by_payment_method', COALESCE(v_by_payment, '[]'::jsonb),
        'by_hour', COALESCE(v_by_hour, '[]'::jsonb),
        'top_items', COALESCE(v_top_items, '[]'::jsonb),
        'by_staff', COALESCE(v_by_staff, '[]'::jsonb)
    );
END;
$$;

COMMENT ON FUNCTION public.get_daily_sales_report IS 'Comprehensive daily sales report with multiple breakdowns';

-- =====================================================
-- 4. FUNCTION: get_dead_stock_report()
-- Identify items not sold in specified days
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_dead_stock_report(
    p_business_id UUID,
    p_days_threshold INTEGER DEFAULT 90
)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    category_name TEXT,
    stock INTEGER,
    stock_value NUMERIC,
    days_since_last_sale INTEGER,
    last_sale_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id as item_id,
        i.name as item_name,
        c.name as category_name,
        i.stock,
        (i.stock * i.cost) as stock_value,
        EXTRACT(DAY FROM (CURRENT_TIMESTAMP - COALESCE(last_sale.sale_date, i.created_at)))::INTEGER as days_since_last_sale,
        last_sale.sale_date as last_sale_date
    FROM public.items i
    LEFT JOIN public.categories c ON i.category_id = c.id
    LEFT JOIN LATERAL (
        SELECT MAX(s.created_at) as sale_date
        FROM public.sale_items si
        JOIN public.sales s ON si.sale_id = s.id
        WHERE si.item_id = i.id
            AND s.status = 'COMPLETED'
    ) last_sale ON true
    WHERE i.business_id = p_business_id
        AND i.is_active = TRUE
        AND i.stock > 0
        AND EXTRACT(DAY FROM (CURRENT_TIMESTAMP - COALESCE(last_sale.sale_date, i.created_at))) > p_days_threshold
    ORDER BY days_since_last_sale DESC;
END;
$$;

COMMENT ON FUNCTION public.get_dead_stock_report IS 'Identify slow-moving or dead stock items';

-- =====================================================
-- 5. FUNCTION: get_gst_report()
-- GST tax report for filing
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_gst_report(
    p_business_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_total_sales NUMERIC;
    v_total_cgst NUMERIC;
    v_total_sgst NUMERIC;
    v_total_igst NUMERIC;
    v_total_cess NUMERIC;
    v_by_gst_rate JSONB;
    v_b2b_sales JSONB;
    v_b2c_sales JSONB;
BEGIN
    -- Summary totals
    SELECT
        COALESCE(SUM(total), 0),
        COALESCE(SUM(cgst_amount), 0),
        COALESCE(SUM(sgst_amount), 0),
        COALESCE(SUM(igst_amount), 0),
        COALESCE(SUM(cess_amount), 0)
    INTO v_total_sales, v_total_cgst, v_total_sgst, v_total_igst, v_total_cess
    FROM public.sales
    WHERE business_id = p_business_id
        AND status = 'COMPLETED'
        AND created_at::DATE >= p_start_date
        AND created_at::DATE <= p_end_date;

    -- Sales by GST rate
    SELECT jsonb_agg(
        jsonb_build_object(
            'gst_rate', gst_rate,
            'taxable_value', taxable_value,
            'cgst', cgst,
            'sgst', sgst,
            'igst', igst,
            'total_tax', total_tax
        ) ORDER BY gst_rate
    )
    INTO v_by_gst_rate
    FROM (
        SELECT
            i.gst_rate,
            SUM(si.total - si.tax) as taxable_value,
            SUM(CASE WHEN s.cgst_amount > 0 THEN si.tax / 2 ELSE 0 END) as cgst,
            SUM(CASE WHEN s.sgst_amount > 0 THEN si.tax / 2 ELSE 0 END) as sgst,
            SUM(CASE WHEN s.igst_amount > 0 THEN si.tax ELSE 0 END) as igst,
            SUM(si.tax) as total_tax
        FROM public.sale_items si
        JOIN public.sales s ON si.sale_id = s.id
        JOIN public.items i ON si.item_id = i.id
        WHERE s.business_id = p_business_id
            AND s.status = 'COMPLETED'
            AND s.created_at::DATE >= p_start_date
            AND s.created_at::DATE <= p_end_date
        GROUP BY i.gst_rate
    ) rates;

    -- B2B sales summary
    SELECT jsonb_build_object(
        'count', COUNT(*),
        'taxable_value', SUM(total - (cgst_amount + sgst_amount + igst_amount)),
        'total_tax', SUM(cgst_amount + sgst_amount + igst_amount),
        'total_value', SUM(total)
    )
    INTO v_b2b_sales
    FROM public.sales
    WHERE business_id = p_business_id
        AND status = 'COMPLETED'
        AND invoice_type = 'B2B'
        AND created_at::DATE >= p_start_date
        AND created_at::DATE <= p_end_date;

    -- B2C sales summary
    SELECT jsonb_build_object(
        'count', COUNT(*),
        'taxable_value', SUM(total - (cgst_amount + sgst_amount + igst_amount)),
        'total_tax', SUM(cgst_amount + sgst_amount + igst_amount),
        'total_value', SUM(total)
    )
    INTO v_b2c_sales
    FROM public.sales
    WHERE business_id = p_business_id
        AND status = 'COMPLETED'
        AND invoice_type = 'B2C'
        AND created_at::DATE >= p_start_date
        AND created_at::DATE <= p_end_date;

    RETURN jsonb_build_object(
        'period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'summary', jsonb_build_object(
            'total_sales', ROUND(v_total_sales, 2),
            'total_cgst', ROUND(v_total_cgst, 2),
            'total_sgst', ROUND(v_total_sgst, 2),
            'total_igst', ROUND(v_total_igst, 2),
            'total_cess', ROUND(v_total_cess, 2),
            'total_tax', ROUND(v_total_cgst + v_total_sgst + v_total_igst + v_total_cess, 2)
        ),
        'by_gst_rate', COALESCE(v_by_gst_rate, '[]'::jsonb),
        'b2b_sales', v_b2b_sales,
        'b2c_sales', v_b2c_sales
    );
END;
$$;

COMMENT ON FUNCTION public.get_gst_report IS 'Generate GST tax report for filing returns';

-- =====================================================
-- 6. FUNCTION: get_cash_flow_statement()
-- Cash flow analysis
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_cash_flow_statement(
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
    v_cash_sales NUMERIC;
    v_card_sales NUMERIC;
    v_upi_sales NUMERIC;
    v_wallet_sales NUMERIC;
    v_total_inflow NUMERIC;
    v_cash_expenses NUMERIC;
    v_card_expenses NUMERIC;
    v_other_expenses NUMERIC;
    v_total_outflow NUMERIC;
    v_net_cash_flow NUMERIC;
BEGIN
    v_start_date := COALESCE(p_start_date, DATE_TRUNC('month', CURRENT_DATE)::DATE);
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);

    -- Cash inflows by payment method
    SELECT
        COALESCE(SUM(CASE WHEN method = 'CASH' THEN amount END), 0),
        COALESCE(SUM(CASE WHEN method = 'CARD' THEN amount END), 0),
        COALESCE(SUM(CASE WHEN method = 'UPI' THEN amount END), 0),
        COALESCE(SUM(CASE WHEN method = 'WALLET' THEN amount END), 0)
    INTO v_cash_sales, v_card_sales, v_upi_sales, v_wallet_sales
    FROM public.payments p
    JOIN public.sales s ON p.sale_id = s.id
    WHERE s.business_id = p_business_id
        AND s.status = 'COMPLETED'
        AND s.created_at::DATE >= v_start_date
        AND s.created_at::DATE <= v_end_date;

    v_total_inflow := v_cash_sales + v_card_sales + v_upi_sales + v_wallet_sales;

    -- Cash outflows by payment method
    SELECT
        COALESCE(SUM(CASE WHEN payment_method = 'CASH' THEN amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method IN ('CARD', 'BANK_TRANSFER') THEN amount END), 0),
        COALESCE(SUM(CASE WHEN payment_method NOT IN ('CASH', 'CARD', 'BANK_TRANSFER') THEN amount END), 0)
    INTO v_cash_expenses, v_card_expenses, v_other_expenses
    FROM public.expenses
    WHERE business_id = p_business_id
        AND date >= v_start_date
        AND date <= v_end_date;

    v_total_outflow := v_cash_expenses + v_card_expenses + v_other_expenses;
    v_net_cash_flow := v_total_inflow - v_total_outflow;

    RETURN jsonb_build_object(
        'period', jsonb_build_object(
            'start_date', v_start_date,
            'end_date', v_end_date
        ),
        'inflows', jsonb_build_object(
            'cash_sales', ROUND(v_cash_sales, 2),
            'card_sales', ROUND(v_card_sales, 2),
            'upi_sales', ROUND(v_upi_sales, 2),
            'wallet_sales', ROUND(v_wallet_sales, 2),
            'total_inflow', ROUND(v_total_inflow, 2)
        ),
        'outflows', jsonb_build_object(
            'cash_expenses', ROUND(v_cash_expenses, 2),
            'card_expenses', ROUND(v_card_expenses, 2),
            'other_expenses', ROUND(v_other_expenses, 2),
            'total_outflow', ROUND(v_total_outflow, 2)
        ),
        'summary', jsonb_build_object(
            'net_cash_flow', ROUND(v_net_cash_flow, 2),
            'opening_balance', 0,
            'closing_balance', ROUND(v_net_cash_flow, 2)
        )
    );
END;
$$;

COMMENT ON FUNCTION public.get_cash_flow_statement IS 'Generate cash flow statement with inflows and outflows';

-- =====================================================
-- 7. FUNCTION: get_business_dashboard()
-- Complete business dashboard KPIs
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_business_dashboard(
    p_business_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_today_sales NUMERIC;
    v_yesterday_sales NUMERIC;
    v_month_sales NUMERIC;
    v_today_count INTEGER;
    v_pending_approvals INTEGER;
    v_low_stock_count INTEGER;
    v_expiring_soon_count INTEGER;
    v_credit_outstanding NUMERIC;
    v_top_item TEXT;
    v_peak_hour INTEGER;
BEGIN
    -- Today's sales
    SELECT COALESCE(SUM(total), 0), COUNT(*)
    INTO v_today_sales, v_today_count
    FROM public.sales
    WHERE business_id = p_business_id
        AND status = 'COMPLETED'
        AND created_at::DATE = p_date;

    -- Yesterday's sales
    SELECT COALESCE(SUM(total), 0)
    INTO v_yesterday_sales
    FROM public.sales
    WHERE business_id = p_business_id
        AND status = 'COMPLETED'
        AND created_at::DATE = p_date - INTERVAL '1 day';

    -- Month to date sales
    SELECT COALESCE(SUM(total), 0)
    INTO v_month_sales
    FROM public.sales
    WHERE business_id = p_business_id
        AND status = 'COMPLETED'
        AND created_at >= DATE_TRUNC('month', p_date::TIMESTAMPTZ);

    -- Pending expense approvals
    SELECT COUNT(*)
    INTO v_pending_approvals
    FROM public.expenses
    WHERE business_id = p_business_id
        AND approved_by IS NULL;

    -- Low stock items
    SELECT COUNT(*)
    INTO v_low_stock_count
    FROM public.items
    WHERE business_id = p_business_id
        AND is_active = TRUE
        AND stock <= min_stock;

    -- Expiring soon items
    SELECT COUNT(*)
    INTO v_expiring_soon_count
    FROM public.items
    WHERE business_id = p_business_id
        AND is_active = TRUE
        AND expiry_date IS NOT NULL
        AND expiry_date <= p_date + INTERVAL '7 days';

    -- Credit outstanding
    SELECT COALESCE(SUM(credit_balance), 0)
    INTO v_credit_outstanding
    FROM public.customers
    WHERE business_id = p_business_id
        AND credit_balance > 0;

    -- Top selling item today
    SELECT si.name
    INTO v_top_item
    FROM public.sale_items si
    JOIN public.sales s ON si.sale_id = s.id
    WHERE s.business_id = p_business_id
        AND s.status = 'COMPLETED'
        AND s.created_at::DATE = p_date
    GROUP BY si.name
    ORDER BY SUM(si.quantity) DESC
    LIMIT 1;

    -- Peak hour today
    SELECT EXTRACT(HOUR FROM created_at)::INTEGER
    INTO v_peak_hour
    FROM public.sales
    WHERE business_id = p_business_id
        AND status = 'COMPLETED'
        AND created_at::DATE = p_date
    GROUP BY EXTRACT(HOUR FROM created_at)
    ORDER BY SUM(total) DESC
    LIMIT 1;

    RETURN jsonb_build_object(
        'date', p_date,
        'sales', jsonb_build_object(
            'today_sales', ROUND(v_today_sales, 2),
            'today_count', v_today_count,
            'yesterday_sales', ROUND(v_yesterday_sales, 2),
            'change_from_yesterday', ROUND(v_today_sales - v_yesterday_sales, 2),
            'month_to_date', ROUND(v_month_sales, 2),
            'avg_sale_value', ROUND(CASE WHEN v_today_count > 0 THEN v_today_sales / v_today_count ELSE 0 END, 2)
        ),
        'alerts', jsonb_build_object(
            'pending_approvals', v_pending_approvals,
            'low_stock_items', v_low_stock_count,
            'expiring_soon', v_expiring_soon_count,
            'credit_outstanding', ROUND(v_credit_outstanding, 2)
        ),
        'insights', jsonb_build_object(
            'top_item_today', COALESCE(v_top_item, 'No sales'),
            'peak_hour', COALESCE(v_peak_hour, 0)
        )
    );
END;
$$;

COMMENT ON FUNCTION public.get_business_dashboard IS 'Get comprehensive business dashboard with KPIs and alerts';

-- =====================================================
-- 8. FUNCTION: get_comparative_sales_report()
-- Compare sales across different time periods
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_comparative_sales_report(
    p_business_id UUID,
    p_current_start DATE,
    p_current_end DATE,
    p_previous_start DATE,
    p_previous_end DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
DECLARE
    v_current_sales NUMERIC;
    v_current_count INTEGER;
    v_previous_sales NUMERIC;
    v_previous_count INTEGER;
    v_growth_amount NUMERIC;
    v_growth_percent NUMERIC;
BEGIN
    -- Current period
    SELECT COALESCE(SUM(total), 0), COUNT(*)
    INTO v_current_sales, v_current_count
    FROM public.sales
    WHERE business_id = p_business_id
        AND status = 'COMPLETED'
        AND created_at::DATE >= p_current_start
        AND created_at::DATE <= p_current_end;

    -- Previous period
    SELECT COALESCE(SUM(total), 0), COUNT(*)
    INTO v_previous_sales, v_previous_count
    FROM public.sales
    WHERE business_id = p_business_id
        AND status = 'COMPLETED'
        AND created_at::DATE >= p_previous_start
        AND created_at::DATE <= p_previous_end;

    -- Calculate growth
    v_growth_amount := v_current_sales - v_previous_sales;
    v_growth_percent := CASE
        WHEN v_previous_sales > 0
        THEN (v_growth_amount / v_previous_sales * 100)
        ELSE 0
    END;

    RETURN jsonb_build_object(
        'current_period', jsonb_build_object(
            'start_date', p_current_start,
            'end_date', p_current_end,
            'total_sales', ROUND(v_current_sales, 2),
            'sales_count', v_current_count,
            'avg_sale', ROUND(CASE WHEN v_current_count > 0 THEN v_current_sales / v_current_count ELSE 0 END, 2)
        ),
        'previous_period', jsonb_build_object(
            'start_date', p_previous_start,
            'end_date', p_previous_end,
            'total_sales', ROUND(v_previous_sales, 2),
            'sales_count', v_previous_count,
            'avg_sale', ROUND(CASE WHEN v_previous_count > 0 THEN v_previous_sales / v_previous_count ELSE 0 END, 2)
        ),
        'comparison', jsonb_build_object(
            'growth_amount', ROUND(v_growth_amount, 2),
            'growth_percent', ROUND(v_growth_percent, 2),
            'is_growth', v_growth_amount > 0
        )
    );
END;
$$;

COMMENT ON FUNCTION public.get_comparative_sales_report IS 'Compare sales performance across two time periods';

-- =====================================================
-- 9. PERFORMANCE INDEXES
-- =====================================================

-- Index for date-based queries (daily reports)
CREATE INDEX IF NOT EXISTS idx_sales_created_at_date
    ON public.sales(business_id, created_at)
    WHERE status = 'COMPLETED';

COMMENT ON INDEX idx_sales_created_at_date IS 'Optimize daily and hourly sales report queries';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
