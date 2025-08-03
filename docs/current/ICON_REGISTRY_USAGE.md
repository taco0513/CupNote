# Icon Registry Usage Guide

## Overview

The centralized Icon Registry optimizes bundle size by providing a single import point for all Lucide React icons used in CupNote, enabling better tree-shaking and consistent icon usage across the application.

## Location

```
src/components/icons/IconRegistry.tsx
```

## Basic Usage

### Method 1: Using the Icon Component (Recommended)

```tsx
import { Icon } from '@/components/icons/IconRegistry'

// Basic usage
<Icon name="Coffee" className="w-4 h-4" />

// With custom props
<Icon 
  name="Star" 
  className="w-6 h-6 text-amber-400" 
  strokeWidth={2.5}
/>

// With size prop (overrides className dimensions)
<Icon name="Search" size={20} color="currentColor" />
```

### Method 2: Direct Icon Import (Backward Compatible)

```tsx
import { Coffee, Star, Search } from '@/components/icons/IconRegistry'

// Use exactly like before
<Coffee className="w-4 h-4" />
<Star className="w-6 h-6 text-amber-400" />
<Search size={20} />
```

## Available Icons (70+ icons)

### Core App Icons
- `Coffee`, `Star`, `Award`, `Trophy`
- `Search`, `Filter`, `Settings`, `Menu`
- `User`, `Users`, `LogIn`, `LogOut`

### Navigation & Actions
- `ArrowLeft`, `ArrowRight`, `ArrowDown`
- `ChevronLeft`, `ChevronRight`, `ChevronDown`
- `Plus`, `X`, `Check`, `Save`

### UI & Status
- `AlertCircle`, `AlertTriangle`, `CheckCircle`, `XCircle`
- `Info`, `HelpCircle`, `Loader2`
- `Eye`, `EyeOff`, `Heart`, `Bookmark`

### Media & Content
- `Camera`, `ImageIcon`, `Upload`, `Download`
- `Mic`, `MicOff`, `Play`, `Pause`, `Square`
- `Share`, `Share2`, `MessageCircle`

### Time & Data
- `Clock`, `Calendar`, `BarChart3`, `TrendingUp`
- `Activity`, `Target`, `Database`

### Network & Connectivity
- `Wifi`, `WifiOff`, `Cloud`, `CloudOff`, `Signal`
- `RefreshCw`, `RotateCcw`

[Full list available in IconRegistry.tsx]

## Migration Guide

### From Individual Imports

**Before:**
```tsx
import { Coffee, Star, Search, Filter } from 'lucide-react'

function MyComponent() {
  return (
    <div>
      <Coffee className="w-4 h-4" />
      <Star className="w-5 h-5 text-yellow-500" />
    </div>
  )
}
```

**After (Option 1 - Icon Component):**
```tsx
import { Icon } from '@/components/icons/IconRegistry'

function MyComponent() {
  return (
    <div>
      <Icon name="Coffee" className="w-4 h-4" />
      <Icon name="Star" className="w-5 h-5 text-yellow-500" />
    </div>
  )
}
```

**After (Option 2 - Direct Import):**
```tsx
import { Coffee, Star } from '@/components/icons/IconRegistry'

function MyComponent() {
  return (
    <div>
      <Coffee className="w-4 h-4" />
      <Star className="w-5 h-5 text-yellow-500" />
    </div>
  )
}
```

## TypeScript Support

### Icon Name Type Safety

```tsx
import { Icon, type IconName } from '@/components/icons/IconRegistry'

// Type-safe icon names
const iconName: IconName = 'Coffee' // ✅ Valid
const invalidIcon: IconName = 'InvalidIcon' // ❌ TypeScript error

// Dynamic icon selection with type safety
function DynamicIcon({ name }: { name: IconName }) {
  return <Icon name={name} className="w-4 h-4" />
}
```

### Icon Props Interface

```tsx
interface IconProps {
  name: IconName           // Required: icon name from registry
  className?: string       // Optional: CSS classes (default: 'w-4 h-4')
  size?: number           // Optional: pixel size (overrides className)
  color?: string          // Optional: icon color
  strokeWidth?: number    // Optional: stroke width (default: 2)
}
```

## Benefits

### Bundle Size Optimization
- **Tree-shaking**: Only imports icons actually used
- **Single Import Point**: Reduces duplicate imports across components
- **Optimized Bundling**: Works with Next.js `optimizePackageImports`

### Developer Experience
- **Type Safety**: Full TypeScript support with auto-completion
- **Consistent API**: Standardized props across all icons
- **Easy Migration**: Backward compatible with existing code
- **Centralized Management**: Single location to manage all icons

### Performance
- **Reduced Bundle Size**: Eliminates unused icon imports
- **Better Caching**: Consistent chunk splitting
- **Tree-shaking Friendly**: Optimized for webpack bundling

## Advanced Usage

### Conditional Icons

```tsx
import { Icon, type IconName } from '@/components/icons/IconRegistry'

function StatusIcon({ status }: { status: 'success' | 'error' | 'warning' }) {
  const iconMap: Record<string, IconName> = {
    success: 'CheckCircle',
    error: 'XCircle', 
    warning: 'AlertTriangle'
  }
  
  return <Icon name={iconMap[status]} className="w-5 h-5" />
}
```

### Icon with Dynamic Styling

```tsx
import { Icon } from '@/components/icons/IconRegistry'

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="Star"
          className={`w-4 h-4 ${
            star <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}
```

## Best Practices

### 1. Use Type-Safe Names
```tsx
// ✅ Good - Type-safe icon name
<Icon name="Coffee" />

// ❌ Avoid - String literals without type checking
<Icon name={"coffee" as any} />
```

### 2. Consistent Sizing
```tsx
// ✅ Good - Use consistent size classes
<Icon name="Search" className="w-4 h-4" />
<Icon name="Filter" className="w-4 h-4" />

// ✅ Also good - Use size prop for dynamic sizing
<Icon name="Search" size={16} />
```

### 3. Meaningful Class Names
```tsx
// ✅ Good - Descriptive classes
<Icon name="Star" className="w-4 h-4 text-yellow-400 fill-current" />

// ✅ Good - Use with design system tokens
<Icon name="Coffee" className="w-5 h-5 text-coffee-600" />
```

## Adding New Icons

To add a new icon to the registry:

1. **Import the icon** in `IconRegistry.tsx`:
```tsx
import { NewIcon } from 'lucide-react'
```

2. **Add to registry object**:
```tsx
export const ICON_REGISTRY = {
  // ... existing icons
  NewIcon,
} as const
```

3. **Export for backward compatibility**:
```tsx
export {
  // ... existing exports
  NewIcon,
}
```

4. **Update TypeScript types** (automatic with `as const`)

## Performance Monitoring

Monitor the impact of icon optimization:

```bash
# Generate bundle analysis
npm run analyze

# Check specific icon bundle size
npm run analyze:browser
```

The bundle analyzer will show the optimized lucide-react chunk size and tree-shaking effectiveness.

---

## Conclusion

The Icon Registry provides a scalable, type-safe, and performant solution for icon management in CupNote. Use the Icon component for new implementations and migrate existing code progressively for optimal bundle size benefits.