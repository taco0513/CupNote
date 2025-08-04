# 📋 Button System Migration Guide

## Quick Reference for Developers

### ✅ Use UnifiedButton Component
```tsx
// ❌ Don't use
import { Button } from '../ui/Button'

// ✅ Do use
import UnifiedButton from '../ui/UnifiedButton'
```

### 📏 Size Guidelines

#### Mobile Buttons
```tsx
// Primary CTA - Large and prominent
<UnifiedButton size="lg" variant="primary" fullWidth>
  시작하기
</UnifiedButton>

// Secondary action - Still meets touch target
<UnifiedButton size="md" variant="secondary">
  둘러보기
</UnifiedButton>

// Icon button - Guaranteed 44x44px minimum
<UnifiedButton size="icon" variant="ghost">
  <Settings className="h-6 w-6" />  // Use h-6 w-6 for icons
</UnifiedButton>
```

#### Desktop Buttons
```tsx
// Desktop can use smaller sizes
<UnifiedButton size="sm" variant="primary">
  저장
</UnifiedButton>
```

### 📐 Spacing Standards

```tsx
// Button groups on mobile
<div className="flex gap-3">  // 12px gap
  <UnifiedButton>버튼 1</UnifiedButton>
  <UnifiedButton>버튼 2</UnifiedButton>
</div>

// Button groups on desktop
<div className="flex gap-3 sm:gap-4">  // 12px mobile, 16px desktop
  <UnifiedButton>버튼 1</UnifiedButton>
  <UnifiedButton>버튼 2</UnifiedButton>
</div>

// Icon with text
<UnifiedButton>
  <div className="flex items-center gap-2">  // Always 8px
    <Coffee className="h-5 w-5" />
    <span>커피 기록</span>
  </div>
</UnifiedButton>
```

### 🎨 Using CSS Classes

```tsx
// Touch target utilities
<button className="touch-target-min">  // 44x44px minimum
<button className="touch-target-recommended">  // 48x48px recommended
<button className="touch-target-large">  // 56px height for CTAs

// Spacing utilities
<div className="button-group-mobile">  // gap-3 (12px)
<div className="button-group-desktop">  // gap-4 (16px) on desktop
<div className="icon-text-gap">  // gap-2 (8px) for icon+text

// Container padding
<div className="container-padding">  // px-4 sm:px-6 lg:px-8
```

### 🔄 Migration Checklist

- [ ] Replace all `Button` imports with `UnifiedButton`
- [ ] Check all mobile buttons are at least `size="sm"` (44px min)
- [ ] Update icon sizes from `h-5 w-5` to `h-6 w-6` minimum
- [ ] Change button group spacing to `gap-3` (mobile) or `gap-3 sm:gap-4`
- [ ] Add `fullWidth` prop for mobile CTAs
- [ ] Test touch targets on real mobile devices

### 📱 Mobile Best Practices

```tsx
// Full-width CTA for mobile
<UnifiedButton 
  size="lg" 
  variant="hero" 
  fullWidth
  className="sm:w-auto sm:px-8"  // Auto width on desktop
>
  무료로 시작하기
</UnifiedButton>

// Floating Action Button
<UnifiedButton 
  size="icon" 
  variant="primary"
  className="fixed bottom-20 right-4 shadow-xl"
>
  <Plus className="h-6 w-6" />
</UnifiedButton>

// Bottom sheet actions
<div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
  <div className="flex gap-3">
    <UnifiedButton size="md" variant="secondary" className="flex-1">
      취소
    </UnifiedButton>
    <UnifiedButton size="md" variant="primary" className="flex-1">
      확인
    </UnifiedButton>
  </div>
</div>
```

### 🚫 Common Mistakes to Avoid

```tsx
// ❌ Too small for mobile
<button className="px-2 py-1 text-xs">

// ✅ Proper mobile size
<UnifiedButton size="sm">

// ❌ Inconsistent spacing
<div className="space-x-2">

// ✅ Standard spacing
<div className="gap-3">

// ❌ Small icons
<Coffee className="h-4 w-4" />

// ✅ Proper icon size
<Coffee className="h-6 w-6" />

// ❌ No touch feedback
<button onClick={handleClick}>

// ✅ With touch feedback
<UnifiedButton onClick={handleClick}>  // Has active:scale-95 built-in
```

### 📊 Size Reference Table

| Size | Mobile Height | Desktop Height | Use Case |
|------|--------------|----------------|----------|
| xs | 44px | 36px | Compact lists (desktop only) |
| sm | 44px | 40px | Secondary actions |
| md | 48px | 44px | Default buttons |
| lg | 52px | 48px | Primary CTAs |
| xl | 56px | 52px | Hero CTAs |
| icon | 44x44px | 40x40px | Icon-only buttons |

### 🎯 Testing Requirements

1. **Touch Target Test**: All interactive elements ≥44x44px on mobile
2. **Spacing Test**: Minimum 8px between interactive elements
3. **Device Test**: Test on iPhone SE (smallest iOS) and compact Android
4. **Accessibility Test**: Verify with VoiceOver/TalkBack

### 💡 Pro Tips

1. **Use `fullWidth` on mobile**: Better for thumb reach
2. **Larger is better**: When in doubt, go bigger on mobile
3. **Test with gloves**: Simulates reduced precision
4. **Consider thumb zones**: Place primary actions in easy reach
5. **Add loading states**: Use `loading` prop for better UX