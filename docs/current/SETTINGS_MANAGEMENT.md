# Settings Management Guide

## Overview

CupNote's settings system has been streamlined to focus on essential user preferences while eliminating unnecessary complexity. This guide covers the current settings architecture, user equipment management, and implementation patterns.

## Settings Philosophy

### 1. Simplicity First
Remove options that don't provide real user value or create confusion.

**Eliminated Settings**:
- **Imperial Units**: Coffee industry uses metric globally
- **Taste Expression Mode**: Determined automatically by record mode selection
- **Redundant Preferences**: Combined related options

### 2. Context-Aware Configuration
Settings are grouped by their usage context and frequency.

**Personal Settings**: User identity and workflow customization
**App Settings**: Application behavior and display preferences
**Equipment Setup**: Coffee brewing equipment management

### 3. Industry Standards Alignment
Default to coffee industry standards to reduce decision fatigue.

**Metric Units Only**: grams, milliliters, Celsius (industry standard)
**Equipment Categories**: Based on specialty coffee brewing fundamentals

## Settings Structure

### Personal Settings
```typescript
interface PersonalSettings {
  displayName: string              // User identity
  homeCafeEquipment: {            // Equipment setup for efficiency
    grinder: string               // Primary grinder
    brewingMethod: string         // Preferred brewing method
    scale: string                 // Precision scale
    kettle: string               // Water heating/pouring
    other: string[]              // Additional equipment
  }
}
```

### Application Settings
```typescript
interface AppSettings {
  autoSaveEnabled: boolean         // Auto-save behavior
  showRatingInList: boolean       // Display preferences
  compactView: boolean            // UI density
}
```

## Equipment Management System

### Core Equipment Categories

**1. Grinder**
- **Purpose**: Bean preparation, fundamental to coffee quality
- **Examples**: "코만단테 C40", "바라짜 엔코어", "1zpresso JX"
- **Integration**: Pre-populated in HomeCafe mode brewing setup

**2. Brewing Method**
- **Purpose**: Primary extraction method for home brewing
- **Examples**: "V60", "칼리타 웨이브", "에어로프레스", "프렌치프레스"
- **Integration**: Default method selection in tasting flows

**3. Scale**
- **Purpose**: Precision measurement (essential for consistency)
- **Examples**: "아카이아 펄", "하리오 V60 드립스케일", "브루이스타 스케일"
- **Integration**: Brewing parameter validation and suggestions

**4. Kettle**
- **Purpose**: Water temperature and pouring control
- **Examples**: "펠로우 스타그 EKG", "하리오 부오노", "브루이스타 아티산"
- **Integration**: Temperature and pouring technique recommendations

### Dynamic Equipment List

**Other Equipment Management**:
```typescript
// Dynamic list with add/remove functionality
const [newEquipmentItem, setNewEquipmentItem] = useState('')

const addEquipmentItem = () => {
  if (newEquipmentItem.trim()) {
    const newSettings = {
      ...settings,
      homeCafeEquipment: {
        ...settings.homeCafeEquipment,
        other: [...settings.homeCafeEquipment.other, newEquipmentItem.trim()]
      }
    }
    saveSettings(newSettings)
    setNewEquipmentItem('')
  }
}
```

**Common Additional Equipment**:
- Thermometer (temperature monitoring)
- Timer (extraction timing)
- TDS Meter (strength measurement)
- Filters (paper, metal)
- Storage containers
- Cleaning supplies

## Implementation Details

### Auto-Save Pattern
```typescript
const updateEquipment = (field: keyof typeof settings.homeCafeEquipment, value: string) => {
  const newSettings = {
    ...settings,
    homeCafeEquipment: {
      ...settings.homeCafeEquipment,
      [field]: value
    }
  }
  saveSettings(newSettings) // Immediate persistence
}
```

### Equipment UI Pattern
```tsx
// Standard equipment input field
<div>
  <label className="block text-sm font-medium text-coffee-700 mb-1">
    {equipment.label}
  </label>
  <input
    type="text"
    value={settings.homeCafeEquipment[equipment.field]}
    onChange={e => updateEquipment(equipment.field, e.target.value)}
    className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:border-coffee-500 text-sm"
    placeholder={equipment.placeholder}
  />
</div>
```

### Dynamic List Management
```tsx
// Add/remove equipment items
{settings.homeCafeEquipment.other.map((item, index) => (
  <div key={index} className="flex items-center mb-2">
    <span className="flex-1 px-3 py-2 bg-coffee-50 border border-coffee-200 rounded-lg text-sm">
      {item}
    </span>
    <button
      onClick={() => removeEquipmentItem(index)}
      className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
))}
```

## Integration Patterns

### HomeCafe Mode Integration
```typescript
// Equipment pre-population in brewing setup
const userEquipment = getUserEquipment() // From settings

const defaultBrewingSetup = {
  grinder: userEquipment.grinder || '',
  method: userEquipment.brewingMethod || '',
  scale: userEquipment.scale || '',
  kettle: userEquipment.kettle || ''
}
```

### Smart Suggestions
```typescript
// Context-aware equipment suggestions
const getEquipmentSuggestions = (category: string) => {
  const userEquipment = settings.homeCafeEquipment
  
  switch (category) {
    case 'brewing_method':
      return userEquipment.brewingMethod ? [userEquipment.brewingMethod] : DEFAULT_METHODS
    case 'grinder':
      return userEquipment.grinder ? [userEquipment.grinder] : POPULAR_GRINDERS
    default:
      return []
  }
}
```

### Validation and Recommendations
```typescript
// Equipment-based parameter suggestions
const getRecommendedParameters = (equipment: EquipmentSetup) => {
  const recommendations: BrewingParameters = {}
  
  if (equipment.brewingMethod === 'V60') {
    recommendations.ratio = '1:16'
    recommendations.grindSize = 'Medium-fine'
    recommendations.temperature = '92-96°C'
  }
  
  if (equipment.grinder?.includes('Comandante')) {
    recommendations.grindSettings = '18-22 clicks'
  }
  
  return recommendations
}
```

## Data Storage & Persistence

### LocalStorage Pattern
```typescript
const SETTINGS_STORAGE_KEY = 'cupnote_user_settings'

const saveSettings = (settings: UserSettings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    showNotification('success', '설정이 저장되었습니다.')
  } catch (error) {
    showNotification('error', '설정 저장에 실패했습니다.')
  }
}

const loadSettings = (): UserSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultSettings
  } catch (error) {
    return defaultSettings
  }
}
```

### Supabase Integration (Future)
```typescript
// Future: Sync settings across devices
const syncSettings = async (settings: UserSettings) => {
  const { error } = await supabase
    .from('user_settings')
    .upsert({ user_id: user.id, settings })
  
  if (error) {
    console.error('Settings sync failed:', error)
    // Fallback to localStorage
  }
}
```

## Settings Migration

### Version Compatibility
```typescript
const migrateSettings = (stored: any): UserSettings => {
  // Remove deprecated settings
  const { preferredUnits, defaultTasteMode, ...validSettings } = stored
  
  // Add new settings with defaults
  if (!validSettings.homeCafeEquipment) {
    validSettings.homeCafeEquipment = {
      grinder: '',
      brewingMethod: '',
      scale: '',
      kettle: '',
      other: []
    }
  }
  
  return { ...defaultSettings, ...validSettings }
}
```

## Best Practices

### 1. Equipment Entry UX
- **Placeholder Examples**: Show popular equipment for guidance
- **Auto-complete**: Suggest based on common coffee equipment
- **Validation**: Ensure reasonable input lengths
- **Real-time Save**: No manual save buttons required

### 2. Equipment Organization
- **Essential First**: Core brewing equipment prominently placed
- **Flexible Additional**: Dynamic list for various user needs
- **Clear Categories**: Logical grouping by brewing stage

### 3. Integration Preparation
- **Forward Compatibility**: Equipment data ready for workflow integration
- **Standardized Format**: Consistent naming and categorization
- **Extensible Structure**: Easy to add new equipment types

### 4. User Guidance
- **Context Help**: Brief explanations for equipment purposes
- **Industry Standards**: Default to metric units and common practices
- **Progressive Disclosure**: Advanced options available but not overwhelming

## Troubleshooting

### Common Issues

**Equipment Not Appearing in Brewing Setup**:
1. Check settings are properly saved (localStorage)
2. Verify equipment field names match integration code
3. Ensure brewing mode correctly accesses user settings

**Settings Lost on Page Refresh**:
1. Verify localStorage permissions in browser
2. Check for JSON parsing errors in saved data
3. Ensure settings key consistency across components

**Equipment List Performance**:
1. Implement virtualization for large equipment lists
2. Debounce auto-save operations
3. Use React.memo for equipment item components

## Future Enhancements

### Equipment Features
- **Photo Upload**: Visual equipment identification
- **Specifications**: Detailed equipment parameters
- **Recommendations**: AI-powered equipment suggestions
- **Reviews**: User equipment reviews and ratings

### Workflow Integration
- **Recipe Templates**: Equipment-specific brewing guides
- **Parameter Optimization**: Equipment-aware parameter suggestions
- **Usage Tracking**: Equipment usage statistics and insights
- **Maintenance Reminders**: Cleaning and calibration schedules

---

This settings system provides a solid foundation for user customization while maintaining simplicity and industry relevance.