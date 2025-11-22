---
name: mobile-fab-advanced
description: Production-ready mobile FAB (Floating Action Button) navigation system for Next.js/React with zero spacing/layout issues. Includes perfect pixel-aligned positioning, safe area support, responsive sizing, customizable themes, and comprehensive troubleshooting. Use when implementing mobile bottom nav with FAB, fixing layout gaps, or ensuring consistent mobile navigation UX across all devices.
---

# Mobile FAB Navigation (Advanced)

Production-grade Floating Action Button (FAB) navigation system for Next.js and React applications with bulletproof spacing, layout precision, and comprehensive customization.

## Overview

This skill provides a battle-tested mobile navigation system featuring:

- **Zero Layout Issues**: Pixel-perfect alignment with no spacing gaps or overlaps
- **Safe Area Support**: Handles notches, home indicators, and device-specific constraints
- **Responsive Sizing**: Three pre-configured size presets (compact, standard, large)
- **Theme System**: Multiple color themes with dark mode support
- **Glassmorphism**: Modern blur effects with proper performance optimization
- **Accessibility**: Full ARIA labels and keyboard navigation
- **Hydration Safe**: No SSR/client mismatches

## When to Use This Skill

Use this skill when:

- Building mobile-first web applications with bottom navigation
- Implementing FAB menus for secondary actions
- Fixing spacing/layout issues in existing mobile nav
- Creating responsive navigation that adapts to device constraints
- Ensuring consistent mobile UX across iOS/Android browsers
- Migrating from basic mobile nav to production-ready solution

## Quick Start

### 1. Copy the Template

Choose the template that matches your needs from `assets/`:

- `MobileBottomNav-Compact.tsx` - Small, space-efficient (default)
- `MobileBottomNav-Standard.tsx` - Balanced size for most apps
- `MobileBottomNav-Large.tsx` - Larger touch targets for accessibility

```bash
cp assets/MobileBottomNav-Standard.tsx components/MobileBottomNav.tsx
```

### 2. Configure Navigation Items

Edit the `navItems` array (maximum 4 items):

```typescript
const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/products', icon: Package, label: 'Products' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/profile', icon: User, label: 'Profile' },
];
```

### 3. Configure FAB Menu

Edit the `fabMenuItems` array for secondary actions:

```typescript
const fabMenuItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/help', icon: HelpCircle, label: 'Help' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
];
```

### 4. Add to Layout

```typescript
import MobileBottomNav from '@/components/MobileBottomNav';

export default function Layout({ children }) {
  return (
    <>
      <main className="pb-safe-bottom">
        {children}
      </main>
      <MobileBottomNav />
    </>
  );
}
```

### 5. Add Safe Area Support

Update your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      spacing: {
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
        'safe-top': 'env(safe-area-inset-top)',
      },
    },
  },
};
```

## Size Presets

### Compact (Space-Efficient)

Best for: Apps with dense content, data-heavy interfaces

```typescript
// Spacing Configuration
const SPACING = {
  navHeight: 'h-12',           // 48px
  fabSize: 'w-12 h-12',        // 48px
  iconSize: 18,
  fabIconSize: 16,
  bottomOffset: 'bottom-4',    // 16px
  fabGap: 'right-4',          // 16px
  navRightGap: 'right-[4.5rem]', // 72px (fab + spacing)
};
```

### Standard (Recommended)

Best for: Most applications, balanced UX

```typescript
// Spacing Configuration
const SPACING = {
  navHeight: 'h-14',           // 56px
  fabSize: 'w-14 h-14',        // 56px
  iconSize: 20,
  fabIconSize: 18,
  bottomOffset: 'bottom-5',    // 20px
  fabGap: 'right-5',          // 20px
  navRightGap: 'right-[5.25rem]', // 84px (fab + spacing)
};
```

### Large (Accessibility-First)

Best for: Apps requiring larger touch targets, older audiences

```typescript
// Spacing Configuration
const SPACING = {
  navHeight: 'h-16',           // 64px
  fabSize: 'w-16 h-16',        // 64px
  iconSize: 24,
  fabIconSize: 20,
  bottomOffset: 'bottom-6',    // 24px
  fabGap: 'right-6',          // 24px
  navRightGap: 'right-[6rem]', // 96px (fab + spacing)
};
```

## Layout System Explained

### The Spacing Formula

The key to zero layout issues is the **synchronized spacing formula**:

```
navRightGap = fabSize + (fabGap × 2)
```

**Example** (Standard preset):
```
fabSize = 3.5rem (14 × 0.25rem)
fabGap = 1.25rem (5 × 0.25rem)
navRightGap = 3.5rem + (1.25rem × 2) = 6rem
```

This ensures perfect alignment without gaps or overlaps.

### Visual Layout

```
┌─────────────────────────────────────────┐
│                                         │
│           Main Content                  │
│        (pb-safe-bottom)                 │
│                                         │
├─────────────────────────────────────────┤
│                                    ┌────┐
│  [Icon] [Icon] [Icon] [Icon]      │ +  │  ← Bottom Nav + FAB
│                                    └────┘
└─────────────────────────────────────────┘
    ↑                                  ↑
  left-4                            right-4
          ↑────── navRightGap ──────↑
```

### Safe Area Integration

Mobile devices have safe areas (notches, rounded corners, home indicators):

```typescript
// Bottom padding for content
<main className="pb-[calc(4rem+env(safe-area-inset-bottom))]">

// Navigation positioning
className="bottom-[max(1rem,env(safe-area-inset-bottom))]"
```

This ensures navigation sits above the home indicator on iOS.

## Theme System

### Built-in Themes

#### Purple Gradient (Default)
```typescript
const THEME = {
  navBg: 'from-[rgba(78,46,140,0.95)] to-[rgba(108,66,160,0.85)]',
  fabBg: 'from-[rgba(217,81,100,1)] to-[rgba(217,81,100,0.85)]',
  activeBg: 'bg-[rgba(50,30,90,0.9)]',
};
```

#### Blue Professional
```typescript
const THEME = {
  navBg: 'from-[rgba(37,99,235,0.95)] to-[rgba(59,130,246,0.85)]',
  fabBg: 'from-[rgba(234,88,12,1)] to-[rgba(234,88,12,0.85)]',
  activeBg: 'bg-[rgba(30,58,138,0.9)]',
};
```

#### Green Fresh
```typescript
const THEME = {
  navBg: 'from-[rgba(5,150,105,0.95)] to-[rgba(16,185,129,0.85)]',
  fabBg: 'from-[rgba(245,158,11,1)] to-[rgba(245,158,11,0.85)]',
  activeBg: 'bg-[rgba(6,78,59,0.9)]',
};
```

#### Dark Mode
```typescript
const THEME = {
  navBg: 'from-[rgba(24,24,27,0.98)] to-[rgba(39,39,42,0.95)]',
  fabBg: 'from-[rgba(139,92,246,1)] to-[rgba(139,92,246,0.85)]',
  activeBg: 'bg-[rgba(63,63,70,0.95)]',
};
```

### Custom Theme Creation

See `references/theme-customization.md` for:
- Color palette generation
- Gradient calculation
- Opacity optimization for glassmorphism
- Dark mode color adjustments

## Common Use Cases

### E-Commerce Application

```typescript
const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/shop', icon: Store, label: 'Shop' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/account', icon: User, label: 'Account' },
];

const fabMenuItems = [
  { href: '/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/orders', icon: Package, label: 'Orders' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/support', icon: Headphones, label: 'Support' },
];
```

### Social Media Application

```typescript
const navItems = [
  { href: '/', icon: Home, label: 'Feed' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/notifications', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

const fabMenuItems = [
  { href: '/create', icon: Plus, label: 'Create Post' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/bookmarks', icon: Bookmark, label: 'Saved' },
];
```

### Point of Sale (POS) Application

```typescript
const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/sales', icon: ShoppingCart, label: 'Sales' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/reports', icon: BarChart, label: 'Reports' },
];

const fabMenuItems = [
  { href: '/products/new', icon: Plus, label: 'Add Product' },
  { href: '/quick-sale', icon: Zap, label: 'Quick Sale' },
  { href: '/scanner', icon: Scan, label: 'Scan Barcode' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];
```

### Content/Blog Platform

```typescript
const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/articles', icon: FileText, label: 'Articles' },
  { href: '/bookmarks', icon: Bookmark, label: 'Saved' },
  { href: '/profile', icon: User, label: 'Profile' },
];

const fabMenuItems = [
  { href: '/write', icon: Edit, label: 'Write' },
  { href: '/drafts', icon: FileEdit, label: 'Drafts' },
  { href: '/topics', icon: Hash, label: 'Topics' },
  { href: '/analytics', icon: TrendingUp, label: 'Analytics' },
];
```

## Troubleshooting

### Issue: Spacing Gap Between Nav and FAB

**Symptoms**: Visible gap or overlap between navigation bar and FAB button

**Solution**: Verify spacing formula is correct

```typescript
// Check these values match the formula:
// navRightGap = fabSize + (fabGap × 2)

// ❌ Wrong - will create gap
navRightGap: 'right-16',  // 64px
fabSize: 'w-14 h-14',     // 56px
fabGap: 'right-5',        // 20px
// 56px + (20px × 2) = 96px ≠ 64px

// ✅ Correct - perfect alignment
navRightGap: 'right-24',  // 96px
fabSize: 'w-14 h-14',     // 56px
fabGap: 'right-5',        // 20px
// 56px + (20px × 2) = 96px ✓
```

### Issue: Navigation Hidden Behind Device UI

**Symptoms**: Nav bar hidden by iPhone home indicator or Android navigation

**Solution**: Add safe area support

```javascript
// tailwind.config.js
theme: {
  extend: {
    spacing: {
      'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
    },
  },
}
```

```typescript
// Component
className="bottom-[max(1rem,env(safe-area-inset-bottom))]"
```

### Issue: Content Hidden Behind Navigation

**Symptoms**: Page content cut off at bottom, hidden by nav

**Solution**: Add proper bottom padding to main content

```typescript
// Use calculated padding
<main className="pb-[calc(5rem+env(safe-area-inset-bottom))]">
  {children}
</main>

// Or use Tailwind custom spacing
<main className="pb-safe-nav">
  {children}
</main>
```

### Issue: Hydration Mismatch Error

**Symptoms**: React hydration error on page load

**Solution**: Ensure `isMounted` check is implemented

```typescript
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);

if (!isMounted) return null;
```

### Issue: FAB Menu Not Closing on Route Change

**Symptoms**: Menu stays open when navigating to new page

**Solution**: Add route change listener

```typescript
const pathname = usePathname();

useEffect(() => {
  setShowMenu(false);
}, [pathname]);
```

### Issue: Layout Breaks on Different Screen Sizes

**Symptoms**: Navigation looks good on some devices but breaks on others

**Solution**: Test on multiple screen widths and use responsive utilities

```typescript
// Responsive sizing example
className="
  bottom-4 sm:bottom-5 md:bottom-6
  w-12 sm:w-14 md:w-16
  h-12 sm:h-14 md:h-16
"
```

### Issue: Poor Performance with Blur Effects

**Symptoms**: Choppy animations, lag when scrolling

**Solution**: Optimize backdrop blur

```typescript
// ❌ Too much blur
backdrop-blur-3xl  // Expensive

// ✅ Optimal blur
backdrop-blur-xl   // Good performance + visual effect
```

Also ensure hardware acceleration:

```typescript
className="transform translate-z-0 will-change-transform"
```

### Issue: Icons Not Aligning Properly

**Symptoms**: Icons appear off-center in nav items

**Solution**: Use consistent icon sizes and flex centering

```typescript
<div className="flex items-center justify-center">
  <Icon size={20} strokeWidth={2} />
</div>
```

### Issue: Active State Not Updating

**Symptoms**: Active indicator doesn't move when navigating

**Solution**: Check `isActive` function and pathname detection

```typescript
const isActive = (href: string) => {
  if (!isMounted) return false;
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
};
```

## Advanced Features

### Dynamic Badge Counts

Add notification badges to nav items:

```typescript
{navItems.map((item) => (
  <Link href={item.href} className="relative">
    <Icon size={20} />
    {item.badge && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
        {item.badge}
      </span>
    )}
  </Link>
))}
```

### Haptic Feedback

Add touch feedback on mobile devices:

```typescript
const handleNavClick = () => {
  // Trigger haptic feedback on supported devices
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
};
```

### Smooth Transitions

Enhance with custom animations:

```typescript
className="
  transition-all duration-300 ease-out
  active:scale-95
  hover:shadow-xl
"
```

### Gesture Support

See `references/gesture-patterns.md` for:
- Swipe-to-dismiss FAB menu
- Long-press for contextual actions
- Drag-to-reorder nav items

## Performance Optimization

### Lazy Loading Icons

```typescript
import dynamic from 'next/dynamic';

const Home = dynamic(() => import('lucide-react').then(mod => mod.Home));
const Package = dynamic(() => import('lucide-react').then(mod => mod.Package));
```

### Memoization

```typescript
const MemoizedNavItem = React.memo(({ item, isActive }) => {
  // Component logic
});
```

### Reduce Re-renders

```typescript
const navConfig = useMemo(() => ({
  navItems,
  fabMenuItems,
}), []); // Only compute once
```

## Accessibility

### Keyboard Navigation

```typescript
<nav
  role="navigation"
  aria-label="Mobile navigation"
  onKeyDown={(e) => {
    if (e.key === 'Escape') setShowMenu(false);
  }}
>
```

### Screen Reader Support

```typescript
<button
  aria-label="Open menu"
  aria-expanded={showMenu}
  aria-haspopup="true"
>
```

### Focus Management

```typescript
useEffect(() => {
  if (showMenu) {
    // Focus first menu item
    menuRef.current?.focus();
  }
}, [showMenu]);
```

## Dependencies

- Next.js 13+ (App Router)
- React 18+
- Tailwind CSS 3+
- Lucide React icons
- TypeScript 5+ (optional but recommended)

Install dependencies:

```bash
npm install lucide-react
# or
yarn add lucide-react
# or
pnpm add lucide-react
```

## Reference Files

- `references/theme-customization.md` - Complete theme creation guide
- `references/spacing-calculator.md` - Spacing formula calculator and examples
- `references/gesture-patterns.md` - Advanced gesture support
- `references/responsive-strategies.md` - Device-specific responsive patterns

## Assets

- `assets/MobileBottomNav-Compact.tsx` - Compact size preset
- `assets/MobileBottomNav-Standard.tsx` - Standard size preset (recommended)
- `assets/MobileBottomNav-Large.tsx` - Large size preset
- `assets/MobileBottomNav-ThemeVariants.tsx` - All theme variants

## Best Practices

1. **Always use size presets** - Don't mix spacing values from different presets
2. **Test on real devices** - Browser DevTools don't show safe areas accurately
3. **Limit nav items to 4** - More items create cramped UX
4. **Use semantic icons** - Icons should be instantly recognizable
5. **Keep labels short** - Single words work best (max 2 words)
6. **Test dark mode** - Ensure theme works in both light and dark
7. **Verify touch targets** - Minimum 44×44px for accessibility
8. **Optimize blur** - Use `backdrop-blur-xl` or less for performance
9. **Add safe area support** - Essential for modern iOS/Android devices
10. **Monitor performance** - Check animation frame rates on mid-range devices
