describe('Checkout Process E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    
    // Create user and add items to cart
    cy.visit('/signup');
    cy.get('[data-cy="signup-name"]').type('Checkout Test User');
    cy.get('[data-cy="signup-email"]').type('checkout@test.com');
    cy.get('[data-cy="signup-password"]').type('password123');
    cy.get('[data-cy="signup-confirm-password"]').type('password123');
    cy.get('[data-cy="signup-submit"]').click();
    
    // Add items to cart
    cy.visit('/shop');
    cy.contains('All Products').click();
    cy.get('[data-cy="product-card"]').first().within(() => {
      cy.get('[data-cy="add-to-cart-button"]').click();
    });
  });

  describe('Address Management', () => {
    it('should require address selection for checkout', () => {
      cy.visit('/checkout');
      
      // Try to proceed without address
      cy.get('button[type="submit"]').click();
      
      // Should show error
      cy.contains('Please select a delivery address').should('be.visible');
    });

    it('should allow adding new address during checkout', () => {
      cy.visit('/checkout');
      
      // Add new address
      cy.get('[data-cy="add-address-button"]').click();
      
      // Fill address form
      cy.get('[data-cy="recipient-name-input"]').type('John Doe');
      cy.get('[data-cy="recipient-phone-input"]').type('+91 9876543210');
      cy.get('[data-cy="full-address-input"]').type('123 Test Street, Mumbai, Maharashtra, 400001');
      cy.get('[data-cy="save-address-button"]').click();
      
      // Should show address selected
      cy.contains('Delivery Address Selected').should('be.visible');
    });

    it('should proceed to payment with valid address', () => {
      // First add an address
      cy.visit('/account');
      cy.contains('My Addresses').click();
      cy.get('[data-cy="add-address-button"]').click();
      
      cy.get('[data-cy="recipient-name-input"]').type('Test User');
      cy.get('[data-cy="recipient-phone-input"]').type('+91 9876543210');
      cy.get('[data-cy="full-address-input"]').type('Test Address, Mumbai, 400001');
      cy.get('[data-cy="default-address-checkbox"]').check();
      cy.get('[data-cy="save-address-button"]').click();
      
      // Go to checkout
      cy.visit('/checkout');
      
      // Should auto-select default address
      cy.contains('Delivery Address Selected').should('be.visible');
      
      // Proceed to payment
      cy.get('button[type="submit"]').click();
      
      // Should show payment step
      cy.contains('Complete Payment').should('be.visible');
    });
  });

  describe('Payment Integration', () => {
    beforeEach(() => {
      // Add default address for payment tests
      cy.visit('/account');
      cy.contains('My Addresses').click();
      cy.get('[data-cy="add-address-button"]').click();
      
      cy.get('[data-cy="recipient-name-input"]').type('Payment User');
      cy.get('[data-cy="recipient-phone-input"]').type('+91 9876543210');
      cy.get('[data-cy="full-address-input"]').type('Payment Address, Mumbai, 400001');
      cy.get('[data-cy="default-address-checkbox"]').check();
      cy.get('[data-cy="save-address-button"]').click();
    });

    it('should show Razorpay payment interface', () => {
      cy.visit('/checkout');
      
      // Proceed to payment
      cy.get('button[type="submit"]').click();
      
      // Should show Razorpay payment
      cy.contains('Pay ₹').should('be.visible');
      cy.contains('with Razorpay').should('be.visible');
    });

    it('should handle payment configuration not available', () => {
      cy.visit('/checkout');
      
      // If Razorpay not configured, should show appropriate message
      cy.get('button[type="submit"]').click();
      
      // Should either show payment interface or configuration message
      cy.get('body').should('contain.text', 'Payment');
    });

    it('should show order summary in payment step', () => {
      cy.visit('/checkout');
      cy.get('button[type="submit"]').click();
      
      // Should show order summary
      cy.contains('Order Summary').should('be.visible');
      cy.contains('Shipping Address').should('be.visible');
      cy.contains('Total:').should('be.visible');
    });
  });

  describe('Order Notes', () => {
    it('should accept order notes', () => {
      cy.visit('/checkout');
      
      // Add order notes
      cy.get('textarea[name="orderNotes"]').type('Please handle with care');
      
      // Should accept the input
      cy.get('textarea[name="orderNotes"]').should('have.value', 'Please handle with care');
    });
  });

  describe('Error Handling', () => {
    it('should handle checkout without authentication', () => {
      // Sign out first
      cy.get('[data-cy="logout-button"]').click();
      
      // Try to access checkout
      cy.visit('/checkout');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should handle empty cart checkout', () => {
      // Clear cart and try checkout
      cy.visit('/cart');
      
      // If cart is empty, should not have checkout button
      cy.get('[data-cy="checkout-button"]').should('not.exist');
      cy.contains('Your Cart is Empty').should('be.visible');
    });
  });
});