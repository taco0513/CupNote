# Component Library Documentation

## Mobile App Experience Components

### 🏠 AppHeader
**Path**: `src/components/AppHeader.tsx`  
**Purpose**: Global mobile navigation header

```typescript
interface AppHeaderProps {
  showSearch?: boolean
}
```

**Features**:
- Logo + app name branding
- Expandable search functionality
- Hamburger menu with slide-out panel
- User authentication state awareness
- Mobile-only display (`md:hidden`)

**Usage**:
```tsx
<AppHeader showSearch={true} />  // Default
<AppHeader showSearch={false} /> // Hide search button
```

### 🎯 CoffeeJourneyWidget
**Path**: `src/components/CoffeeJourneyWidget.tsx`  
**Purpose**: Gamified user progress display

```typescript
interface CoffeeJourneyStats {
  totalCoffees: number
  averageRating: number
  currentStreak: number
  journeyDays: number
}
```

**Features**:
- Progress visualization
- Motivational messaging
- Achievement-style presentation
- Responsive grid layout

### 💡 CoffeeTip
**Path**: `src/components/CoffeeTip.tsx`  
**Purpose**: Educational content rotation

**Features**:
- 10-second rotation timer
- Smooth fade transitions
- Curated coffee education content
- Icon-based categorization

### 📊 TasteRadarChart
**Path**: `src/components/TasteRadarChart.tsx`  
**Purpose**: Taste profile visualization

```typescript
interface TasteProfile {
  acidity: number      // 산미
  sweetness: number    // 단맛
  bitterness: number   // 쓴맛
  body: number         // 바디감
  aroma: number        // 향
  aftertaste: number   // 여운
}
```

**Features**:
- SVG-based 6-axis radar chart
- Korean taste dimension labels
- Coffee-themed color gradients
- Customizable size and labels

### 📱 FeedbackButton
**Path**: `src/components/FeedbackButton.tsx`  
**Purpose**: Beta testing feedback collection

**Features**:
- Purple gradient design with "Beta" badge
- Full-screen modal interface
- Anonymous feedback submission
- Success state with confirmation message
- Global accessibility (all users)

### 🔄 FloatingActionButton
**Path**: `src/components/FloatingActionButton.tsx`  
**Purpose**: Quick action access (deprecated in favor of FeedbackButton)

### 🎨 Design System
**Path**: `src/styles/design-system.css`  
**Purpose**: Comprehensive design tokens and patterns

**Includes**:
- Coffee color palette (50-900 scale)
- Typography hierarchy
- Spacing system
- Animation definitions
- Component patterns
- Touch target standards

## Usage Guidelines

### Import Patterns
```typescript
// Standard component import
import AppHeader from '../components/AppHeader'

// Dynamic import for performance
const AppHeader = dynamic(() => import('../components/AppHeader'), {
  loading: () => null
})
```

### Styling Conventions
- Use design system CSS variables
- Follow coffee-themed color palette
- Maintain 44px minimum touch targets
- Apply consistent border radius (8px-24px)

### State Management
- Local state with useState for UI interactions
- Auth context for user-dependent features
- Router integration for navigation actions

### Performance Considerations
- Dynamic imports for large components
- Minimize re-renders with proper memoization
- Use CSS animations over JS animations
- Optimize for mobile performance

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast color ratios

## Testing Guidelines

### Component Testing
```typescript
// Example test structure
describe('AppHeader', () => {
  it('renders logo and app name', () => {})
  it('shows search button when enabled', () => {})
  it('opens hamburger menu on click', () => {})
})
```

### Integration Testing
- Test complete navigation flows
- Verify responsive behavior
- Check authentication state handling
- Validate accessibility features

### Mobile Testing
- Test on actual mobile devices
- Verify touch interactions
- Check performance on slow networks
- Validate safe area handling

---

**Last Updated**: 2025-08-02  
**Component Count**: 8 new components  
**Status**: Production ready ✅