describe('Checkout Flow E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Checkout Process', () => {
    beforeEach(() => {
      // Set up authenticated user with items in cart
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Checkout Test User');
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

    it('should complete checkout flow with Razorpay', () => {
      cy.visit('/cart');
      cy.get('[data-cy="checkout-button"]').click();
      
      // Should be on checkout page
      cy.url().should('include', '/checkout');
      
      // Fill shipping information
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="phone"]').type('+91 9876543210');
      cy.get('input[name="address"]').type('123 Test Street');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="zipCode"]').type('400001');
      
      // Should show Razorpay payment info
      cy.contains('Secure Payment with Razorpay').should('be.visible');
      cy.contains('Credit/Debit Cards').should('be.visible');
      cy.contains('UPI').should('be.visible');
      
      // Submit to proceed to payment
      cy.get('button[type="submit"]').click();
      
      // Should show payment step
      cy.contains('Complete Payment').should('be.visible');
      cy.contains('Pay ₹').should('be.visible');
    });

    it('should validate required shipping fields', () => {
      cy.visit('/checkout');
      
      // Try to submit without filling required fields
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.contains('Please fill in first name').should('be.visible');
    });

    it('should calculate totals correctly', () => {
      cy.visit('/cart');
      
      // Should show breakdown
      cy.contains('Subtotal:').should('be.visible');
      cy.contains('Tax:').should('be.visible');
      cy.contains('Shipping:').should('be.visible');
      cy.contains('Total:').should('be.visible');
      
      cy.get('[data-cy="checkout-button"]').click();
      
      // Totals should match on checkout page
      cy.contains('Subtotal:').should('be.visible');
      cy.contains('Tax:').should('be.visible');
      cy.contains('Shipping:').should('be.visible');
      cy.contains('Total:').should('be.visible');
    });

    it('should show free shipping message when applicable', () => {
      // This test assumes cart total is over ₹500
      cy.visit('/cart');
      
      // Should show free shipping info
      cy.contains('Free shipping on orders over ₹500').should('be.visible');
    });
  });

  describe('Payment Integration', () => {
    it('should show Razorpay payment options', () => {
      cy.visit('/checkout');
      
      // Fill minimum required fields
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="phone"]').type('+91 9876543210');
      cy.get('input[name="address"]').type('123 Test St');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="zipCode"]').type('400001');
      
      cy.get('button[type="submit"]').click();
      
      // Should show Razorpay checkout
      cy.contains('Pay ₹').should('be.visible');
      cy.contains('with Razorpay').should('be.visible');
    });

    it('should not show COD option', () => {
      cy.visit('/checkout');
      
      // COD should not be available
      cy.contains('Cash on Delivery').should('not.exist');
      cy.contains('COD').should('not.exist');
    });
  });

  describe('Order Management', () => {
    it('should allow order cancellation', () => {
      // This would require creating an order first
      cy.visit('/orders');
      
      // Should show cancel option for processing orders
      cy.get('[data-cy="order-item"]').first().within(() => {
        cy.get('select').select('cancelled');
      });
      
      // Should update order status
      cy.contains('cancelled').should('be.visible');
    });
  });
});