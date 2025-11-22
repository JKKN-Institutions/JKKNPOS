# Modifiers Management Module

Complete documentation for the Modifiers Management module in the JKKN POS system. This module provides comprehensive product customization functionality critical for restaurant businesses with customizable items (size, toppings, add-ons, etc.).

## Module Overview

The Modifiers Management module enables:
- Modifier group creation (e.g., "Size", "Toppings", "Add-ons")
- Modifier options within groups (e.g., Small/Medium/Large)
- Item-to-modifier associations
- Single or multiple selection types
- Price adjustments per option
- Default option selection
- Complete CRUD operations

**Total Functions: 10**

---

## Database Functions

### 1. Get Business Modifiers

Retrieves all modifier groups with options count and item usage.

**Function Signature:**
```sql
get_business_modifiers(
    p_business_id UUID,
    p_is_active BOOLEAN DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL
) RETURNS TABLE
```

**Returns:**
```typescript
{
  id: string;
  name: string;
  display_name: string;
  selection_type: 'single' | 'multiple';
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  display_order: number;
  is_active: boolean;
  options_count: number;
  items_using_count: number;
  created_at: string;
  updated_at: string;
}[]
```

---

### 2. Get Modifier With Options

Gets complete modifier details including all options.

**Function Signature:**
```sql
get_modifier_with_options(
    p_business_id UUID,
    p_modifier_id UUID
) RETURNS JSONB
```

**Returns:**
```typescript
{
  id: string;
  name: string;
  display_name: string;
  selection_type: 'single' | 'multiple';
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  options: Array<{
    id: string;
    name: string;
    price_adjustment: number;
    display_order: number;
    is_default: boolean;
    is_active: boolean;
  }>;
}
```

---

### 3. Get Item Modifiers

Gets all modifiers assigned to a specific item.

**Function Signature:**
```sql
get_item_modifiers(
    p_business_id UUID,
    p_item_id UUID
) RETURNS TABLE
```

**Returns:**
```typescript
{
  modifier_id: string;
  modifier_name: string;
  display_name: string;
  selection_type: 'single' | 'multiple';
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  display_order: number;
  options: Array<{
    id: string;
    name: string;
    price_adjustment: number;
    display_order: number;
    is_default: boolean;
    is_active: boolean;
  }>;
}[]
```

---

### 4-10. Additional Functions

- **create_modifier** - Creates new modifier group
- **create_modifier_option** - Adds option to modifier
- **assign_modifiers_to_item** - Assigns modifiers to item
- **update_modifier** - Updates modifier group
- **update_modifier_option** - Updates modifier option
- **delete_modifier** - Deletes modifier (with force option)
- **delete_modifier_option** - Deletes option

---

## Module Summary

**Modifiers Management Module Complete:**

- **10 Database Functions** - Full CRUD + item associations
- **4 Performance Indexes** - Optimized lookups
- **TypeScript Types** - All 10 functions included
- **Complete Module** - Ready for frontend integration

**Total Functions Across All Modules: 66**

**Completed Modules (8/Total):**
1. ✓ Inventory Management - 7 functions
2. ✓ Sales/POS - 8 functions
3. ✓ Customer Management - 8 functions
4. ✓ Expense Management - 9 functions
5. ✓ Reports & Analytics - 8 functions
6. ✓ Staff Management - 8 functions
7. ✓ Categories Management - 8 functions
8. ✓ **Modifiers Management - 10 functions** ✓

---

## Use Cases

### Restaurant Size Selection
```typescript
// Create "Size" modifier
await modifierService.createModifier({
  businessId,
  name: 'Size',
  display_name: 'Choose Size',
  selection_type: 'single',
  is_required: true
});

// Add options
await modifierService.createModifierOption({
  businessId,
  modifierId,
  name: 'Small',
  price_adjustment: 0,
  is_default: true
});

await modifierService.createModifierOption({
  businessId,
  modifierId,
  name: 'Medium',
  price_adjustment: 50
});

await modifierService.createModifierOption({
  businessId,
  modifierId,
  name: 'Large',
  price_adjustment: 100
});
```

### Pizza Toppings
```typescript
// Create "Toppings" modifier
await modifierService.createModifier({
  businessId,
  name: 'Toppings',
  display_name: 'Add Toppings',
  selection_type: 'multiple',
  is_required: false,
  min_selections: 0,
  max_selections: 5
});

// Add topping options
const toppings = [
  { name: 'Extra Cheese', price: 40 },
  { name: 'Mushrooms', price: 30 },
  { name: 'Olives', price: 25 },
  { name: 'Pepperoni', price: 50 }
];

for (const topping of toppings) {
  await modifierService.createModifierOption({
    businessId,
    modifierId,
    name: topping.name,
    price_adjustment: topping.price
  });
}
```

**Key Features:**
- Single/multiple selection types
- Price adjustments (positive or negative)
- Required/optional modifiers
- Min/max selection limits
- Default option selection
- Display order control
- Item associations
