# ❤️ Wishlist Functionality Testing Guide

## 🎯 **Overview**

This guide covers comprehensive testing for wishlist functionality, ensuring that wishlists work correctly with user authentication, persistence, and real-time synchronization.

---

## 📋 **What Wishlist Tests Cover**

### **Authentication Integration Testing**
- Wishlist requires user authentication
- Redirects to login when not authenticated
- Proper user isolation between accounts
- Wishlist persists across sessions

### **Real-time Synchronization Testing**
- Wishlist updates sync across browser tabs
- Adding/removing items syncs instantly
- Firebase onSnapshot listeners work correctly
- Cross-device synchronization

### **UI Component Testing**
- Heart icon states (empty/filled)
- Wishlist button functionality
- Wishlist page display
- Empty state handling

### **Data Persistence Testing**
- Wishlist saves to Firebase correctly
- User-specific wishlist isolation
- Wishlist restoration after login
- Error handling for Firebase issues

---

## 🧪 **Unit Tests (Vitest)**

### **Running Wishlist Unit Tests**
```bash
# Run all wishlist tests
npm run test src/components/__tests__/WishlistFunctionality.test.jsx

# Run with coverage
npm run test:coverage src/components/__tests__/WishlistFunctionality.test.jsx

# Watch mode for development
npm run test:watch src/components/__tests__/WishlistFunctionality.test.jsx
```

### **Test Categories**

#### **1. Wishlist Button Component Tests**
```javascript
describe('Wishlist Button Component', () => {
  it('should show empty heart when product not in wishlist', () => {
    // Render WishlistButton with product not in wishlist
    // Verify empty heart icon appears
    // Verify "Add to wishlist" tooltip
  });

  it('should show filled heart when product is in wishlist', () => {
    // Set product in wishlist state
    // Render WishlistButton
    // Verify filled heart icon appears
    // Verify "Remove from wishlist" tooltip
  });

  it('should redirect to login when not authenticated', () => {
    // Set unauthenticated state
    // Click wishlist button
    // Verify redirect to login page
  });
});
```

#### **2. Wishlist Store Tests**
```javascript
describe('Wishlist Store Operations', () => {
  it('should add product to wishlist', () => {
    // Call addToWishlist with product ID
    // Verify product added to wishlist array
    // Verify isInWishlist returns true
  });

  it('should remove product from wishlist', () => {
    // Add product to wishlist
    // Call removeFromWishlist
    // Verify product removed from array
  });

  it('should not add duplicate products', () => {
    // Add same product twice
    // Verify only one instance in wishlist
  });
});
```

#### **3. Real-time Synchronization Tests**
```javascript
describe('Real-time Synchronization', () => {
  it('should sync wishlist across browser tabs', () => {
    // Mock Firebase onSnapshot
    // Simulate wishlist update from another tab
    // Verify state updates in current tab
  });

  it('should handle Firebase errors gracefully', () => {
    // Mock Firebase error
    // Verify error handling doesn't break wishlist
  });
});
```

---

## 🌐 **E2E Tests (Cypress)**

### **Running Wishlist E2E Tests**
```bash
# Run wishlist E2E tests
npm run cy:run --spec "cypress/e2e/wishlist-persistence.cy.js"

# Run interactively
npm run cy:open
# Then select wishlist-persistence.cy.js
```

### **E2E Test Scenarios**

#### **1. Wishlist User Isolation**
```javascript
it('should isolate wishlist data between users', () => {
  // User 1: Add items to wishlist
  cy.visit('/signup');
  cy.get('[data-cy="signup-name"]').type('Wishlist User One');
  // ... complete signup and add to wishlist
  
  // User 2: Sign up and check empty wishlist
  // User 1: Sign back in and verify wishlist restored
});
```

#### **2. Wishlist Button Functionality**
```javascript
it('should add and remove items from wishlist', () => {
  cy.loginAsUser();
  cy.visit('/shop');
  
  // Add to wishlist
  cy.get('[data-cy="wishlist-button"]').first().click();
  cy.get('[data-cy="wishlist-count"]').should('contain', '1');
  
  // Remove from wishlist
  cy.get('[data-cy="wishlist-button"]').first().click();
  cy.get('[data-cy="wishlist-count"]').should('not.exist');
});
```

#### **3. Wishlist Page Functionality**
```javascript
it('should display wishlist items correctly', () => {
  // Add items to wishlist
  // Visit wishlist page
  cy.visit('/wishlist');
  cy.get('[data-cy="wishlist-item"]').should('have.length', 2);
  
  // Test remove functionality
  cy.get('[data-cy="remove-from-wishlist"]').first().click();
  cy.get('[data-cy="wishlist-item"]').should('have.length', 1);
});
```

#### **4. Authentication Required Tests**
```javascript
it('should redirect to login when accessing wishlist without auth', () => {
  cy.visit('/wishlist');
  cy.get('h2').should('contain', 'Please login to view your wishlist');
});

it('should redirect to login when clicking wishlist button without auth', () => {
  cy.visit('/shop');
  cy.get('[data-cy="wishlist-button"]').first().click();
  cy.url().should('include', '/login');
});
```

---

## 🔧 **Test Configuration**

### **Cypress Custom Commands**
```javascript
// cypress/support/commands.js
Cypress.Commands.add('loginAsUser', () => {
  cy.visit('/login');
  cy.get('[data-cy="login-email"]').type('test@example.com');
  cy.get('[data-cy="login-password"]').type('password123');
  cy.get('[data-cy="login-submit"]').click();
});

Cypress.Commands.add('addToWishlist', (productName) => {
  cy.visit('/shop');
  cy.contains('[data-cy="product-card"]', productName).within(() => {
    cy.get('[data-cy="wishlist-button"]').click();
  });
});
```

### **Mock Data for Testing**
```javascript
const mockWishlistData = {
  productIds: ['product-1', 'product-2', 'product-3'],
  updatedAt: new Date().toISOString()
};

const mockUsers = {
  user1: { uid: 'user1', email: 'user1@test.com' },
  user2: { uid: 'user2', email: 'user2@test.com' }
};
```

---

## 📊 **Test Coverage Metrics**

### **Wishlist Test Coverage Goals**
- **Component Tests**: 95% coverage
- **Store Logic Tests**: 90% coverage
- **Integration Tests**: 85% coverage
- **E2E User Journeys**: 90% coverage

### **Critical Test Scenarios**
- [ ] **User Isolation**: Different users have separate wishlists
- [ ] **Authentication**: Login required for wishlist access
- [ ] **Persistence**: Wishlist survives browser sessions
- [ ] **Real-time Sync**: Updates sync across tabs
- [ ] **UI States**: Heart icon shows correct state
- [ ] **Error Handling**: Graceful Firebase error handling

---

## 🆘 **Troubleshooting Wishlist Tests**

### **Common Issues**

#### **"Wishlist button not found"**
```bash
# Solution: Check data-cy attributes
cy.get('[data-cy="wishlist-button"]').should('exist');

# Debug: Log all buttons
cy.get('button').then(($buttons) => {
  console.log('Found buttons:', $buttons.length);
});
```

#### **"Firebase permissions error"**
```bash
# Solution: Check Firestore rules
# Ensure wishlists collection allows user access:
match /wishlists/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

#### **"Real-time sync not working"**
```bash
# Solution: Mock onSnapshot correctly
vi.mock('firebase/firestore', () => ({
  onSnapshot: vi.fn((docRef, callback) => {
    callback(mockDoc);
    return vi.fn(); // unsubscribe function
  })
}));
```

#### **"User isolation failing"**
```bash
# Solution: Ensure proper user switching in tests
useAuthStore.setState({ currentUser: mockUser1 });
useWishlistStore.setState({ wishlist: [] }); // Reset for new user
```

---

## 🎯 **Test Execution Workflow**

### **Development Workflow**
```bash
# 1. Start development server
npm run dev

# 2. Run unit tests in watch mode
npm run test:watch src/components/__tests__/WishlistFunctionality.test.jsx

# 3. Run E2E tests when ready
npm run cy:open

# 4. Select and run wishlist-persistence.cy.js
```

### **CI/CD Integration**
```bash
# Tests run automatically on:
# - Every commit
# - Pull requests
# - Before deployment

# Manual test execution
npm run test:persistence
npm run cy:run:persistence
```

---

## 📈 **Success Criteria**

### **Wishlist Tests Pass When:**
- ✅ Users have completely separate wishlists
- ✅ Authentication is properly enforced
- ✅ Heart icons show correct states
- ✅ Wishlist page displays items correctly
- ✅ Real-time synchronization works
- ✅ Error handling is graceful
- ✅ Empty states display appropriately

### **Test Failure Indicators:**
- ❌ Users see each other's wishlist items
- ❌ Wishlist accessible without authentication
- ❌ Heart icons show wrong states
- ❌ Real-time sync not working
- ❌ Firebase errors crash the app

---

## 🔄 **Continuous Testing**

### **During Development**
```bash
# Run tests after making wishlist changes
npm run test src/components/__tests__/WishlistFunctionality.test.jsx

# Test in browser
npm run cy:run --spec "cypress/e2e/wishlist-persistence.cy.js"
```

### **Before Deployment**
```bash
# Run complete wishlist test suite
npm run test:persistence

# Verify all wishlist functionality
npm run cy:run:persistence
```

**This comprehensive testing ensures wishlist functionality works reliably across all user scenarios, authentication states, and real-time synchronization requirements.**