# Theme Customization Guide

## Understanding the Theme System

The FAB navigation uses a layered theme system with:

1. **Navigation Bar** - Glassmorphism background with gradient
2. **FAB Button** - Solid gradient that stands out
3. **Active State** - Semi-transparent pill for selected items
4. **FAB Menu** - Matching glassmorphism panel

## Theme Anatomy

```typescript
const THEME = {
  navBg: 'from-[rgba(...)] to-[rgba(...)]',  // Nav bar gradient
  fabBg: 'from-[rgba(...)] to-[rgba(...)]',  // FAB button gradient
  activeBg: 'bg-[rgba(...)]',                 // Active item pill
  menuBg: 'bg-[rgba(...)]',                   // FAB menu background
  border: 'border-white/20',                  // Border color (usually consistent)
};
```

## Built-in Theme Library

### Purple Gradient (Default)
Elegant and modern, works well for content apps.

```typescript
const THEME = {
  navBg: 'from-[rgba(78,46,140,0.95)] to-[rgba(108,66,160,0.85)]',
  fabBg: 'from-[rgba(217,81,100,1)] to-[rgba(217,81,100,0.85)]',
  activeBg: 'bg-[rgba(50,30,90,0.9)]',
  menuBg: 'bg-[rgba(78,46,140,0.98)]',
  border: 'border-white/20',
};
```

**Color Palette:**
- Primary: `#4E2E8C` → `#6C42A0` (Purple gradient)
- Accent: `#D95164` (Pink/Red)
- Active: `#321E5A` (Dark purple)

### Blue Professional
Clean and trustworthy, ideal for business apps.

```typescript
const THEME = {
  navBg: 'from-[rgba(37,99,235,0.95)] to-[rgba(59,130,246,0.85)]',
  fabBg: 'from-[rgba(234,88,12,1)] to-[rgba(234,88,12,0.85)]',
  activeBg: 'bg-[rgba(30,58,138,0.9)]',
  menuBg: 'bg-[rgba(37,99,235,0.98)]',
  border: 'border-white/20',
};
```

**Color Palette:**
- Primary: `#2563EB` → `#3B82F6` (Blue gradient)
- Accent: `#EA580C` (Orange)
- Active: `#1E3A8A` (Dark blue)

### Green Fresh
Natural and vibrant, perfect for health/wellness apps.

```typescript
const THEME = {
  navBg: 'from-[rgba(5,150,105,0.95)] to-[rgba(16,185,129,0.85)]',
  fabBg: 'from-[rgba(245,158,11,1)] to-[rgba(245,158,11,0.85)]',
  activeBg: 'bg-[rgba(6,78,59,0.9)]',
  menuBg: 'bg-[rgba(5,150,105,0.98)]',
  border: 'border-white/20',
};
```

**Color Palette:**
- Primary: `#059669` → `#10B981` (Green gradient)
- Accent: `#F59E0B` (Amber)
- Active: `#064E3B` (Dark green)

### Dark Mode
High contrast for low-light environments.

```typescript
const THEME = {
  navBg: 'from-[rgba(24,24,27,0.98)] to-[rgba(39,39,42,0.95)]',
  fabBg: 'from-[rgba(139,92,246,1)] to-[rgba(139,92,246,0.85)]',
  activeBg: 'bg-[rgba(63,63,70,0.95)]',
  menuBg: 'bg-[rgba(24,24,27,0.98)]',
  border: 'border-white/10',
};
```

**Color Palette:**
- Primary: `#18181B` → `#27272A` (Gray gradient)
- Accent: `#8B5CF6` (Purple)
- Active: `#3F3F46` (Medium gray)

### Red Bold
Energetic and attention-grabbing for action-oriented apps.

```typescript
const THEME = {
  navBg: 'from-[rgba(220,38,38,0.95)] to-[rgba(239,68,68,0.85)]',
  fabBg: 'from-[rgba(234,179,8,1)] to-[rgba(234,179,8,0.85)]',
  activeBg: 'bg-[rgba(127,29,29,0.9)]',
  menuBg: 'bg-[rgba(220,38,38,0.98)]',
  border: 'border-white/20',
};
```

**Color Palette:**
- Primary: `#DC2626` → `#EF4444` (Red gradient)
- Accent: `#EAB308` (Yellow)
- Active: `#7F1D1D` (Dark red)

### Teal Ocean
Calm and sophisticated for productivity apps.

```typescript
const THEME = {
  navBg: 'from-[rgba(13,148,136,0.95)] to-[rgba(20,184,166,0.85)]',
  fabBg: 'from-[rgba(251,146,60,1)] to-[rgba(251,146,60,0.85)]',
  activeBg: 'bg-[rgba(19,78,74,0.9)]',
  menuBg: 'bg-[rgba(13,148,136,0.98)]',
  border: 'border-white/20',
};
```

**Color Palette:**
- Primary: `#0D9488` → `#14B8A6` (Teal gradient)
- Accent: `#FB923C` (Orange)
- Active: `#134E4A` (Dark teal)

## Creating Custom Themes

### Step 1: Choose Your Brand Colors

Pick 2-3 colors:
- **Primary color** - Main brand color for nav bar
- **Accent color** - Contrasting color for FAB
- **Dark variant** - Darker shade of primary for active state

### Step 2: Convert to RGBA

Use online tools or calculate manually:

```javascript
// Hex to RGBA converter
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Example
hexToRgba('#4E2E8C', 0.95);  // rgba(78,46,140,0.95)
```

### Step 3: Create Gradient

For nav bar, create a gradient with:
- Start: Primary color at 95% opacity
- End: Slightly lighter shade at 85% opacity

```typescript
navBg: 'from-[rgba(78,46,140,0.95)] to-[rgba(108,66,160,0.85)]'
```

### Step 4: Choose Accent Color

FAB should be highly visible:
- Use full opacity (1.0) at start
- Slight transparency (0.85) at end

```typescript
fabBg: 'from-[rgba(217,81,100,1)] to-[rgba(217,81,100,0.85)]'
```

### Step 5: Create Active State

Use darker variant of primary:
- High opacity for clear indication (0.9)
- Solid color, not gradient

```typescript
activeBg: 'bg-[rgba(50,30,90,0.9)]'
```

### Step 6: Menu Background

Match primary color with very high opacity:

```typescript
menuBg: 'bg-[rgba(78,46,140,0.98)]'
```

## Opacity Guidelines

### Navigation Bar (navBg)
- **Start opacity: 0.95** - Mostly opaque for readability
- **End opacity: 0.85** - Slightly transparent for glassmorphism

### FAB Button (fabBg)
- **Start opacity: 1.0** - Fully opaque to stand out
- **End opacity: 0.85** - Slight gradient effect

### Active State (activeBg)
- **Opacity: 0.9** - Very opaque for clear selection

### Menu (menuBg)
- **Opacity: 0.98** - Almost opaque for readability

## Color Contrast

Ensure proper contrast ratios:

### Text on Nav Bar
- White text on colored background
- Minimum contrast: 4.5:1 for body text
- Target: 7:1 for better readability

### Icons
- Active icons: Full white (`text-white`)
- Inactive icons: 70% opacity (`text-white/70`)

### FAB Button
- Should be clearly distinguishable from nav bar
- Use complementary or contrasting color
- Ensure visibility against all possible backgrounds

## Testing Your Theme

### Light Background Test
```html
<body class="bg-white">
  <!-- Your nav component -->
</body>
```

### Dark Background Test
```html
<body class="bg-gray-900">
  <!-- Your nav component -->
</body>
```

### Image Background Test
```html
<body style="background-image: url('/test-bg.jpg')">
  <!-- Your nav component -->
</body>
```

### Contrast Checker
Use online tools:
- WebAIM Contrast Checker
- Contrast Ratio Calculator
- Chrome DevTools Accessibility Panel

## Dynamic Theme Switching

### Using CSS Variables

```typescript
// In globals.css
:root {
  --nav-from: rgba(78,46,140,0.95);
  --nav-to: rgba(108,66,160,0.85);
  --fab-from: rgba(217,81,100,1);
  --fab-to: rgba(217,81,100,0.85);
}

.theme-blue {
  --nav-from: rgba(37,99,235,0.95);
  --nav-to: rgba(59,130,246,0.85);
  --fab-from: rgba(234,88,12,1);
  --fab-to: rgba(234,88,12,0.85);
}
```

```typescript
// In component
className="bg-gradient-to-r from-[var(--nav-from)] to-[var(--nav-to)]"
```

### Using React State

```typescript
const themes = {
  purple: {
    navBg: 'from-[rgba(78,46,140,0.95)] to-[rgba(108,66,160,0.85)]',
    fabBg: 'from-[rgba(217,81,100,1)] to-[rgba(217,81,100,0.85)]',
    // ...
  },
  blue: {
    navBg: 'from-[rgba(37,99,235,0.95)] to-[rgba(59,130,246,0.85)]',
    fabBg: 'from-[rgba(234,88,12,1)] to-[rgba(234,88,12,0.85)]',
    // ...
  },
};

const [theme, setTheme] = useState('purple');
const currentTheme = themes[theme];
```

### Dark Mode Support

```typescript
// Auto-switch based on system preference
const THEME = {
  navBg: 'from-[rgba(78,46,140,0.95)] dark:from-[rgba(24,24,27,0.98)] to-[rgba(108,66,160,0.85)] dark:to-[rgba(39,39,42,0.95)]',
  // ...
};
```

## Performance Considerations

### Backdrop Blur Optimization

```typescript
// ✅ Good performance
backdrop-blur-xl

// ❌ Poor performance on low-end devices
backdrop-blur-3xl
```

### Gradient Complexity

```typescript
// ✅ Simple 2-color gradient (fast)
from-purple-600 to-purple-700

// ❌ Complex multi-stop gradient (slower)
from-purple-600 via-pink-500 via-red-500 to-orange-600
```

### Transparency Layers

Limit stacked transparent elements:
- Nav bar (transparent)
- Active pill (transparent)
- Total: 2 layers maximum for best performance

## Accessibility

### Color Blindness

Test your theme with:
- Deuteranopia (red-green)
- Protanopia (red-green)
- Tritanopia (blue-yellow)

Use tools like:
- Coblis Color Blindness Simulator
- Chrome DevTools Vision Deficiency Emulation

### High Contrast Mode

Provide alternative for high contrast:

```typescript
@media (prefers-contrast: high) {
  .nav-bar {
    background: solid colors instead of gradients;
    border: thicker borders;
  }
}
```

## Brand Alignment Examples

### E-Commerce (Trust & Energy)
- Primary: Blue (#2563EB)
- Accent: Orange (#EA580C)
- Feel: Professional yet approachable

### Health/Fitness (Fresh & Active)
- Primary: Green (#059669)
- Accent: Amber (#F59E0B)
- Feel: Natural and energetic

### Finance (Stable & Secure)
- Primary: Navy (#1E3A8A)
- Accent: Gold (#EAB308)
- Feel: Trustworthy and premium

### Social Media (Fun & Engaging)
- Primary: Purple (#8B5CF6)
- Accent: Pink (#EC4899)
- Feel: Creative and youthful

### Food Delivery (Appetite & Urgency)
- Primary: Red (#DC2626)
- Accent: Yellow (#EAB308)
- Feel: Energetic and exciting
