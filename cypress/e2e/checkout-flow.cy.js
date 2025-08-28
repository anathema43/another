describe('Checkout Flow Testing', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Guest Checkout Flow', () => {
    it('should require login for checkout', () => {
      // Add product to cart
      cy.get('a[href="#/shop"]').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Go to cart
      cy.get('a[href="#/cart"]').click();
      
      // Try to checkout
      cy.get('button').contains('Proceed to Checkout').click();
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  describe('Authenticated Checkout Flow', () => {
    beforeEach(() => {
      // Create user account
      const timestamp = Date.now();
      const testEmail = `checkout${timestamp}@test.com`;
      
      cy.get('a[href="#/signup"]').click();
      cy.get('input[name="name"]').type('Checkout User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('CheckoutPassword123');
      cy.get('input[name="confirmPassword"]').type('CheckoutPassword123');
      cy.get('button[type="submit"]').click();
      
      // Add product to cart
      cy.get('a[href="#/shop"]').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
    });

    it('should complete checkout process', () => {
      // Go to cart and checkout
      cy.get('a[href="#/cart"]').click();
      cy.get('button').contains('Proceed to Checkout').click();
      
      // Should reach checkout page
      cy.url().should('include', '/checkout');
      cy.contains('Checkout').should('be.visible');
      
      // Fill shipping information
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="phone"]').type('+91 9876543210');
      cy.get('input[name="address"]').type('123 Test Street');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="zipCode"]').type('400001');
      
      // Select payment method
      cy.get('input[value="cod"]').check();
      
      // Place order
      cy.get('button').contains('Place Order').click();
      
      // Should complete order
      cy.url().should('include', '/orders');
    });

    it('should validate checkout form', () => {
      cy.get('a[href="#/cart"]').click();
      cy.get('button').contains('Proceed to Checkout').click();
      
      // Try to submit empty form
      cy.get('button').contains('Place Order').click();
      
      // Should show validation errors
      cy.get('body').should('contain', 'required');
    });

    it('should calculate totals correctly', () => {
      cy.get('a[href="#/cart"]').click();
      cy.get('button').contains('Proceed to Checkout').click();
      
      // Should see order summary
      cy.contains('Order Summary').should('be.visible');
      cy.contains('Subtotal:').should('be.visible');
      cy.contains('Tax:').should('be.visible');
      cy.contains('Total:').should('be.visible');
    });
  });

  describe('Payment Methods', () => {
    beforeEach(() => {
      // Setup user and cart
      const timestamp = Date.now();
      const testEmail = `payment${timestamp}@test.com`;
      
      cy.get('a[href="#/signup"]').click();
      cy.get('input[name="name"]').type('Payment User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('PaymentPassword123');
      cy.get('input[name="confirmPassword"]').type('PaymentPassword123');
      cy.get('button[type="submit"]').click();
      
      cy.get('a[href="#/shop"]').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
      
      cy.get('a[href="#/cart"]').click();
      cy.get('button').contains('Proceed to Checkout').click();
      
      // Fill shipping info
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="phone"]').type('+91 9876543210');
      cy.get('input[name="address"]').type('123 Test Street');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="zipCode"]').type('400001');
    });

    it('should handle Cash on Delivery', () => {
      cy.get('input[value="cod"]').check();
      cy.get('button').contains('Place Order').click();
      
      // Should complete COD order
      cy.url().should('include', '/orders');
    });

    it('should handle Razorpay payment', () => {
      cy.get('input[value="card"]').check();
      cy.get('button').contains('Proceed to Payment').click();
      
      // Should show payment interface
      cy.contains('Complete Payment').should('be.visible');
    });
  });
});