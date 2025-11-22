-- =============================================
-- Modifiers Management Module - Complete Implementation
-- Migration: 011_modifiers_management_module
-- =============================================
-- This migration creates comprehensive modifiers management functions
-- for the POS system including modifier groups, options, and item associations.
-- Critical for restaurants with product customization (size, toppings, add-ons).

-- =============================================
-- 1. GET BUSINESS MODIFIERS
-- =============================================
-- Retrieves all modifier groups with their options
CREATE OR REPLACE FUNCTION public.get_business_modifiers(
    p_business_id UUID,
    p_is_active BOOLEAN DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    display_name TEXT,
    selection_type TEXT,
    is_required BOOLEAN,
    min_selections INTEGER,
    max_selections INTEGER,
    display_order INTEGER,
    is_active BOOLEAN,
    options_count BIGINT,
    items_using_count BIGINT,
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
        m.id,
        m.name::TEXT,
        m.display_name::TEXT,
        m.selection_type::TEXT,
        m.is_required,
        m.min_selections,
        m.max_selections,
        m.display_order,
        m.is_active,
        COUNT(DISTINCT mo.id)::BIGINT as options_count,
        COUNT(DISTINCT im.item_id)::BIGINT as items_using_count,
        m.created_at,
        m.updated_at
    FROM public.modifiers m
    LEFT JOIN public.modifier_options mo ON m.id = mo.modifier_id
    LEFT JOIN public.item_modifiers im ON m.id = im.modifier_id
    WHERE m.business_id = p_business_id
        AND (p_is_active IS NULL OR m.is_active = p_is_active)
        AND (
            p_search_term IS NULL OR
            m.name ILIKE '%' || p_search_term || '%' OR
            m.display_name ILIKE '%' || p_search_term || '%'
        )
    GROUP BY m.id, m.name, m.display_name, m.selection_type, m.is_required,
             m.min_selections, m.max_selections, m.display_order, m.is_active,
             m.created_at, m.updated_at
    ORDER BY m.display_order, m.name;
END;
$$;

-- =============================================
-- 2. GET MODIFIER WITH OPTIONS
-- =============================================
-- Gets complete modifier details with all options
CREATE OR REPLACE FUNCTION public.get_modifier_with_options(
    p_business_id UUID,
    p_modifier_id UUID
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
        'id', m.id,
        'name', m.name,
        'display_name', m.display_name,
        'selection_type', m.selection_type,
        'is_required', m.is_required,
        'min_selections', m.min_selections,
        'max_selections', m.max_selections,
        'display_order', m.display_order,
        'is_active', m.is_active,
        'created_at', m.created_at,
        'updated_at', m.updated_at,
        'options', COALESCE(
            (
                SELECT JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', mo.id,
                        'name', mo.name,
                        'price_adjustment', mo.price_adjustment,
                        'display_order', mo.display_order,
                        'is_default', mo.is_default,
                        'is_active', mo.is_active
                    ) ORDER BY mo.display_order, mo.name
                )
                FROM public.modifier_options mo
                WHERE mo.modifier_id = m.id
            ),
            '[]'::JSONB
        )
    ) INTO v_result
    FROM public.modifiers m
    WHERE m.id = p_modifier_id AND m.business_id = p_business_id;

    RETURN v_result;
END;
$$;

-- =============================================
-- 3. GET ITEM MODIFIERS
-- =============================================
-- Gets all modifiers assigned to a specific item
CREATE OR REPLACE FUNCTION public.get_item_modifiers(
    p_business_id UUID,
    p_item_id UUID
)
RETURNS TABLE (
    modifier_id UUID,
    modifier_name TEXT,
    display_name TEXT,
    selection_type TEXT,
    is_required BOOLEAN,
    min_selections INTEGER,
    max_selections INTEGER,
    display_order INTEGER,
    options JSONB
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id as modifier_id,
        m.name::TEXT as modifier_name,
        m.display_name::TEXT,
        m.selection_type::TEXT,
        COALESCE(im.is_required, m.is_required) as is_required,
        m.min_selections,
        m.max_selections,
        COALESCE(im.display_order, m.display_order) as display_order,
        COALESCE(
            (
                SELECT JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', mo.id,
                        'name', mo.name,
                        'price_adjustment', mo.price_adjustment,
                        'display_order', mo.display_order,
                        'is_default', mo.is_default,
                        'is_active', mo.is_active
                    ) ORDER BY mo.display_order, mo.name
                )
                FROM public.modifier_options mo
                WHERE mo.modifier_id = m.id AND mo.is_active = TRUE
            ),
            '[]'::JSONB
        ) as options
    FROM public.item_modifiers im
    INNER JOIN public.modifiers m ON im.modifier_id = m.id
    INNER JOIN public.items i ON im.item_id = i.id
    WHERE i.id = p_item_id
        AND i.business_id = p_business_id
        AND m.is_active = TRUE
    ORDER BY display_order, m.name;
END;
$$;

-- =============================================
-- 4. CREATE MODIFIER
-- =============================================
-- Creates a new modifier group with validation
CREATE OR REPLACE FUNCTION public.create_modifier(
    p_business_id UUID,
    p_name TEXT,
    p_display_name TEXT DEFAULT NULL,
    p_selection_type TEXT DEFAULT 'single',
    p_is_required BOOLEAN DEFAULT FALSE,
    p_min_selections INTEGER DEFAULT 0,
    p_max_selections INTEGER DEFAULT NULL,
    p_display_order INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_modifier_id UUID;
    v_final_display_order INTEGER;
BEGIN
    -- Validate modifier name
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Modifier name cannot be empty';
    END IF;

    -- Validate selection type
    IF p_selection_type NOT IN ('single', 'multiple') THEN
        RAISE EXCEPTION 'Selection type must be "single" or "multiple"';
    END IF;

    -- Check for duplicate name
    IF EXISTS (
        SELECT 1 FROM public.modifiers
        WHERE business_id = p_business_id AND name = TRIM(p_name)
    ) THEN
        RAISE EXCEPTION 'Modifier "%" already exists', TRIM(p_name);
    END IF;

    -- Determine display order
    IF p_display_order IS NULL THEN
        SELECT COALESCE(MAX(display_order), 0) + 1 INTO v_final_display_order
        FROM public.modifiers
        WHERE business_id = p_business_id;
    ELSE
        v_final_display_order := p_display_order;
    END IF;

    -- Insert modifier
    INSERT INTO public.modifiers (
        business_id,
        name,
        display_name,
        selection_type,
        is_required,
        min_selections,
        max_selections,
        display_order
    ) VALUES (
        p_business_id,
        TRIM(p_name),
        p_display_name,
        p_selection_type,
        p_is_required,
        p_min_selections,
        p_max_selections,
        v_final_display_order
    )
    RETURNING id INTO v_modifier_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'modifier_id', v_modifier_id,
        'name', TRIM(p_name),
        'display_order', v_final_display_order,
        'created_at', NOW()
    );
END;
$$;

-- =============================================
-- 5. CREATE MODIFIER OPTION
-- =============================================
-- Adds an option to a modifier group
CREATE OR REPLACE FUNCTION public.create_modifier_option(
    p_business_id UUID,
    p_modifier_id UUID,
    p_name TEXT,
    p_price_adjustment NUMERIC DEFAULT 0,
    p_is_default BOOLEAN DEFAULT FALSE,
    p_display_order INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_option_id UUID;
    v_final_display_order INTEGER;
BEGIN
    -- Validate option name
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RAISE EXCEPTION 'Option name cannot be empty';
    END IF;

    -- Validate modifier exists and belongs to business
    IF NOT EXISTS (
        SELECT 1 FROM public.modifiers
        WHERE id = p_modifier_id AND business_id = p_business_id
    ) THEN
        RAISE EXCEPTION 'Modifier not found';
    END IF;

    -- Check for duplicate option name in same modifier
    IF EXISTS (
        SELECT 1 FROM public.modifier_options
        WHERE modifier_id = p_modifier_id AND name = TRIM(p_name)
    ) THEN
        RAISE EXCEPTION 'Option "%" already exists in this modifier', TRIM(p_name);
    END IF;

    -- Determine display order
    IF p_display_order IS NULL THEN
        SELECT COALESCE(MAX(display_order), 0) + 1 INTO v_final_display_order
        FROM public.modifier_options
        WHERE modifier_id = p_modifier_id;
    ELSE
        v_final_display_order := p_display_order;
    END IF;

    -- If this is set as default, unset other defaults
    IF p_is_default = TRUE THEN
        UPDATE public.modifier_options
        SET is_default = FALSE
        WHERE modifier_id = p_modifier_id;
    END IF;

    -- Insert option
    INSERT INTO public.modifier_options (
        modifier_id,
        name,
        price_adjustment,
        is_default,
        display_order
    ) VALUES (
        p_modifier_id,
        TRIM(p_name),
        p_price_adjustment,
        p_is_default,
        v_final_display_order
    )
    RETURNING id INTO v_option_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'option_id', v_option_id,
        'modifier_id', p_modifier_id,
        'name', TRIM(p_name),
        'price_adjustment', p_price_adjustment,
        'is_default', p_is_default,
        'display_order', v_final_display_order,
        'created_at', NOW()
    );
END;
$$;

-- =============================================
-- 6. ASSIGN MODIFIERS TO ITEM
-- =============================================
-- Assigns multiple modifiers to an item
CREATE OR REPLACE FUNCTION public.assign_modifiers_to_item(
    p_business_id UUID,
    p_item_id UUID,
    p_modifiers JSONB  -- Array of {modifier_id: UUID, is_required: BOOLEAN, display_order: INTEGER}
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_modifier JSONB;
    v_assigned_count INTEGER := 0;
BEGIN
    -- Validate item exists and belongs to business
    IF NOT EXISTS (
        SELECT 1 FROM public.items
        WHERE id = p_item_id AND business_id = p_business_id
    ) THEN
        RAISE EXCEPTION 'Item not found';
    END IF;

    -- Validate input
    IF p_modifiers IS NULL OR JSONB_ARRAY_LENGTH(p_modifiers) = 0 THEN
        RAISE EXCEPTION 'Modifiers array cannot be empty';
    END IF;

    -- Remove existing associations
    DELETE FROM public.item_modifiers WHERE item_id = p_item_id;

    -- Insert new associations
    FOR v_modifier IN SELECT * FROM JSONB_ARRAY_ELEMENTS(p_modifiers)
    LOOP
        -- Validate modifier exists and belongs to business
        IF NOT EXISTS (
            SELECT 1 FROM public.modifiers
            WHERE id = (v_modifier->>'modifier_id')::UUID
                AND business_id = p_business_id
        ) THEN
            RAISE EXCEPTION 'Modifier % not found', v_modifier->>'modifier_id';
        END IF;

        INSERT INTO public.item_modifiers (
            item_id,
            modifier_id,
            is_required,
            display_order
        ) VALUES (
            p_item_id,
            (v_modifier->>'modifier_id')::UUID,
            COALESCE((v_modifier->>'is_required')::BOOLEAN, FALSE),
            COALESCE((v_modifier->>'display_order')::INTEGER, v_assigned_count)
        );

        v_assigned_count := v_assigned_count + 1;
    END LOOP;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'item_id', p_item_id,
        'modifiers_assigned', v_assigned_count,
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 7. UPDATE MODIFIER
-- =============================================
-- Updates an existing modifier group
CREATE OR REPLACE FUNCTION public.update_modifier(
    p_business_id UUID,
    p_modifier_id UUID,
    p_name TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_selection_type TEXT DEFAULT NULL,
    p_is_required BOOLEAN DEFAULT NULL,
    p_min_selections INTEGER DEFAULT NULL,
    p_max_selections INTEGER DEFAULT NULL,
    p_display_order INTEGER DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_old_name TEXT;
BEGIN
    -- Get current modifier info
    SELECT name INTO v_old_name
    FROM public.modifiers
    WHERE id = p_modifier_id AND business_id = p_business_id;

    IF v_old_name IS NULL THEN
        RAISE EXCEPTION 'Modifier not found';
    END IF;

    -- Check for duplicate name if changing name
    IF p_name IS NOT NULL AND TRIM(p_name) != v_old_name THEN
        IF EXISTS (
            SELECT 1 FROM public.modifiers
            WHERE business_id = p_business_id
                AND name = TRIM(p_name)
                AND id != p_modifier_id
        ) THEN
            RAISE EXCEPTION 'Modifier "%" already exists', TRIM(p_name);
        END IF;
    END IF;

    -- Validate selection type if provided
    IF p_selection_type IS NOT NULL AND p_selection_type NOT IN ('single', 'multiple') THEN
        RAISE EXCEPTION 'Selection type must be "single" or "multiple"';
    END IF;

    -- Update modifier
    UPDATE public.modifiers
    SET
        name = COALESCE(TRIM(p_name), name),
        display_name = COALESCE(p_display_name, display_name),
        selection_type = COALESCE(p_selection_type, selection_type),
        is_required = COALESCE(p_is_required, is_required),
        min_selections = COALESCE(p_min_selections, min_selections),
        max_selections = COALESCE(p_max_selections, max_selections),
        display_order = COALESCE(p_display_order, display_order),
        is_active = COALESCE(p_is_active, is_active),
        updated_at = NOW()
    WHERE id = p_modifier_id AND business_id = p_business_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'modifier_id', p_modifier_id,
        'old_name', v_old_name,
        'new_name', COALESCE(TRIM(p_name), v_old_name),
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 8. UPDATE MODIFIER OPTION
-- =============================================
-- Updates an existing modifier option
CREATE OR REPLACE FUNCTION public.update_modifier_option(
    p_business_id UUID,
    p_option_id UUID,
    p_name TEXT DEFAULT NULL,
    p_price_adjustment NUMERIC DEFAULT NULL,
    p_is_default BOOLEAN DEFAULT NULL,
    p_display_order INTEGER DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_modifier_id UUID;
    v_old_name TEXT;
BEGIN
    -- Get current option info and verify business ownership
    SELECT mo.name, mo.modifier_id INTO v_old_name, v_modifier_id
    FROM public.modifier_options mo
    INNER JOIN public.modifiers m ON mo.modifier_id = m.id
    WHERE mo.id = p_option_id AND m.business_id = p_business_id;

    IF v_old_name IS NULL THEN
        RAISE EXCEPTION 'Modifier option not found';
    END IF;

    -- Check for duplicate name if changing name
    IF p_name IS NOT NULL AND TRIM(p_name) != v_old_name THEN
        IF EXISTS (
            SELECT 1 FROM public.modifier_options
            WHERE modifier_id = v_modifier_id
                AND name = TRIM(p_name)
                AND id != p_option_id
        ) THEN
            RAISE EXCEPTION 'Option "%" already exists in this modifier', TRIM(p_name);
        END IF;
    END IF;

    -- If setting as default, unset other defaults in same modifier
    IF p_is_default = TRUE THEN
        UPDATE public.modifier_options
        SET is_default = FALSE
        WHERE modifier_id = v_modifier_id AND id != p_option_id;
    END IF;

    -- Update option
    UPDATE public.modifier_options
    SET
        name = COALESCE(TRIM(p_name), name),
        price_adjustment = COALESCE(p_price_adjustment, price_adjustment),
        is_default = COALESCE(p_is_default, is_default),
        display_order = COALESCE(p_display_order, display_order),
        is_active = COALESCE(p_is_active, is_active),
        updated_at = NOW()
    WHERE id = p_option_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'option_id', p_option_id,
        'modifier_id', v_modifier_id,
        'old_name', v_old_name,
        'new_name', COALESCE(TRIM(p_name), v_old_name),
        'updated_at', NOW()
    );
END;
$$;

-- =============================================
-- 9. DELETE MODIFIER
-- =============================================
-- Deletes a modifier (only if not used in any items)
CREATE OR REPLACE FUNCTION public.delete_modifier(
    p_business_id UUID,
    p_modifier_id UUID,
    p_force BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_modifier_name TEXT;
    v_items_count BIGINT;
    v_options_deleted BIGINT;
BEGIN
    -- Get modifier info
    SELECT name INTO v_modifier_name
    FROM public.modifiers
    WHERE id = p_modifier_id AND business_id = p_business_id;

    IF v_modifier_name IS NULL THEN
        RAISE EXCEPTION 'Modifier not found';
    END IF;

    -- Check if modifier is used by items
    SELECT COUNT(*) INTO v_items_count
    FROM public.item_modifiers
    WHERE modifier_id = p_modifier_id;

    IF v_items_count > 0 AND p_force = FALSE THEN
        RAISE EXCEPTION 'Cannot delete modifier used by % items. Use force=true to override.', v_items_count;
    END IF;

    -- If forcing, remove item associations
    IF p_force = TRUE THEN
        DELETE FROM public.item_modifiers WHERE modifier_id = p_modifier_id;
    END IF;

    -- Delete all options
    DELETE FROM public.modifier_options
    WHERE modifier_id = p_modifier_id
    RETURNING id INTO v_options_deleted;

    GET DIAGNOSTICS v_options_deleted = ROW_COUNT;

    -- Delete modifier
    DELETE FROM public.modifiers
    WHERE id = p_modifier_id AND business_id = p_business_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'modifier_id', p_modifier_id,
        'modifier_name', v_modifier_name,
        'options_deleted', v_options_deleted,
        'items_affected', v_items_count,
        'deleted_at', NOW()
    );
END;
$$;

-- =============================================
-- 10. DELETE MODIFIER OPTION
-- =============================================
-- Deletes a modifier option
CREATE OR REPLACE FUNCTION public.delete_modifier_option(
    p_business_id UUID,
    p_option_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_option_name TEXT;
    v_modifier_id UUID;
BEGIN
    -- Get option info and verify business ownership
    SELECT mo.name, mo.modifier_id INTO v_option_name, v_modifier_id
    FROM public.modifier_options mo
    INNER JOIN public.modifiers m ON mo.modifier_id = m.id
    WHERE mo.id = p_option_id AND m.business_id = p_business_id;

    IF v_option_name IS NULL THEN
        RAISE EXCEPTION 'Modifier option not found';
    END IF;

    -- Delete option
    DELETE FROM public.modifier_options WHERE id = p_option_id;

    RETURN JSONB_BUILD_OBJECT(
        'success', TRUE,
        'option_id', p_option_id,
        'option_name', v_option_name,
        'modifier_id', v_modifier_id,
        'deleted_at', NOW()
    );
END;
$$;

-- =============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================

-- Index for modifier business queries
CREATE INDEX IF NOT EXISTS idx_modifiers_business_active
    ON public.modifiers(business_id, is_active);

-- Index for modifier options lookup
CREATE INDEX IF NOT EXISTS idx_modifier_options_modifier
    ON public.modifier_options(modifier_id, is_active);

-- Index for item modifiers lookup
CREATE INDEX IF NOT EXISTS idx_item_modifiers_item
    ON public.item_modifiers(item_id);

-- Index for item modifiers reverse lookup
CREATE INDEX IF NOT EXISTS idx_item_modifiers_modifier
    ON public.item_modifiers(modifier_id);

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_business_modifiers(UUID, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_modifier_with_options(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_item_modifiers(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_modifier(UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_modifier_option(UUID, UUID, TEXT, NUMERIC, BOOLEAN, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_modifiers_to_item(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_modifier(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_modifier_option(UUID, UUID, TEXT, NUMERIC, BOOLEAN, INTEGER, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_modifier(UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_modifier_option(UUID, UUID) TO authenticated;
