# 🛒 Cart Persistence Testing Guide

## 🎯 **Overview**

This guide covers comprehensive testing for cart persistence functionality, ensuring that shopping carts work correctly across different users, sessions, and browser tabs.

---

## 📋 **What Cart Persistence Tests Cover**

### **User Isolation Testing**
- Different users have completely separate carts
- User A's cart items don't appear for User B
- When User A signs back in, their cart is restored
- Cart data is properly isolated in Firebase
- Tax calculation: 8% of subtotal
- Shipping calculation: Free over ₹500, otherwise ₹50
- Grand total: subtotal + tax + shipping

### **Real-time Synchronization Testing**
- Cart updates sync across browser tabs instantly
- Adding items in one tab shows in another tab
- Quantity changes sync in real-time
- Firebase onSnapshot listeners work correctly

### **Session Management Testing**
- Cart persists across browser sessions
- Cart survives page refreshes
- Cart is restored after login
- Guest cart migrates to authenticated user

### **UI Integration Testing**
- Checkout button appears when cart has items
- Cart calculations are accurate (subtotal, tax, shipping)
- Cart count displays correctly in navbar
- Empty cart shows appropriate message

---

## 🧪 **Unit Tests (Vitest)**

### **Running Cart Persistence Unit Tests**
```bash
# Run all cart persistence tests
npm run test src/components/__tests__/CartPersistence.test.jsx

# Run with coverage
npm run test:coverage src/components/__tests__/CartPersistence.test.jsx

# Watch mode for development
npm run test:watch src/components/__tests__/CartPersistence.test.jsx
```

### **Test Categories**

#### **1. User Isolation Tests**
```javascript
describe('User Isolation', () => {
  it('should isolate cart data between different users', () => {
    // User 1 adds items to cart
    // User 2 signs in - should have empty cart
    // User 1 signs back in - should restore their cart
  });

  it('should clear cart when user signs out', () => {
    // User adds items
    // User signs out
    // Cart should be cleared for security
  });
});
```

#### **2. Real-time Synchronization Tests**
```javascript
describe('Real-time Synchronization', () => {
  it('should sync cart across browser tabs', () => {
    // Simulate cart update from another tab
    // Verify cart state updates in current tab
  });

  it('should handle Firebase connection errors gracefully', () => {
    // Simulate Firebase error
    // Verify error handling doesn't break cart
  });
});
```

#### **3. Cart UI Integration Tests**
```javascript
describe('Cart UI Integration', () => {
  it('should show checkout button when cart has items', () => {
    // Add items to cart
    // Verify checkout button appears
    // Verify button links to /checkout
  });

  it('should calculate totals correctly', () => {
    // Add items with known prices
    // Verify subtotal, tax, shipping calculations
  });
});
```

---

## 🌐 **E2E Tests (Cypress)**

### **Running Cart Persistence E2E Tests**
```bash
# Run cart persistence E2E tests
npm run cy:run --spec "cypress/e2e/cart-persistence.cy.js"

# Run interactively
npm run cy:open
# Then select cart-persistence.cy.js
```

### **E2E Test Scenarios**

#### **1. User Cart Isolation**
```javascript
it('should isolate cart data between different users', () => {
  // User 1: Add items to cart
  cy.visit('/signup');
  cy.get('[data-cy="signup-name"]').type('User One');
  cy.get('[data-cy="signup-email"]').type('user1@test.com');
  // ... complete signup
  
  // Add products to cart
  cy.visit('/shop');
  cy.get('[data-cy="add-to-cart-button"]').first().click();
  cy.get('[data-cy="cart-count"]').should('contain', '1');
  
  // Sign out and sign in as different user
  // Verify cart isolation
});
```

#### **2. Cart Persistence Across Sessions**
```javascript
it('should persist cart across browser sessions', () => {
  // Add items to cart
  // Simulate browser refresh
  cy.reload();
  // Verify cart persists
});
```

#### **3. Checkout Button Functionality**
```javascript
it('should show checkout button when cart has items', () => {
  // Add items to cart
  cy.visit('/cart');
  cy.get('[data-cy="checkout-button"]').should('be.visible');
  cy.get('[data-cy="checkout-button"]').click();
  cy.url().should('include', '/checkout');
});
```

---

## 🔧 **Test Data Setup**

### **Mock Data for Testing**
```javascript
const mockCartData = {
  items: [
    { id: '1', name: 'Test Product 1', price: 299, quantity: 2 },
    { id: '2', name: 'Test Product 2', price: 499, quantity: 1 }
  ],
  updatedAt: new Date().toISOString()
};

const mockUsers = {
  user1: { uid: 'user1', email: 'user1@test.com' },
  user2: { uid: 'user2', email: 'user2@test.com' }
};
```

### **Firebase Emulator Setup**
```bash
# Start Firebase emulators for testing
firebase emulators:start --only firestore,auth

# Run tests against emulators
npm run test:firebase
```

---

## 📊 **Test Coverage Goals**

### **Cart Persistence Coverage**
- **User Isolation**: 100% coverage
- **Real-time Sync**: 95% coverage
- **Session Management**: 90% coverage
- **UI Integration**: 85% coverage

### **Success Criteria**
- [ ] Users have completely separate carts
- [ ] Cart persists across browser sessions
- [ ] Real-time sync works across tabs
- [ ] Checkout button appears when cart has items
- [ ] Cart calculations are accurate
- [ ] Error handling works gracefully

---

## 🆘 **Troubleshooting Cart Tests**

### **Common Issues**

#### **"Firebase not available in tests"**
```bash
# Solution: Mock Firebase properly
vi.mock('../firebase/firebase', () => ({
  db: {}
}));
```

#### **"Real-time listeners not working"**
```bash
# Solution: Mock onSnapshot correctly
vi.mock('firebase/firestore', () => ({
  onSnapshot: vi.fn((docRef, callback) => {
    // Simulate real-time update
    callback(mockDoc);
    return vi.fn(); // Return unsubscribe function
  })
}));
```

#### **"Cart state not updating"**
```bash
# Solution: Ensure proper state management
useCartStore.setState({ cart: mockCartData });
```

---

## 🎯 **Test Execution Commands**

### **Quick Validation**
```bash
# Test cart persistence quickly
npm run test src/components/__tests__/CartPersistence.test.jsx

# Test in browser
npm run cy:run --spec "cypress/e2e/cart-persistence.cy.js"
```

### **Comprehensive Testing**
```bash
# Run all persistence tests
npm run test:persistence

# Run all E2E persistence tests
npm run cy:run:persistence
```

### **Development Testing**
```bash
# Watch mode for active development
npm run test:watch src/components/__tests__/CartPersistence.test.jsx

# Interactive E2E testing
npm run cy:open
```

---

## 📈 **Expected Test Results**

### **All Tests Pass When:**
- ✅ Cart isolation between users works
- ✅ Real-time synchronization functions
- ✅ Checkout button appears correctly
- ✅ Cart calculations are accurate
- ✅ Session persistence works
- ✅ Error handling is graceful

### **Test Failure Indicators:**
- ❌ Users see each other's cart items
- ❌ Cart doesn't persist after refresh
- ❌ Checkout button missing
- ❌ Real-time sync not working
- ❌ Cart calculations incorrect

**This comprehensive test suite ensures cart persistence works reliably across all user scenarios and edge cases.**