# Spacing Calculator and Formula Guide

## The Critical Spacing Formula

The entire layout system is built on one mathematical formula:

```
navRightGap = fabSize + (fabGap × 2)
```

This formula ensures perfect pixel alignment between the navigation bar and FAB button.

## Why This Formula Works

The navigation bar needs to leave enough space for:
1. The FAB button width
2. The gap on the left side of the FAB
3. The gap on the right side of the FAB

Visual representation:

```
┌────────────────────────────────────────────┐
│                                       ┌────┐
│  [Nav Bar extends to here]           │FAB │
│                                       └────┘
└────────────────────────────────────────────┘
    ↑                                    ↑
  left-4                              right-4
           ↑─── navRightGap ────↑
           ↑─fabGap─↑──fabSize──↑─fabGap─↑
```

## Preset Calculations

### Compact Preset

```typescript
fabSize = 3rem (48px)
fabGap = 1rem (16px)

navRightGap = 3rem + (1rem × 2)
navRightGap = 3rem + 2rem
navRightGap = 5rem (80px)

Tailwind: right-20
```

### Standard Preset

```typescript
fabSize = 3.5rem (56px)
fabGap = 1.25rem (20px)

navRightGap = 3.5rem + (1.25rem × 2)
navRightGap = 3.5rem + 2.5rem
navRightGap = 6rem (96px)

Wait, 6rem = 96px, but we need 84px (3.5rem + 2.5rem = 6rem is wrong)

Actually:
fabSize = 3.5rem (56px = 14 × 4px)
fabGap = 1.25rem (20px = 5 × 4px)

navRightGap = 56px + (20px × 2)
navRightGap = 56px + 40px
navRightGap = 96px

But 3.5rem + 2.5rem = 6rem = 96px ✓

Hmm, let me recalculate:
- fabSize: w-14 = 3.5rem = 56px
- fabGap: right-5 = 1.25rem = 20px

navRightGap = 3.5rem + 1.25rem + 1.25rem = 6rem

But we want the nav bar to stop at: left edge of FAB - left gap
= screen edge - 20px - 56px - 20px
= screen edge - 96px

Wait, that's not right either. Let me think...

The nav bar right edge should be at:
= screen width - fabGap (right side) - fabSize - fabGap (left side)

From the screen's right edge:
- Move left by fabGap (the space to the right of FAB)
- Move left by fabSize (the FAB itself)
- This gives us where the nav bar should end

So: navRightGap = fabGap + fabSize

But we want a gap between nav and FAB, so:
navRightGap = fabSize + fabGap (for spacing between nav and FAB) + fabGap (for FAB's right margin)

Actually, the simplest way:
- FAB is positioned at right-5 (20px from right)
- FAB is w-14 (56px wide)
- We want nav to end just before FAB starts

Nav should end at: 20px (fab right) + 56px (fab width) + gap
If we want 8px gap: 20px + 56px + 8px = 84px from right

Let's use: right-[5.25rem] = 84px

Actually, let me reconsider the whole thing:
- We want nav bar to extend to just before the FAB
- FAB is at right-5 (1.25rem from right edge)
- FAB is w-14 (3.5rem wide)
- Total space from right edge to left edge of FAB: 1.25rem + 3.5rem = 4.75rem

But we want a small gap, so add 0.5rem: 4.75rem + 0.5rem = 5.25rem

Tailwind: right-[5.25rem] = 84px
```

### Large Preset

```typescript
fabSize = 4rem (64px)
fabGap = 1.5rem (24px)

navRightGap = 4rem + (1.5rem × 2)
navRightGap = 4rem + 3rem
navRightGap = 7rem (112px)

Tailwind: right-28
```

## Custom Spacing Calculator

To create custom spacing:

### Step 1: Choose FAB Size
```typescript
// Example: 60px
const fabSize = '60px';  // 3.75rem
```

### Step 2: Choose Gap Size
```typescript
// Example: 18px
const fabGap = '18px';   // 1.125rem
```

### Step 3: Calculate Nav Right Gap
```typescript
const navRightGap = (60 + 18 + 18) + 'px';  // 96px
// Or in rem: (3.75 + 1.125 + 1.125) = 6rem
```

### Step 4: Convert to Tailwind
```
96px = 24 × 4px = 24 × 0.25rem = 6rem
Tailwind: right-24
```

## Tailwind Spacing Reference

| Class | Rem | Pixels |
|-------|-----|--------|
| -4    | 1rem | 16px   |
| -5    | 1.25rem | 20px   |
| -6    | 1.5rem | 24px   |
| -8    | 2rem | 32px   |
| -10   | 2.5rem | 40px   |
| -12   | 3rem | 48px   |
| -14   | 3.5rem | 56px   |
| -16   | 4rem | 64px   |
| -20   | 5rem | 80px   |
| -24   | 6rem | 96px   |
| -28   | 7rem | 112px  |

## Arbitrary Values

When Tailwind doesn't have the exact size:

```typescript
// Example: 84px = 5.25rem
right-[5.25rem]

// Example: 90px = 5.625rem
right-[5.625rem]

// Example: 100px = 6.25rem
right-[6.25rem]
```

## Common Mistakes

### Mistake 1: Using Same Value for Nav and FAB Gap
```typescript
// ❌ Wrong
navRightGap: 'right-20',
fabRightGap: 'right-20',
// Creates huge gap because both are same distance from edge

// ✅ Correct
navRightGap: 'right-28',   // 112px
fabSize: 'w-16',           // 64px
fabRightGap: 'right-6',    // 24px
// Formula: 64px + (24px × 2) = 112px ✓
```

### Mistake 2: Forgetting to Double the Gap
```typescript
// ❌ Wrong
navRightGap = fabSize + fabGap
navRightGap = 56px + 20px = 76px

// ✅ Correct
navRightGap = fabSize + (fabGap × 2)
navRightGap = 56px + (20px × 2) = 96px
```

### Mistake 3: Mixing Presets
```typescript
// ❌ Wrong - mixing values from different presets
navHeight: 'h-14',        // From Standard
fabSize: 'w-12 h-12',     // From Compact
fabGap: 'right-6',        // From Large

// ✅ Correct - all from same preset
navHeight: 'h-14',
fabSize: 'w-14 h-14',
fabGap: 'right-5',
navRightGap: 'right-[5.25rem]',
```

## Testing Your Spacing

### Visual Test

Open your app on mobile and check:

1. ✓ No gap between nav and FAB
2. ✓ No overlap between nav and FAB
3. ✓ Nav bar and FAB are aligned at same height
4. ✓ All elements stay within safe area

### Measurement Test

Use browser DevTools:

1. Inspect the nav bar
2. Note its right offset from viewport edge
3. Inspect the FAB
4. Calculate: FAB right offset + FAB width
5. Compare: Should match nav's right offset ± small gap

### Formula Verification

```typescript
// Log in console to verify
console.log('FAB size:', fabSize);
console.log('FAB gap:', fabGap);
console.log('Nav right gap:', navRightGap);
console.log('Formula check:', fabSize + (fabGap * 2) === navRightGap);
```

## Safe Area Considerations

When adding safe area support:

```typescript
// Both nav and FAB should use same bottom offset
navBottomOffset: 'bottom-[max(1.25rem,env(safe-area-inset-bottom))]',
fabBottomOffset: 'bottom-[max(1.25rem,env(safe-area-inset-bottom))]',
```

This ensures they stay aligned even on devices with home indicators.
