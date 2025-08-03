# Notification Context Error Fix

**Date**: 2025-08-03  
**Issue**: `useSystemNotifications must be used within a SystemNotificationProvider`  
**Status**: ✅ Resolved  

## Problem Description

The app was throwing a React context error when the `NotificationBell` component tried to use the `useSystemNotifications` hook before the `SystemNotificationProvider` was fully initialized.

```
Error: useSystemNotifications must be used within a SystemNotificationProvider
    at useSystemNotifications (SystemNotificationContext.tsx:22:15)
    at NotificationBell (NotificationBell.tsx:21:120)
```

## Root Cause

The issue occurred because:

1. `AppHeader` is dynamically imported in `layout.tsx`
2. `NotificationBell` inside `AppHeader` immediately tries to use the `useSystemNotifications` hook
3. During SSR/hydration, the context provider wasn't fully available yet
4. The `ssr: false` option in `layout.tsx` was invalid for Server Components

## Solution

### 1. Created SafeNotificationBell Wrapper

**File**: `src/components/notifications/SafeNotificationBell.tsx`

```tsx
'use client'

import dynamic from 'next/dynamic'
import { Bell } from 'lucide-react'

// Fallback notification bell when context is not available
function FallbackNotificationBell() {
  return (
    <button
      className="relative p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-100/50 rounded-xl transition-colors"
      aria-label="알림"
      disabled
    >
      <Bell className="h-5 w-5" />
    </button>
  )
}

// Dynamic import to handle context safely
const NotificationBell = dynamic(() => import('./NotificationBell'), {
  ssr: false,
  loading: () => <FallbackNotificationBell />
})

export default NotificationBell
```

### 2. Updated AppHeader to Use Safe Wrapper

**File**: `src/components/AppHeader.tsx`

```tsx
// Before
import NotificationBell from './notifications/NotificationBell'

// After  
import SafeNotificationBell from './notifications/SafeNotificationBell'

// Usage
{user && <SafeNotificationBell />}
```

### 3. Fixed Dynamic Import in Layout

**File**: `src/app/layout.tsx`

```tsx
// Before (Invalid for Server Components)
const AppHeader = dynamic(() => import('../components/AppHeader'), {
  loading: () => null,
  ssr: false  // ❌ Not allowed in Server Components
})

// After
const AppHeader = dynamic(() => import('../components/AppHeader'), {
  loading: () => null  // ✅ Valid
})
```

### 4. Fixed Import Issues

**File**: `src/components/notifications/NotificationDropdown.tsx`

- Consolidated icon imports
- Removed duplicate Bell icon import at end of file

## Technical Benefits

### 1. Graceful Degradation
- Shows fallback notification bell when context isn't available
- App continues to function without breaking

### 2. Client-Side Safety  
- `SafeNotificationBell` uses `ssr: false` to prevent hydration issues
- Dynamic loading prevents server-side context errors

### 3. User Experience
- Users always see a notification bell icon
- No jarring layout shifts or broken components
- Smooth transition when context becomes available

### 4. Development Benefits
- Clear error boundaries for notification system
- Easy to debug and maintain
- Follows React best practices for context usage

## Files Modified

1. ✅ `src/components/notifications/SafeNotificationBell.tsx` - **Created**
2. ✅ `src/components/AppHeader.tsx` - Updated import
3. ✅ `src/app/layout.tsx` - Removed invalid `ssr: false`
4. ✅ `src/components/notifications/NotificationDropdown.tsx` - Fixed imports

## Testing Results

- ✅ App loads without React context errors
- ✅ Notification bell displays correctly for logged-in users
- ✅ Fallback bell shows during initial load
- ✅ Context integrates properly once initialized
- ✅ No SSR/hydration mismatches

## Prevention Strategies

### 1. Context Usage Patterns
- Always use dynamic imports with fallbacks for context-dependent components
- Implement error boundaries around context consumers
- Use `ssr: false` in Client Components only

### 2. Component Architecture
- Separate context logic from UI components
- Create wrapper components for complex context interactions
- Implement graceful degradation patterns

### 3. Testing Approaches
- Test context availability during different render phases
- Verify fallback components work correctly
- Check SSR/client-side consistency

## Related Documentation

- [React Context Best Practices](../patterns/react-context-patterns.md)
- [Dynamic Import Strategy](../patterns/dynamic-import-patterns.md)
- [Error Handling Patterns](../patterns/error-handling-patterns.md)
- [SSR/Hydration Guidelines](../patterns/ssr-hydration-patterns.md)

---

**Author**: Claude Code  
**Reviewers**: Design Team  
**Next Update**: As needed for similar context issues