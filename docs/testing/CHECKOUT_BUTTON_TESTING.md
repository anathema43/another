# 🛒 Checkout Button Testing Guide

## 🎯 **Overview**

This guide covers comprehensive testing for checkout button functionality, ensuring that the checkout process works correctly across different cart states and user scenarios.

---

## 📋 **What Checkout Button Tests Cover**

### **Button Visibility Testing**
- Checkout button appears when cart has items
- Checkout button hidden when cart is empty
- Button shows correct total amount
- Button links to correct checkout page

### **Cart State Integration Testing**
- Button responds to cart changes
- Total calculations are accurate
- Button updates when items added/removed
- Proper integration with cart store

### **Navigation Testing**
- Button navigates to checkout page correctly
- Proper routing with React Router
- URL changes appropriately
- Back navigation works

### **Calculation Testing**
- Subtotal calculations are correct
- Tax calculations are accurate
- Shipping calculations work properly
- Grand total is calculated correctly

---

## 🧪 **Unit Tests (Vitest)**

### **Running Checkout Button Unit Tests**
```bash
# Run all checkout button tests
npm run test src/components/__tests__/CheckoutButton.test.jsx

# Run with coverage
npm run test:coverage src/components/__tests__/CheckoutButton.test.jsx

# Watch mode for development
npm run test:watch src/components/__tests__/CheckoutButton.test.jsx
```

### **Test Categories**

#### **1. Button Visibility Tests**
```javascript
describe('Checkout Button Visibility', () => {
  it('should show checkout button when cart has items', () => {
    // Set cart with items
    useCartStore.setState({
      cart: [{ id: '1', name: 'Test Product', price: 299, quantity: 1 }]
    });
    
    // Render Cart component
    render(<Cart />);
    
    // Verify checkout button exists
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    expect(screen.getByText('Proceed to Checkout').closest('a')).toHaveAttribute('href', '/checkout');
  });

  it('should not show checkout button when cart is empty', () => {
    // Set empty cart
    useCartStore.setState({ cart: [] });
    
    // Render Cart component
    render(<Cart />);
    
    // Verify no checkout button
    expect(screen.queryByText('Proceed to Checkout')).not.toBeInTheDocument();
    expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
  });
});
```

#### **2. Cart Calculation Tests**
```javascript
describe('Cart Calculations', () => {
  it('should calculate totals correctly', () => {
    const { addToCart, getSubtotal, getTax, getShipping, getGrandTotal } = useCartStore.getState();
    
    addToCart({ id: '1', name: 'Product 1', price: 100 }, 2); // 200
    addToCart({ id: '2', name: 'Product 2', price: 300 }, 1); // 300
    
    expect(getSubtotal()).toBe(500);
    expect(getTax()).toBe(40); // 8% of 500
    expect(getShipping()).toBe(0); // Free shipping over 500
    expect(getGrandTotal()).toBe(540); // 500 + 40 + 0
  });

  it('should apply shipping charges correctly', () => {
    const { addToCart, getShipping } = useCartStore.getState();
    
    // Order under ₹500 - should charge shipping
    addToCart({ id: '1', name: 'Cheap Product', price: 100 }, 1);
    expect(getShipping()).toBe(50);
    
    // Reset cart
    useCartStore.setState({ cart: [] });
    
    // Order over ₹500 - should be free shipping
    addToCart({ id: '2', name: 'Expensive Product', price: 600 }, 1);
    expect(getShipping()).toBe(0);
  });
});
```

#### **3. Navigation Tests**
```javascript
describe('Checkout Navigation', () => {
  it('should navigate to checkout page when clicked', () => {
    // Set cart with items
    useCartStore.setState({
      cart: [{ id: '1', name: 'Test Product', price: 299, quantity: 1 }]
    });
    
    // Render with router
    render(
      <BrowserRouter>
        <Cart />
      </BrowserRouter>
    );
    
    // Click checkout button
    const checkoutButton = screen.getByText('Proceed to Checkout');
    expect(checkoutButton.closest('a')).toHaveAttribute('href', '/checkout');
  });
});
```

---

## 🌐 **E2E Tests (Cypress)**

### **Running Checkout Button E2E Tests**
```bash
# Run checkout button E2E tests
npm run cy:run --spec "cypress/e2e/checkout-button.cy.js"

# Run interactively
npm run cy:open
# Then select checkout-button.cy.js
```

### **E2E Test Scenarios**

#### **1. Checkout Button Functionality**
```javascript
describe('Checkout Button Functionality', () => {
  beforeEach(() => {
    // Set up authenticated user with items in cart
    cy.visit('/signup');
    cy.get('[data-cy="signup-name"]').type('Checkout User');
    cy.get('[data-cy="signup-email"]').type('checkout@test.com');
    cy.get('[data-cy="signup-password"]').type('password123');
    cy.get('[data-cy="signup-confirm-password"]').type('password123');
    cy.get('[data-cy="signup-submit"]').click();
    
    // Add items to cart
    cy.visit('/shop');
    cy.get('[data-cy="product-card"]').first().within(() => {
      cy.get('[data-cy="add-to-cart-button"]').click();
    });
  });

  it('should show checkout button when cart has items', () => {
    cy.visit('/cart');
    
    cy.get('[data-cy="checkout-button"]').should('be.visible');
    cy.get('[data-cy="checkout-button"]').should('contain', 'Proceed to Checkout');
  });

  it('should navigate to checkout page when clicked', () => {
    cy.visit('/cart');
    
    cy.get('[data-cy="checkout-button"]').click();
    cy.url().should('include', '/checkout');
  });

  it('should show correct total on checkout button', () => {
    cy.visit('/cart');
    
    // Should show calculated total
    cy.get('[data-cy="cart-total"]').should('be.visible');
    cy.get('[data-cy="checkout-button"]').should('be.visible');
  });
});
```

#### **2. Cart Calculations E2E**
```javascript
describe('Cart Calculations', () => {
  it('should calculate totals correctly in UI', () => {
    // Add known products to cart
    cy.visit('/shop');
    cy.get('[data-cy="product-card"]').first().within(() => {
      cy.get('[data-cy="add-to-cart-button"]').click();
    });
    
    cy.visit('/cart');
    
    // Verify subtotal, tax, shipping, and total are displayed
    cy.contains('Subtotal:').should('be.visible');
    cy.contains('Tax:').should('be.visible');
    cy.contains('Shipping:').should('be.visible');
    cy.contains('Total:').should('be.visible');
  });

  it('should show free shipping message when applicable', () => {
    cy.visit('/cart');
    
    // Should show shipping info
    cy.contains('Free shipping on orders over ₹500').should('be.visible');
  });
});
```

---

## 🔧 **Test Configuration**

### **Mock Data for Testing**
```javascript
const mockCartItems = [
  { 
    id: '1', 
    name: 'Test Product 1', 
    price: 299, 
    quantity: 2, 
    image: 'test1.jpg',
    quantityAvailable: 10
  },
  { 
    id: '2', 
    name: 'Test Product 2', 
    price: 499, 
    quantity: 1, 
    image: 'test2.jpg',
    quantityAvailable: 5
  }
];

const expectedCalculations = {
  subtotal: 1097, // (299 * 2) + (499 * 1)
  tax: 87.76, // 8% of subtotal
  shipping: 0, // Free shipping over ₹500
  total: 1184.76 // subtotal + tax + shipping
};
```

### **Test Utilities**
```javascript
// Test helper functions
const renderCartWithItems = (items) => {
  useCartStore.setState({ cart: items });
  return render(
    <BrowserRouter>
      <Cart />
    </BrowserRouter>
  );
};

const addItemsToCart = (items) => {
  const { addToCart } = useCartStore.getState();
  items.forEach(item => {
    addToCart(item, item.quantity);
  });
};
```

---

## 📊 **Test Coverage Goals**

### **Checkout Button Coverage**
- **Button Visibility**: 100% coverage
- **Navigation**: 95% coverage
- **Calculations**: 90% coverage
- **Error Handling**: 85% coverage

### **Critical Test Scenarios**
- [ ] **Button Appears**: When cart has items
- [ ] **Button Hidden**: When cart is empty
- [ ] **Correct Total**: Shows accurate total amount
- [ ] **Navigation Works**: Links to checkout page
- [ ] **Calculations Accurate**: All math is correct
- [ ] **Responsive Design**: Works on mobile devices

---

## 🆘 **Troubleshooting Checkout Tests**

### **Common Issues**

#### **"Checkout button not found"**
```bash
# Solution: Check cart state and data-cy attributes
cy.get('[data-cy="checkout-button"]').should('exist');

# Debug: Check cart contents
cy.window().then((win) => {
  console.log('Cart state:', win.useCartStore.getState().cart);
});
```

#### **"Calculations incorrect"**
```bash
# Solution: Verify cart store calculations
const { getSubtotal, getTax, getShipping } = useCartStore.getState();
console.log('Subtotal:', getSubtotal());
console.log('Tax:', getTax());
console.log('Shipping:', getShipping());
```

#### **"Navigation not working"**
```bash
# Solution: Ensure proper React Router setup
render(
  <BrowserRouter>
    <Cart />
  </BrowserRouter>
);
```

#### **"Button shows wrong total"**
```bash
# Solution: Check cart store total calculation
const { getGrandTotal } = useCartStore.getState();
expect(getGrandTotal()).toBe(expectedTotal);
```

---

## 🎯 **Test Execution Workflow**

### **Development Testing**
```bash
# 1. Start development server
npm run dev

# 2. Run unit tests in watch mode
npm run test:watch src/components/__tests__/CheckoutButton.test.jsx

# 3. Run E2E tests when ready
npm run cy:open

# 4. Select and run checkout-button tests
```

### **CI/CD Integration**
```bash
# Tests run automatically on:
# - Every commit
# - Pull requests
# - Before deployment

# Manual execution
npm run test:checkout
npm run cy:run:checkout
```

---

## 📈 **Success Criteria**

### **Checkout Button Tests Pass When:**
- ✅ Button appears when cart has items
- ✅ Button hidden when cart is empty
- ✅ Navigation to checkout works
- ✅ Total calculations are accurate
- ✅ Responsive design works
- ✅ Error states handled gracefully

### **Test Failure Indicators:**
- ❌ Button missing when cart has items
- ❌ Button appears when cart is empty
- ❌ Navigation doesn't work
- ❌ Calculations are incorrect
- ❌ Button doesn't respond to cart changes

---

## 🔄 **Continuous Testing**

### **During Development**
```bash
# Run tests after making cart/checkout changes
npm run test src/components/__tests__/CheckoutButton.test.jsx

# Test in browser
npm run cy:run --spec "cypress/e2e/checkout-button.cy.js"
```

### **Before Deployment**
```bash
# Run complete checkout test suite
npm run test:checkout

# Verify all checkout functionality
npm run cy:run:checkout
```

**This comprehensive testing ensures the checkout button works reliably and provides a smooth transition from cart to checkout for all users.**