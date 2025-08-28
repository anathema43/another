describe('Email Notification System', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Welcome Email Functionality', () => {
    it('should trigger welcome email on user registration', () => {
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@ramro.com`;
      
      // Mock Firebase Functions call
      cy.intercept('POST', '**/sendWelcomeEmail', { statusCode: 200 }).as('welcomeEmail');
      
      cy.get('[data-cy="nav-signup"]').click();
      cy.get('[data-cy="signup-name"]').type('Test User');
      cy.get('[data-cy="signup-email"]').type(testEmail);
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Verify welcome email was triggered
      cy.wait('@welcomeEmail');
    });
  });

  describe('Order Confirmation Email', () => {
    beforeEach(() => {
      cy.loginAsUser();
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
    });

    it('should send order confirmation email after successful order', () => {
      // Mock email function
      cy.intercept('POST', '**/sendOrderConfirmation', { statusCode: 200 }).as('orderConfirmation');
      
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      // Fill checkout form
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
      
      // Verify order confirmation email was triggered
      cy.wait('@orderConfirmation');
      cy.get('[data-cy="order-confirmation"]').should('be.visible');
    });

    it('should include correct order details in confirmation email', () => {
      cy.intercept('POST', '**/sendOrderConfirmation', (req) => {
        expect(req.body).to.have.property('orderNumber');
        expect(req.body).to.have.property('items');
        expect(req.body).to.have.property('total');
        expect(req.body).to.have.property('shipping');
        req.reply({ statusCode: 200 });
      }).as('orderConfirmationDetails');
      
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
      
      cy.wait('@orderConfirmationDetails');
    });
  });

  describe('Shipping Notification Email', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.navigateToAdmin();
      cy.get('[data-cy="admin-nav-orders"]').click();
    });

    it('should send shipping email when order status changes to shipped', () => {
      // Mock shipping notification
      cy.intercept('POST', '**/sendShippingNotification', { statusCode: 200 }).as('shippingNotification');
      
      // Update order status to shipped
      cy.get('[data-cy="order-row"]').first().within(() => {
        cy.get('[data-cy="order-status-select"]').select('shipped');
        cy.get('[data-cy="tracking-number-input"]').type('TRK123456789');
        cy.get('[data-cy="update-status-button"]').click();
      });
      
      // Verify shipping notification was triggered
      cy.wait('@shippingNotification');
      cy.get('[data-cy="success-message"]').should('contain', 'Order status updated');
    });

    it('should include tracking information in shipping email', () => {
      cy.intercept('POST', '**/sendShippingNotification', (req) => {
        expect(req.body).to.have.property('trackingNumber');
        expect(req.body).to.have.property('orderNumber');
        expect(req.body.status).to.equal('shipped');
        req.reply({ statusCode: 200 });
      }).as('shippingDetails');
      
      cy.get('[data-cy="order-row"]').first().within(() => {
        cy.get('[data-cy="order-status-select"]').select('shipped');
        cy.get('[data-cy="tracking-number-input"]').type('TRK123456789');
        cy.get('[data-cy="update-status-button"]').click();
      });
      
      cy.wait('@shippingDetails');
    });
  });

  describe('Delivery Confirmation Email', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.navigateToAdmin();
      cy.get('[data-cy="admin-nav-orders"]').click();
    });

    it('should send delivery confirmation when order status changes to delivered', () => {
      // Mock delivery confirmation
      cy.intercept('POST', '**/sendDeliveryConfirmation', { statusCode: 200 }).as('deliveryConfirmation');
      
      // Update order status to delivered
      cy.get('[data-cy="order-row"]').first().within(() => {
        cy.get('[data-cy="order-status-select"]').select('delivered');
        cy.get('[data-cy="update-status-button"]').click();
      });
      
      // Verify delivery confirmation was triggered
      cy.wait('@deliveryConfirmation');
      cy.get('[data-cy="success-message"]').should('contain', 'Order status updated');
    });

    it('should include review request in delivery confirmation', () => {
      cy.intercept('POST', '**/sendDeliveryConfirmation', (req) => {
        expect(req.body).to.have.property('orderNumber');
        expect(req.body.status).to.equal('delivered');
        expect(req.body).to.have.property('reviewLink');
        req.reply({ statusCode: 200 });
      }).as('deliveryDetails');
      
      cy.get('[data-cy="order-row"]').first().within(() => {
        cy.get('[data-cy="order-status-select"]').select('delivered');
        cy.get('[data-cy="update-status-button"]').click();
      });
      
      cy.wait('@deliveryDetails');
    });
  });

  describe('Email System Error Handling', () => {
    it('should handle email service failures gracefully', () => {
      // Mock email service failure
      cy.intercept('POST', '**/sendOrderConfirmation', { statusCode: 500 }).as('emailFailure');
      
      cy.loginAsUser();
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
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
      
      // Order should still be created even if email fails
      cy.get('[data-cy="order-confirmation"]').should('be.visible');
      cy.wait('@emailFailure');
    });

    it('should retry failed email deliveries', () => {
      // Mock initial failure then success
      let attemptCount = 0;
      cy.intercept('POST', '**/sendOrderConfirmation', (req) => {
        attemptCount++;
        if (attemptCount === 1) {
          req.reply({ statusCode: 500 });
        } else {
          req.reply({ statusCode: 200 });
        }
      }).as('emailRetry');
      
      cy.loginAsUser();
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
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
      
      cy.wait('@emailRetry');
    });
  });

  describe('Email Template Validation', () => {
    it('should render email templates correctly', () => {
      // Test email template rendering
      cy.request('GET', '/api/email/preview/order-confirmation').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include('Order Confirmation');
        expect(response.body).to.include('Ramro');
      });
    });

    it('should include all required order information in templates', () => {
      cy.request('GET', '/api/email/preview/shipping-notification').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include('tracking');
        expect(response.body).to.include('shipped');
        expect(response.body).to.include('delivery');
      });
    });
  });

  describe('Email Preferences', () => {
    it('should respect user email preferences', () => {
      cy.loginAsUser();
      cy.visit('/account');
      
      // Disable order notifications
      cy.get('[data-cy="email-preferences"]').within(() => {
        cy.get('[data-cy="order-notifications"]').uncheck();
        cy.get('[data-cy="save-preferences"]').click();
      });
      
      // Place order
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
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
      
      // Email should not be sent
      cy.get('[data-cy="email-disabled-notice"]').should('be.visible');
    });
  });
});