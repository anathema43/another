describe('Checkout Process', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
    
    // Add products to cart
    cy.navigateToShop();
    cy.addProductToCart('Darjeeling Pickle');
    cy.addProductToCart('Himalayan Wild Honey');
  });

  describe('Checkout Flow - Guest User', () => {
    it('should redirect to login when proceeding to checkout', () => {
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      cy.url().should('include', '/login');
      cy.get('[data-cy="login-required-message"]').should('be.visible');
    });

    it('should allow guest checkout if enabled', () => {
      // Assuming guest checkout is enabled
      cy.navigateToCart();
      cy.get('[data-cy="guest-checkout-button"]').click();
      
      cy.url().should('include', '/checkout');
      cy.get('[data-cy="guest-checkout-form"]').should('be.visible');
    });
  });

  describe('Checkout Flow - Authenticated User', () => {
    beforeEach(() => {
      cy.loginAsUser();
    });

    it('should complete full checkout process', () => {
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      cy.url().should('include', '/checkout');
      
      // Fill shipping information
      cy.fixture('users').then((users) => {
        const user = users.testUser;
        cy.fillShippingInfo({
          firstName: 'Test',
          lastName: 'User',
          email: user.email,
          phone: user.phone,
          address: user.address.street,
          city: user.address.city,
          zipCode: user.address.zipCode
        });
      });
      
      // Select payment method
      cy.selectPaymentMethod('razorpay');
      
      // Mock successful payment
      cy.mockRazorpayPayment(true);
      
      // Place order
      cy.get('[data-cy="place-order-button"]').click();
      
      // Verify order success
      cy.url().should('include', '/order-success');
      cy.get('[data-cy="order-confirmation"]').should('be.visible');
      cy.get('[data-cy="order-number"]').should('be.visible');
    });

    it('should validate shipping information', () => {
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      // Try to proceed without filling required fields
      cy.get('[data-cy="continue-to-payment"]').click();
      
      cy.get('[data-cy="validation-error"]').should('be.visible');
      cy.get('[data-cy="required-field-error"]').should('have.length.greaterThan', 0);
    });

    it('should calculate shipping costs correctly', () => {
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      // Fill shipping info
      cy.fillShippingInfo({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ramro.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        zipCode: '400001'
      });
      
      // Verify shipping calculation
      cy.get('[data-cy="shipping-cost"]').should('be.visible');
      cy.get('[data-cy="order-total"]').should('be.visible');
      
      // Test free shipping threshold
      cy.get('[data-cy="free-shipping-message"]').should('be.visible');
    });

    it('should handle different payment methods', () => {
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      cy.fillShippingInfo({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ramro.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        zipCode: '400001'
      });
      
      // Test Cash on Delivery
      cy.selectPaymentMethod('cod');
      cy.get('[data-cy="cod-info"]').should('be.visible');
      
      // Test Razorpay
      cy.selectPaymentMethod('razorpay');
      cy.get('[data-cy="razorpay-info"]').should('be.visible');
    });
  });

  describe('Payment Processing', () => {
    beforeEach(() => {
      cy.loginAsUser();
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      cy.fillShippingInfo({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ramro.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        zipCode: '400001'
      });
    });

    it('should process Razorpay payment successfully', () => {
      cy.selectPaymentMethod('razorpay');
      cy.mockRazorpayPayment(true);
      
      cy.get('[data-cy="place-order-button"]').click();
      
      // Verify Razorpay modal opens
      cy.get('[data-cy="razorpay-modal"]').should('be.visible');
      
      // Payment should complete
      cy.url().should('include', '/order-success');
      cy.get('[data-cy="payment-success-message"]').should('be.visible');
    });

    it('should handle payment failures', () => {
      cy.selectPaymentMethod('razorpay');
      cy.mockRazorpayPayment(false);
      
      cy.get('[data-cy="place-order-button"]').click();
      
      // Should show payment error
      cy.get('[data-cy="payment-error"]').should('be.visible');
      cy.get('[data-cy="retry-payment-button"]').should('be.visible');
    });

    it('should handle payment cancellation', () => {
      cy.selectPaymentMethod('razorpay');
      
      cy.window().then((win) => {
        win.Razorpay = cy.stub().callsFake((options) => ({
          open: cy.stub().callsFake(() => {
            options.modal.ondismiss();
          })
        }));
      });
      
      cy.get('[data-cy="place-order-button"]').click();
      
      cy.get('[data-cy="payment-cancelled-message"]').should('be.visible');
      cy.url().should('include', '/checkout');
    });

    it('should process Cash on Delivery orders', () => {
      cy.selectPaymentMethod('cod');
      cy.get('[data-cy="place-order-button"]').click();
      
      // Should skip payment and create order
      cy.url().should('include', '/order-success');
      cy.get('[data-cy="cod-confirmation"]').should('be.visible');
    });
  });

  describe('Order Confirmation', () => {
    beforeEach(() => {
      cy.loginAsUser();
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      cy.fillShippingInfo({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ramro.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        zipCode: '400001'
      });
      
      cy.selectPaymentMethod('cod');
      cy.get('[data-cy="place-order-button"]').click();
    });

    it('should display order confirmation details', () => {
      cy.get('[data-cy="order-confirmation"]').should('be.visible');
      cy.get('[data-cy="order-number"]').should('be.visible');
      cy.get('[data-cy="order-total"]').should('be.visible');
      cy.get('[data-cy="shipping-address"]').should('be.visible');
      cy.get('[data-cy="order-items"]').should('be.visible');
    });

    it('should send order confirmation email', () => {
      // Mock email service
      cy.intercept('POST', '/api/email/send', { statusCode: 200 }).as('sendEmail');
      
      cy.wait('@sendEmail');
      cy.get('[data-cy="email-confirmation-message"]').should('be.visible');
    });

    it('should clear cart after successful order', () => {
      cy.get('[data-cy="cart-count"]').should('not.exist');
      cy.navigateToCart();
      cy.get('[data-cy="empty-cart-message"]').should('be.visible');
    });

    it('should allow viewing order details', () => {
      cy.get('[data-cy="view-order-details"]').click();
      cy.url().should('include', '/orders/');
      cy.get('[data-cy="order-detail-page"]').should('be.visible');
    });
  });

  describe('Checkout Validation', () => {
    beforeEach(() => {
      cy.loginAsUser();
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
    });

    it('should validate email format', () => {
      cy.get('[data-cy="shipping-email"]').type('invalid-email');
      cy.get('[data-cy="continue-to-payment"]').click();
      
      cy.get('[data-cy="email-validation-error"]').should('be.visible');
    });

    it('should validate phone number format', () => {
      cy.get('[data-cy="shipping-phone"]').type('invalid-phone');
      cy.get('[data-cy="continue-to-payment"]').click();
      
      cy.get('[data-cy="phone-validation-error"]').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-cy="continue-to-payment"]').click();
      
      cy.get('[data-cy="required-field-error"]').should('have.length.greaterThan', 0);
      cy.get('[data-cy="first-name-error"]').should('be.visible');
      cy.get('[data-cy="address-error"]').should('be.visible');
    });
  });

  describe('Mobile Checkout Experience', () => {
    beforeEach(() => {
      cy.setMobileViewport();
      cy.loginAsUser();
    });

    it('should display mobile-optimized checkout', () => {
      cy.navigateToCart();
      cy.get('[data-cy="mobile-checkout-button"]').click();
      
      cy.get('[data-cy="mobile-checkout-layout"]').should('be.visible');
      cy.get('[data-cy="checkout-steps"]').should('be.visible');
    });

    it('should handle mobile payment flow', () => {
      cy.navigateToCart();
      cy.get('[data-cy="mobile-checkout-button"]').click();
      
      cy.fillShippingInfo({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ramro.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        zipCode: '400001'
      });
      
      cy.selectPaymentMethod('razorpay');
      cy.mockRazorpayPayment(true);
      
      cy.get('[data-cy="mobile-place-order"]').click();
      
      cy.url().should('include', '/order-success');
    });
  });

  describe('Checkout Error Handling', () => {
    beforeEach(() => {
      cy.loginAsUser();
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
    });

    it('should handle server errors during checkout', () => {
      cy.intercept('POST', '/api/orders', { statusCode: 500 }).as('orderError');
      
      cy.fillShippingInfo({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ramro.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        zipCode: '400001'
      });
      
      cy.selectPaymentMethod('cod');
      cy.get('[data-cy="place-order-button"]').click();
      
      cy.wait('@orderError');
      cy.get('[data-cy="checkout-error"]').should('be.visible');
      cy.get('[data-cy="retry-order-button"]').should('be.visible');
    });

    it('should handle inventory issues during checkout', () => {
      cy.intercept('POST', '/api/orders', {
        statusCode: 400,
        body: { error: 'insufficient_inventory', product: 'Darjeeling Pickle' }
      }).as('inventoryError');
      
      cy.fillShippingInfo({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ramro.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        zipCode: '400001'
      });
      
      cy.selectPaymentMethod('cod');
      cy.get('[data-cy="place-order-button"]').click();
      
      cy.wait('@inventoryError');
      cy.get('[data-cy="inventory-error"]').should('contain', 'Darjeeling Pickle');
      cy.get('[data-cy="update-cart-button"]').should('be.visible');
    });
  });
});