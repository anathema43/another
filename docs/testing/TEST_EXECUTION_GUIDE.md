# 🚀 Test Execution Guide - Complete Testing Workflow

## 🎯 **Overview**

This guide provides step-by-step instructions for executing the complete test suite for the Darjeeling Souls e-commerce platform, including unit tests, integration tests, and E2E tests.

---

## 📋 **Prerequisites**

### **Before Running Tests**
```bash
# Ensure development environment is set up
npm install

# Start development server (for E2E tests)
npm run dev

# Optional: Start Firebase emulators (for integration tests)
firebase emulators:start --only firestore,auth
```

---

## 🧪 **Unit Test Execution**

### **Run All Unit Tests**
```bash
# Complete unit test suite
npm run test

# With coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### **Run Specific Test Categories**
```bash
# Store logic tests
npm run test:stores
npm run test src/store/__tests__/

# Component tests
npm run test:components
npm run test src/components/__tests__/

# Service tests
npm run test:services
npm run test src/services/__tests__/

# Utility tests
npm run test:utils
npm run test src/utils/__tests__/
```

### **Run Critical Feature Tests**
```bash
# Cart persistence tests
npm run test src/components/__tests__/CartPersistence.test.jsx

# Wishlist functionality tests
npm run test src/components/__tests__/WishlistFunctionality.test.jsx

# Authentication routing tests
npm run test src/components/__tests__/AuthenticationRouting.test.jsx

# Checkout button tests
npm run test src/components/__tests__/CheckoutButton.test.jsx

# Security validation tests
npm run test src/components/__tests__/SecurityValidation.test.js
```

---

## 🌐 **E2E Test Execution**

### **Run All E2E Tests**
```bash
# Complete E2E test suite (headless)
npm run cy:run

# Interactive mode (with browser)
npm run cy:open
```

### **Run Critical User Journey Tests**
```bash
# Essential user flows
npm run cy:run:critical

# Specific test files
npm run cy:run --spec "cypress/e2e/01-authentication.cy.js"
npm run cy:run --spec "cypress/e2e/02-product-browsing.cy.js"
npm run cy:run --spec "cypress/e2e/03-shopping-cart.cy.js"
npm run cy:run --spec "cypress/e2e/04-checkout-process.cy.js"
```

### **Run Persistence Tests**
```bash
# Cart and wishlist persistence
npm run cy:run:persistence

# Specific persistence tests
npm run cy:run --spec "cypress/e2e/cart-persistence.cy.js"
npm run cy:run --spec "cypress/e2e/wishlist-persistence.cy.js"
npm run cy:run --spec "cypress/e2e/authentication-routing.cy.js"
```

### **Run Specialized Test Suites**
```bash
# Security testing
npm run cy:run --spec "cypress/e2e/13-security-testing.cy.js"

# Search functionality
npm run cy:run --spec "cypress/e2e/18-algolia-search.cy.js"

# Cultural content
npm run cy:run --spec "cypress/e2e/17-artisan-cultural-content.cy.js"

# Real-time features
npm run cy:run --spec "cypress/e2e/12-real-time-features.cy.js"
```

---

## 🔧 **Test Configuration**

### **Environment Setup**
```bash
# Test environment variables
CYPRESS_baseUrl=http://localhost:5173
CYPRESS_defaultCommandTimeout=10000
CYPRESS_requestTimeout=10000
CYPRESS_responseTimeout=10000
```

### **Test Data Management**
```bash
# Reset test data before tests
npm run test:reset-data

# Seed test data
npm run test:seed-data

# Clean up after tests
npm run test:cleanup
```

---

## 📊 **Test Results Interpretation**

### **Unit Test Results**
```bash
# Successful unit test output:
✓ src/store/__tests__/cartStore.test.js (15 tests)
✓ src/components/__tests__/ProductCard.test.jsx (8 tests)
✓ src/utils/__tests__/formatCurrency.test.js (6 tests)

# Coverage summary:
Statements   : 95.2% ( 1234/1296 )
Branches     : 92.1% ( 456/495 )
Functions    : 94.8% ( 234/247 )
Lines        : 95.5% ( 1198/1254 )
```

### **E2E Test Results**
```bash
# Successful E2E test output:
✓ Authentication flow (5 tests)
✓ Product browsing (8 tests)
✓ Shopping cart (12 tests)
✓ Checkout process (6 tests)

# Test summary:
Passing: 31
Failing: 0
Duration: 2m 45s
```

---

## 🆘 **Troubleshooting Test Failures**

### **Common Unit Test Issues**

#### **"Firebase not available in tests"**
```bash
# Solution: Check Firebase mocks
vi.mock('../firebase/firebase', () => ({
  db: {},
  auth: { currentUser: null }
}));
```

#### **"Store state not updating"**
```bash
# Solution: Reset store state in beforeEach
beforeEach(() => {
  useCartStore.setState({ cart: [], loading: false, error: null });
});
```

#### **"Component not rendering"**
```bash
# Solution: Wrap with required providers
render(
  <BrowserRouter>
    <Component />
  </BrowserRouter>
);
```

### **Common E2E Test Issues**

#### **"Element not found"**
```bash
# Solution: Check data-cy attributes
cy.get('[data-cy="element-name"]').should('exist');

# Debug: Wait for element
cy.get('[data-cy="element-name"]', { timeout: 10000 }).should('be.visible');
```

#### **"Authentication not working"**
```bash
# Solution: Use proper test user creation
cy.createTestUser('test@example.com', 'password123', 'Test User');
cy.loginUser('test@example.com', 'password123');
```

#### **"Firebase permissions error"**
```bash
# Solution: Check Firestore rules
# Ensure test collections have proper read/write permissions
```

---

## 🎯 **Test Execution Workflow**

### **Daily Development Testing**
```bash
# 1. Start development server
npm run dev

# 2. Run unit tests in watch mode
npm run test:watch

# 3. Run critical E2E tests
npm run cy:run:critical

# 4. Fix any failing tests immediately
```

### **Feature Development Testing**
```bash
# 1. Write tests for new feature
# 2. Run tests to ensure they fail (TDD)
npm run test src/components/__tests__/NewFeature.test.jsx

# 3. Implement feature
# 4. Run tests to ensure they pass
npm run test src/components/__tests__/NewFeature.test.jsx

# 5. Run related E2E tests
npm run cy:run --spec "cypress/e2e/new-feature.cy.js"
```

### **Pre-deployment Testing**
```bash
# 1. Run complete test suite
npm run test:all

# 2. Run all E2E tests
npm run cy:run

# 3. Check coverage reports
npm run test:coverage

# 4. Run security tests
npm run test:security

# 5. Run performance tests
npm run test:performance
```

---

## 📈 **Test Metrics and Reporting**

### **Coverage Reports**
```bash
# Generate HTML coverage report
npm run test:coverage

# View coverage report
open coverage/index.html

# Coverage by file type
npm run test:coverage:stores
npm run test:coverage:components
npm run test:coverage:services
```

### **E2E Test Reports**
```bash
# Generate E2E test report
npm run cy:run --reporter mochawesome

# View E2E report
open cypress/reports/mochawesome.html

# Screenshots and videos
ls cypress/screenshots/
ls cypress/videos/
```

---

## 🔄 **Continuous Integration Testing**

### **GitHub Actions Integration**
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:coverage
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm run cy:run
```

### **Quality Gates**
```bash
# Tests must pass before merge
Required Checks:
├── Unit Tests: >90% coverage
├── E2E Tests: All critical paths pass
├── Security Tests: Zero high-severity issues
├── Performance Tests: Lighthouse >85
└── Accessibility Tests: WCAG 2.1 AA compliance
```

---

## 🏆 **Test Success Criteria**

### **All Tests Pass When:**
- ✅ **Authentication**: Login/signup routing works correctly
- ✅ **Cart Persistence**: User isolation and real-time sync functional
- ✅ **Wishlist**: Authentication required and persistence works
- ✅ **Checkout**: Button appears and calculations accurate
- ✅ **Security**: No vulnerabilities detected
- ✅ **Performance**: Meets Core Web Vitals targets
- ✅ **Mobile**: Complete mobile functionality
- ✅ **Search**: Instant search and autocomplete working
- ✅ **Cultural Content**: Artisan profiles and stories display
- ✅ **Email**: Notifications send successfully
- ✅ **Payment**: Razorpay integration functional

### **Deployment Ready Checklist**
- [ ] All unit tests pass (>90% coverage)
- [ ] All E2E tests pass (critical paths)
- [ ] Security tests pass (zero high-severity issues)
- [ ] Performance tests pass (Lighthouse >85)
- [ ] Accessibility tests pass (WCAG 2.1 AA)
- [ ] Mobile tests pass (responsive design)
- [ ] Real-time features work (cross-tab sync)
- [ ] Payment integration tested (test transactions)

---

## 📞 **Getting Help with Tests**

### **Test Debugging**
```bash
# Debug failing unit tests
npm run test -- --reporter=verbose

# Debug E2E tests interactively
npm run cy:open

# Check test logs
cat cypress/logs/test.log
```

### **Common Solutions**
```bash
# Clear test cache
npm run test:clear-cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reset test database
npm run test:reset-db
```

### **Support Resources**
- **Vitest Documentation**: [vitest.dev](https://vitest.dev)
- **Cypress Documentation**: [cypress.io](https://cypress.io)
- **Testing Library**: [testing-library.com](https://testing-library.com)

**This comprehensive test execution guide ensures reliable, repeatable testing across all aspects of the Darjeeling Souls e-commerce platform.**