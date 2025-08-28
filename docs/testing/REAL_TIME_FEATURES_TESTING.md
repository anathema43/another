# ⚡ Real-time Features Testing Guide

## 🎯 **Overview**

This guide covers comprehensive testing for real-time features including cart synchronization, wishlist updates, and cross-tab functionality using Firebase onSnapshot listeners.

---

## 📋 **What Real-time Features Tests Cover**

### **Cross-tab Synchronization Testing**
- Cart updates sync across browser tabs instantly
- Wishlist changes appear in all open tabs
- Inventory updates reflect in real-time
- User authentication state syncs across tabs

### **Firebase onSnapshot Testing**
- Firestore listeners work correctly
- Real-time updates trigger state changes
- Error handling for connection issues
- Proper cleanup of listeners

### **User Isolation Testing**
- Real-time updates are user-specific
- Users don't see other users' data
- Proper Firebase security rule enforcement
- Authentication-based data filtering

### **Performance Testing**
- Real-time updates don't cause performance issues
- Efficient listener management
- Proper memory cleanup
- Optimized re-rendering

---

## 🧪 **Unit Tests (Vitest)**

### **Running Real-time Features Unit Tests**
```bash
# Run all real-time feature tests
npm run test src/components/__tests__/RealTimeFeatures.test.jsx

# Run with coverage
npm run test:coverage src/components/__tests__/RealTimeFeatures.test.jsx

# Watch mode for development
npm run test:watch src/components/__tests__/RealTimeFeatures.test.jsx
```

### **Test Categories**

#### **1. Cart Real-time Synchronization Tests**
```javascript
describe('Cart Real-time Synchronization', () => {
  it('should sync cart across browser tabs', () => {
    const { onSnapshot } = require('firebase/firestore');
    let snapshotCallback;
    
    onSnapshot.mockImplementation((docRef, callback) => {
      snapshotCallback = callback;
      return vi.fn(); // mock unsubscribe
    });
    
    // Set up cart subscription
    const { subscribeToCart } = useCartStore.getState();
    subscribeToCart();
    
    // Simulate cart update from another tab
    const mockDoc = {
      exists: () => true,
      data: () => ({
        items: [
          { id: '1', name: 'Product 1', price: 299, quantity: 3 },
          { id: '2', name: 'Product 2', price: 499, quantity: 1 }
        ]
      })
    };
    
    snapshotCallback(mockDoc);
    
    const cart = useCartStore.getState().cart;
    expect(cart).toHaveLength(2);
    expect(cart[0].quantity).toBe(3);
  });

  it('should handle Firebase connection errors', () => {
    const { onSnapshot } = require('firebase/firestore');
    let errorCallback;
    
    onSnapshot.mockImplementation((docRef, successCallback, errorCallback) => {
      errorCallback = errorCallback;
      return vi.fn();
    });
    
    const { subscribeToCart } = useCartStore.getState();
    subscribeToCart();
    
    // Simulate Firebase error
    const mockError = new Error('Firebase connection failed');
    errorCallback(mockError);
    
    const { error } = useCartStore.getState();
    expect(error).toBe('Firebase connection failed');
  });
});
```

#### **2. Wishlist Real-time Tests**
```javascript
describe('Wishlist Real-time Updates', () => {
  it('should sync wishlist changes across tabs', () => {
    // Mock Firebase onSnapshot for wishlist
    // Simulate wishlist update from another tab
    // Verify state updates in current tab
  });

  it('should handle wishlist listener cleanup', () => {
    // Set up wishlist listener
    // Call unsubscribe function
    // Verify listener is properly cleaned up
  });
});
```

#### **3. User Isolation Tests**
```javascript
describe('Real-time User Isolation', () => {
  it('should only receive updates for current user', () => {
    // Set up listener for User A
    // Simulate update for User B
    // Verify User A doesn't receive User B's updates
  });

  it('should switch listeners when user changes', () => {
    // Set up listener for User A
    // Switch to User B
    // Verify new listener for User B
    // Verify old listener cleaned up
  });
});
```

---

## 🌐 **E2E Tests (Cypress)**

### **Running Real-time Features E2E Tests**
```bash
# Run real-time features E2E tests
npm run cy:run --spec "cypress/e2e/real-time-features.cy.js"

# Run interactively
npm run cy:open
# Then select real-time-features.cy.js
```

### **E2E Test Scenarios**

#### **1. Cross-tab Cart Synchronization**
```javascript
describe('Cross-tab Cart Synchronization', () => {
  it('should sync cart updates across browser tabs', () => {
    // This test would require multiple browser contexts
    // For now, we simulate the behavior
    
    cy.loginAsUser();
    cy.addProductToCart('Test Product');
    
    // Simulate cross-tab update by directly updating Firebase
    cy.window().then((win) => {
      // Simulate another tab adding item
      win.dispatchEvent(new CustomEvent('cartUpdate', {
        detail: { items: [{ id: '1', quantity: 2 }] }
      }));
    });
    
    // Verify cart count updates
    cy.get('[data-cy="cart-count"]').should('contain', '2');
  });
});
```

#### **2. Real-time Inventory Updates**
```javascript
describe('Real-time Inventory Updates', () => {
  it('should update product availability in real-time', () => {
    cy.visit('/shop');
    
    // Verify initial stock status
    cy.get('[data-cy="product-card"]').first().within(() => {
      cy.get('[data-cy="add-to-cart-button"]').should('not.be.disabled');
    });
    
    // Simulate inventory update (admin action)
    cy.window().then((win) => {
      // Simulate stock update
      win.dispatchEvent(new CustomEvent('inventoryUpdate', {
        detail: { productId: '1', quantity: 0 }
      }));
    });
    
    // Verify product shows as out of stock
    cy.get('[data-cy="product-card"]').first().within(() => {
      cy.get('[data-cy="add-to-cart-button"]').should('contain', 'Out of Stock');
    });
  });
});
```

#### **3. Authentication State Sync**
```javascript
describe('Authentication State Synchronization', () => {
  it('should sync login state across tabs', () => {
    // Login in one tab
    cy.loginUser('test@example.com', 'password123');
    
    // Verify authenticated state
    cy.get('[data-cy="nav-account"]').should('be.visible');
    
    // Simulate logout from another tab
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('authStateChange', {
        detail: { user: null }
      }));
    });
    
    // Verify logout state reflected
    cy.get('[data-cy="nav-login"]').should('be.visible');
  });
});
```

---

## 🔧 **Test Configuration**

### **Firebase Emulator Setup for Real-time Testing**
```javascript
// cypress/support/commands.js
Cypress.Commands.add('setupFirebaseEmulator', () => {
  cy.window().then((win) => {
    // Connect to Firebase emulator for testing
    if (win.firebase && !win.firebase._emulatorConnected) {
      win.firebase.firestore().useEmulator('localhost', 8080);
      win.firebase._emulatorConnected = true;
    }
  });
});
```

### **Mock Real-time Updates**
```javascript
// Test utility for simulating real-time updates
const simulateRealTimeUpdate = (collection, docId, data) => {
  cy.window().then((win) => {
    const event = new CustomEvent('firestoreUpdate', {
      detail: { collection, docId, data }
    });
    win.dispatchEvent(event);
  });
};
```

---

## 📊 **Test Coverage Goals**

### **Real-time Features Coverage**
- **Cross-tab Sync**: 90% coverage
- **Firebase Listeners**: 85% coverage
- **User Isolation**: 95% coverage
- **Error Handling**: 80% coverage

### **Critical Test Scenarios**
- [ ] **Cart Sync**: Updates appear across tabs
- [ ] **Wishlist Sync**: Changes sync in real-time
- [ ] **User Isolation**: Users only see their data
- [ ] **Error Handling**: Connection errors handled gracefully
- [ ] **Listener Cleanup**: No memory leaks
- [ ] **Performance**: Updates don't cause lag

---

## 🆘 **Troubleshooting Real-time Tests**

### **Common Issues**

#### **"onSnapshot not triggering"**
```bash
# Solution: Mock Firebase onSnapshot correctly
vi.mock('firebase/firestore', () => ({
  onSnapshot: vi.fn((docRef, callback) => {
    // Store callback for later triggering
    global.mockSnapshotCallback = callback;
    return vi.fn(); // unsubscribe function
  })
}));

# Trigger update in test
global.mockSnapshotCallback(mockDoc);
```

#### **"Real-time updates not syncing"**
```bash
# Solution: Verify Firebase listener setup
const { subscribeToCart } = useCartStore.getState();
const unsubscribe = subscribeToCart();
expect(typeof unsubscribe).toBe('function');
```

#### **"User isolation not working"**
```bash
# Solution: Ensure proper user context
useAuthStore.setState({ currentUser: { uid: 'user1' } });
// Set up listener for user1
useAuthStore.setState({ currentUser: { uid: 'user2' } });
// Verify listener switches to user2
```

#### **"Memory leaks in tests"**
```bash
# Solution: Proper cleanup in afterEach
afterEach(() => {
  const { unsubscribeFromCart } = useCartStore.getState();
  if (unsubscribeFromCart) {
    unsubscribeFromCart();
  }
});
```

---

## 🎯 **Test Execution Commands**

### **Quick Validation**
```bash
# Test real-time features quickly
npm run test src/components/__tests__/RealTimeFeatures.test.jsx

# Test in browser
npm run cy:run --spec "cypress/e2e/real-time-features.cy.js"
```

### **Comprehensive Testing**
```bash
# Run all real-time tests
npm run test:realtime

# Run all E2E real-time tests
npm run cy:run:realtime
```

### **Development Testing**
```bash
# Watch mode for active development
npm run test:watch src/components/__tests__/RealTimeFeatures.test.jsx

# Interactive E2E testing
npm run cy:open
```

---

## 📈 **Expected Test Results**

### **All Tests Pass When:**
- ✅ Cart syncs across browser tabs
- ✅ Wishlist updates in real-time
- ✅ User data is properly isolated
- ✅ Firebase listeners work correctly
- ✅ Error handling is graceful
- ✅ Memory cleanup works properly

### **Test Failure Indicators:**
- ❌ Updates don't sync across tabs
- ❌ Users see each other's data
- ❌ Firebase errors crash the app
- ❌ Memory leaks from listeners
- ❌ Performance issues with updates

---

## 🔄 **Continuous Testing**

### **During Development**
```bash
# Run tests after making real-time changes
npm run test src/components/__tests__/RealTimeFeatures.test.jsx

# Test in browser
npm run cy:run --spec "cypress/e2e/real-time-features.cy.js"
```

### **Before Deployment**
```bash
# Run complete real-time test suite
npm run test:realtime

# Verify all real-time functionality
npm run cy:run:realtime
```

**This comprehensive testing ensures real-time features work reliably and provide a smooth, synchronized user experience across all devices and browser tabs.**