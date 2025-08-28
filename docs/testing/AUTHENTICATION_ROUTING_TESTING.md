# 🔐 Authentication Routing Testing Guide

## 🎯 **Overview**

This guide covers comprehensive testing for authentication routing, ensuring that login/signup flows work correctly and users are redirected appropriately after authentication.

---

## 📋 **What Authentication Routing Tests Cover**

### **Login Routing Testing**
- Redirect to home page after successful login
- Redirect to saved path after login (if user tried to access protected route)
- Admin users redirect to admin panel
- Stay on login page when login fails
- Handle various error scenarios

### **Signup Routing Testing**
- Redirect to home page after successful signup
- Stay on signup page when signup fails
- Form validation prevents submission
- Password confirmation validation

### **Protected Route Testing**
- Save redirect path when accessing protected routes
- Clear redirect path after successful authentication
- Proper handling of authentication state

### **Session Management Testing**
- Authentication state persists across page refreshes
- Logout clears authentication state
- Session handling across browser tabs

---

## 🧪 **Unit Tests (Vitest)**

### **Running Authentication Routing Unit Tests**
```bash
# Run all authentication routing tests
npm run test src/components/__tests__/AuthenticationRouting.test.jsx

# Run with coverage
npm run test:coverage src/components/__tests__/AuthenticationRouting.test.jsx

# Watch mode for development
npm run test:watch src/components/__tests__/AuthenticationRouting.test.jsx
```

### **Test Categories**

#### **1. Login Routing Tests**
```javascript
describe('Login Routing', () => {
  it('should redirect to home page after successful login', async () => {
    // Mock successful Firebase login
    // Submit login form
    // Verify navigation to home page
  });

  it('should redirect to saved path after login', async () => {
    // Mock saved redirect path
    // Complete login
    // Verify redirect to originally requested page
  });

  it('should redirect admin users to admin panel', async () => {
    // Mock admin user login
    // Verify redirect to /admin
  });

  it('should stay on login page when login fails', async () => {
    // Mock login failure
    // Submit form
    // Verify stays on login page
    // Verify error message displayed
  });
});
```

#### **2. Signup Routing Tests**
```javascript
describe('Signup Routing', () => {
  it('should redirect to home page after successful signup', async () => {
    // Mock successful Firebase signup
    // Submit signup form
    // Verify navigation to home page
  });

  it('should stay on signup page when signup fails', async () => {
    // Mock signup failure
    // Submit form
    // Verify stays on signup page
    // Verify error message displayed
  });

  it('should validate form before attempting signup', async () => {
    // Submit empty form
    // Verify validation errors
    // Verify no navigation occurs
  });
});
```

#### **3. Redirect Path Management Tests**
```javascript
describe('Redirect Path Management', () => {
  it('should save redirect path when accessing protected route', () => {
    // Mock accessing protected route without auth
    // Verify redirect path is saved
  });

  it('should clear redirect path after successful authentication', () => {
    // Mock saved redirect path
    // Complete authentication
    // Verify redirect path is cleared
  });
});
```

---

## 🌐 **E2E Tests (Cypress)**

### **Running Authentication Routing E2E Tests**
```bash
# Run authentication routing E2E tests
npm run cy:run --spec "cypress/e2e/authentication-routing.cy.js"

# Run interactively
npm run cy:open
# Then select authentication-routing.cy.js
```

### **E2E Test Scenarios**

#### **1. Login Flow Testing**
```javascript
it('should redirect to home page after successful login', () => {
  // Create user account first
  cy.visit('/signup');
  cy.get('[data-cy="signup-name"]').type('Login Test User');
  cy.get('[data-cy="signup-email"]').type('logintest@example.com');
  cy.get('[data-cy="signup-password"]').type('password123');
  cy.get('[data-cy="signup-confirm-password"]').type('password123');
  cy.get('[data-cy="signup-submit"]').click();
  
  // Should redirect to home after signup
  cy.url().should('eq', Cypress.config().baseUrl + '/#/');
  
  // Sign out and test login
  cy.get('[data-cy="logout-button"]').click();
  cy.visit('/login');
  cy.get('[data-cy="login-email"]').type('logintest@example.com');
  cy.get('[data-cy="login-password"]').type('password123');
  cy.get('[data-cy="login-submit"]').click();
  
  // Should redirect to home page
  cy.url().should('eq', Cypress.config().baseUrl + '/#/');
});
```

#### **2. Saved Path Redirect Testing**
```javascript
it('should redirect to saved path after login', () => {
  // Try to access protected route (should save redirect path)
  cy.visit('/checkout');
  cy.url().should('include', '/login');
  
  // Login
  cy.get('[data-cy="login-email"]').type('redirect@example.com');
  cy.get('[data-cy="login-password"]').type('password123');
  cy.get('[data-cy="login-submit"]').click();
  
  // Should redirect to originally requested page
  cy.url().should('include', '/checkout');
});
```

#### **3. Admin User Routing**
```javascript
it('should handle admin user routing', () => {
  // Login as admin user
  cy.visit('/login');
  cy.get('[data-cy="login-email"]').type('admin@test.com');
  cy.get('[data-cy="login-password"]').type('adminpassword');
  cy.get('[data-cy="login-submit"]').click();
  
  // Admin users should go to admin panel
  cy.url().should('include', '/admin');
});
```

#### **4. Form Validation Testing**
```javascript
it('should validate form before attempting signup', () => {
  cy.visit('/signup');
  
  // Submit empty form
  cy.get('[data-cy="signup-submit"]').click();
  
  // Should show validation errors
  cy.contains('Full name is required').should('be.visible');
  cy.contains('Email is required').should('be.visible');
  cy.contains('Password is required').should('be.visible');
  
  // Should not navigate
  cy.url().should('include', '/signup');
});
```

---

## 🔧 **Test Data Setup**

### **Mock Authentication Data**
```javascript
const mockUsers = {
  customer: {
    uid: 'customer-123',
    email: 'customer@test.com',
    displayName: 'Test Customer',
    role: 'customer'
  },
  admin: {
    uid: 'admin-123',
    email: 'admin@test.com',
    displayName: 'Test Admin',
    role: 'admin'
  }
};

const mockAuthResponses = {
  loginSuccess: {
    user: mockUsers.customer,
    userProfile: { role: 'customer' }
  },
  loginFailure: new Error('Invalid credentials'),
  signupSuccess: {
    user: mockUsers.customer,
    userProfile: { role: 'customer' }
  }
};
```

### **Cypress Custom Commands**
```javascript
// cypress/support/commands.js
Cypress.Commands.add('createTestUser', (email, password, name) => {
  cy.visit('/signup');
  cy.get('[data-cy="signup-name"]').type(name);
  cy.get('[data-cy="signup-email"]').type(email);
  cy.get('[data-cy="signup-password"]').type(password);
  cy.get('[data-cy="signup-confirm-password"]').type(password);
  cy.get('[data-cy="signup-submit"]').click();
});

Cypress.Commands.add('loginUser', (email, password) => {
  cy.visit('/login');
  cy.get('[data-cy="login-email"]').type(email);
  cy.get('[data-cy="login-password"]').type(password);
  cy.get('[data-cy="login-submit"]').click();
});
```

---

## 📊 **Test Coverage Goals**

### **Authentication Routing Coverage**
- **Login Flow**: 95% coverage
- **Signup Flow**: 95% coverage
- **Redirect Logic**: 90% coverage
- **Error Handling**: 85% coverage

### **Critical Test Scenarios**
- [ ] **Login Success**: Redirects to home page
- [ ] **Signup Success**: Redirects to home page
- [ ] **Saved Path**: Redirects to originally requested page
- [ ] **Admin Routing**: Admin users go to admin panel
- [ ] **Login Failure**: Stays on login page with error
- [ ] **Signup Failure**: Stays on signup page with error
- [ ] **Form Validation**: Prevents invalid submissions

---

## 🆘 **Troubleshooting Authentication Tests**

### **Common Issues**

#### **"Navigation not working in tests"**
```bash
# Solution: Mock useNavigate properly
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});
```

#### **"Firebase auth not mocked"**
```bash
# Solution: Mock Firebase auth methods
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn()
}));
```

#### **"Redirect path not saving"**
```bash
# Solution: Mock redirect utilities
vi.mock('../../utils/redirectUtils', () => ({
  saveRedirectPath: vi.fn(),
  getAndClearRedirectPath: vi.fn(() => '/saved-path'),
  determineRedirectPath: vi.fn((profile, savedPath) => savedPath || '/')
}));
```

#### **"Authentication state not updating"**
```bash
# Solution: Update auth store state properly
useAuthStore.setState({ 
  currentUser: mockUser, 
  userProfile: mockProfile 
});
```

---

## 🎯 **Test Execution Commands**

### **Quick Validation**
```bash
# Test authentication routing quickly
npm run test src/components/__tests__/AuthenticationRouting.test.jsx

# Test in browser
npm run cy:run --spec "cypress/e2e/authentication-routing.cy.js"
```

### **Comprehensive Testing**
```bash
# Run all authentication tests
npm run test:auth

# Run all E2E authentication tests
npm run cy:run:auth
```

### **Development Testing**
```bash
# Watch mode for active development
npm run test:watch src/components/__tests__/AuthenticationRouting.test.jsx

# Interactive E2E testing
npm run cy:open
```

---

## 📈 **Expected Test Results**

### **All Tests Pass When:**
- ✅ Login redirects to home page
- ✅ Signup redirects to home page
- ✅ Saved paths work correctly
- ✅ Admin routing functions
- ✅ Error handling works
- ✅ Form validation prevents invalid submissions

### **Test Failure Indicators:**
- ❌ Users stay on auth pages after success
- ❌ Redirect paths not working
- ❌ Admin users don't reach admin panel
- ❌ Errors don't display properly
- ❌ Invalid forms submit successfully

---

## 🔄 **Continuous Testing**

### **During Development**
```bash
# Run tests after making auth changes
npm run test src/components/__tests__/AuthenticationRouting.test.jsx

# Test in browser
npm run cy:run --spec "cypress/e2e/authentication-routing.cy.js"
```

### **Before Deployment**
```bash
# Run complete authentication test suite
npm run test:auth

# Verify all authentication flows
npm run cy:run:auth
```

**This comprehensive testing ensures authentication routing works reliably across all user scenarios and provides a smooth user experience.**