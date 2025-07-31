# CupNote E2E Testing Suite

Comprehensive end-to-end testing suite for CupNote application using Playwright.

## 📁 Test Structure

```
e2e/
├── auth.spec.ts              # Authentication flow tests
├── coffee-record.spec.ts     # Coffee recording flow tests
├── search-filter.spec.ts     # Search and filter functionality tests
├── achievements.spec.ts      # Achievement system tests
├── pwa.spec.ts              # PWA features tests
├── pages/                   # Page Object Model classes
│   ├── BasePage.ts          # Base page with common functionality
│   ├── AuthPage.ts          # Authentication modal interactions
│   ├── CoffeeRecordPage.ts  # Coffee recording flow
│   ├── SearchFilterPage.ts  # Search and filter operations
│   ├── AchievementPage.ts   # Achievement system interactions
│   └── PWAPage.ts           # PWA features testing
├── utils/                   # Test utilities and helpers
│   └── TestHelpers.ts       # Common test helper functions
├── fixtures/                # Test data and assets
│   ├── TestData.ts          # Test data fixtures
│   └── test-images/         # Test image files
├── global-setup.ts          # Global test setup
├── global-teardown.ts       # Global test cleanup
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- CupNote application running locally

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

### Running Tests

#### All Tests
```bash
npm run e2e
```

#### Specific Test Suites
```bash
# Authentication tests only
npx playwright test auth

# Coffee recording tests only
npx playwright test coffee-record

# Search and filter tests only
npx playwright test search-filter

# Achievement system tests only
npx playwright test achievements

# PWA features tests only
npx playwright test pwa
```

#### Interactive Mode
```bash
npm run e2e:ui
```

#### Headed Mode (see browser)
```bash
npm run e2e:headed
```

#### Specific Browser
```bash
# Chrome only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# Safari only
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project="Mobile Chrome"

# Mobile Safari
npx playwright test --project="Mobile Safari"
```

## 📋 Test Categories

### 1. Authentication Flow (`auth.spec.ts`)
- **User Registration**: Email/password validation, duplicate handling
- **User Login**: Credential validation, error handling
- **Session Management**: Persistence, expiration, logout
- **Protected Routes**: Access control, redirects
- **Mobile Experience**: Responsive design, touch interactions
- **Accessibility**: Keyboard navigation, screen reader support

### 2. Coffee Recording Flow (`coffee-record.spec.ts`)
- **Mode Selection**: Cafe, HomeCafe, Lab modes
- **4-Step Process**: Coffee info, roaster notes, personal tasting, review
- **Data Validation**: Required fields, format validation
- **Image Upload**: File handling, error scenarios
- **Data Persistence**: Navigation, browser refresh
- **Achievement Triggers**: First record achievement
- **Mobile Experience**: Touch interactions, responsive forms

### 3. Search and Filter (`search-filter.spec.ts`)
- **Real-time Search**: Debouncing, performance
- **Multi-tag Filtering**: Tag selection, removal
- **Sort Options**: Date, rating, match score
- **Complex Queries**: Multiple criteria combinations
- **Performance**: Large datasets, pagination
- **Mobile Experience**: Touch-friendly filters
- **Accessibility**: Keyboard navigation, announcements

### 4. Achievement System (`achievements.spec.ts`)
- **Progress Tracking**: Visual progress bars, real-time updates
- **Achievement Unlocking**: Notification system, badge display
- **Categories**: Milestone, exploration, quality, consistency, special
- **Level System**: Point calculation, level progression
- **Statistics Display**: User stats dashboard
- **Mobile Experience**: Achievement grid, notifications

### 5. PWA Features (`pwa.spec.ts`)
- **Service Worker**: Registration, updates, caching
- **Offline Mode**: Offline detection, cached content
- **Background Sync**: Offline data synchronization
- **Install Prompt**: A2HS functionality
- **Cache Management**: Storage, cleanup
- **Mobile Features**: Native app-like behavior

## 🎭 Page Object Model

The test suite uses the Page Object Model pattern for maintainability:

### BasePage
- Common functionality across all pages
- Navigation helpers
- Wait strategies
- Assertion helpers
- Mobile/accessibility testing utilities

### Specialized Pages
- **AuthPage**: Authentication modal interactions
- **CoffeeRecordPage**: Multi-step recording flow
- **SearchFilterPage**: Search and filtering operations
- **AchievementPage**: Achievement system interactions
- **PWAPage**: PWA features and offline functionality

## 🛠️ Test Utilities

### TestHelpers Class
- **Data Generation**: Dynamic test data creation
- **User Management**: Test user setup and cleanup
- **Network Simulation**: Offline/slow network testing
- **Performance Monitoring**: Load time measurements
- **Accessibility Testing**: Basic a11y checks
- **Visual Regression**: Screenshot comparisons

### Test Fixtures
- **User Data**: Valid/invalid user credentials
- **Coffee Data**: Sample coffee records for different scenarios
- **Search Queries**: Various search terms and filters
- **Error Scenarios**: Network errors, validation errors
- **Performance Thresholds**: Acceptable load times

## 📊 Reporting

Tests generate multiple report formats:

- **HTML Report**: `playwright-report/index.html` (interactive)
- **JSON Report**: `e2e/reports/test-results.json` (CI integration)
- **JUnit Report**: `e2e/reports/test-results.xml` (CI integration)
- **Screenshots**: `e2e/screenshots/` (failure evidence)
- **Videos**: `e2e/test-results/` (failure recordings)

## 🌐 Cross-Browser Testing

Tests run across multiple browsers and devices:

### Desktop Browsers
- **Chromium** (Chrome/Edge-based)
- **Firefox**
- **WebKit** (Safari-based)

### Mobile Devices
- **Mobile Chrome** (Pixel 5 simulation)
- **Mobile Safari** (iPhone 12 simulation)

### CI Environment
- Additional Edge browser testing in CI

## 📱 Mobile Testing

Comprehensive mobile testing includes:

- **Responsive Design**: Layout adaptation
- **Touch Interactions**: Tap, swipe, pinch gestures
- **Mobile Navigation**: Bottom nav, hamburger menus
- **Device Features**: Orientation, network switching
- **Performance**: Mobile-specific performance thresholds

## ♿ Accessibility Testing

Built-in accessibility testing covers:

- **Keyboard Navigation**: Tab order, focus management
- **Screen Reader Support**: ARIA labels, live regions
- **Color Contrast**: Minimum contrast ratios
- **Focus Indicators**: Visible focus states
- **Semantic HTML**: Proper heading hierarchy

## 🚀 Performance Testing

Performance testing includes:

- **Page Load Times**: Core Web Vitals
- **Interaction Response**: Click-to-paint times
- **Search Performance**: Query response times
- **Image Upload**: File processing times
- **Mobile Performance**: 3G network simulation

## 🔄 CI/CD Integration

The test suite is designed for CI/CD pipelines:

### Environment Variables
```bash
BASE_URL=https://your-app.com  # Application URL
CI=true                        # Enables CI-specific settings
```

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm run e2e
    
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## 🐛 Debugging Tests

### Local Debugging
```bash
# Run with browser visible
npm run e2e:headed

# Run in debug mode (step through)
npx playwright test --debug

# Run specific test with trace
npx playwright test auth.spec.ts --trace on
```

### CI Debugging
- Check HTML reports in CI artifacts
- Download screenshots and videos
- Review trace files for failed tests

## 📝 Writing New Tests

### Best Practices

1. **Use Page Objects**: Encapsulate page interactions
2. **Independent Tests**: Each test should be self-contained
3. **Clear Naming**: Descriptive test and method names
4. **Wait Strategies**: Use appropriate wait conditions
5. **Data Cleanup**: Clean up test data after tests
6. **Error Handling**: Test both success and failure paths

### Example Test Structure
```typescript
test.describe('Feature Name', () => {
  let featurePage: FeaturePage

  test.beforeEach(async ({ page }) => {
    featurePage = new FeaturePage(page)
    await featurePage.goto('/feature')
  })

  test('should perform basic action', async () => {
    await featurePage.performAction()
    await featurePage.expectResult()
  })

  test('should handle error scenarios', async () => {
    await featurePage.triggerError()
    await featurePage.expectErrorMessage()
  })
})
```

## 🔧 Configuration

Test configuration is in `playwright.config.ts`:

- **Timeouts**: Action, navigation, and test timeouts
- **Browsers**: Enabled browsers and devices
- **Reporters**: Output formats and locations
- **Global Setup/Teardown**: Environment preparation
- **Web Server**: Local development server configuration

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debugging)
- [CI Integration](https://playwright.dev/docs/ci)

## 🤝 Contributing

When adding new tests:

1. Follow existing patterns and conventions
2. Add appropriate page objects for new functionality
3. Include both positive and negative test scenarios
4. Test across mobile and desktop viewports
5. Include accessibility and performance considerations
6. Update this README with new test descriptions

## 📄 License

This test suite is part of the CupNote project and follows the same license terms.