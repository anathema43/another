// Custom Cypress commands for Darjeeling Souls E-commerce

// Authentication commands
Cypress.Commands.add('loginAsUser', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login');
  cy.get('[data-cy="login-email"]').type(email);
  cy.get('[data-cy="login-password"]').type(password);
  cy.get('[data-cy="login-submit"]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('loginAsAdmin', (email = 'admin@test.com', password = 'password123') => {
  cy.visit('/login');
  cy.get('[data-cy="login-email"]').type(email);
  cy.get('[data-cy="login-password"]').type(password);
  cy.get('[data-cy="login-submit"]').click();
  cy.url().should('include', '/admin');
});

Cypress.Commands.add('createTestUser', (name = 'Test User', email = 'test@example.com', password = 'password123') => {
  cy.visit('/signup');
  cy.get('[data-cy="signup-name"]').type(name);
  cy.get('[data-cy="signup-email"]').type(email);
  cy.get('[data-cy="signup-password"]').type(password);
  cy.get('[data-cy="signup-confirm-password"]').type(password);
  cy.get('[data-cy="signup-submit"]').click();
  cy.url().should('not.include', '/signup');
});

// Shopping commands
Cypress.Commands.add('addProductToCart', (productName = null) => {
  cy.visit('/shop');
  
  if (productName) {
    cy.contains('[data-cy="product-card"]', productName).within(() => {
      cy.get('[data-cy="add-to-cart-button"]').click();
    });
  } else {
    cy.get('[data-cy="product-card"]').first().within(() => {
      cy.get('[data-cy="add-to-cart-button"]').click();
    });
  }
  
  cy.get('[data-cy="cart-count"]').should('be.visible');
});

Cypress.Commands.add('addToWishlist', (productName = null) => {
  cy.visit('/shop');
  
  if (productName) {
    cy.contains('[data-cy="product-card"]', productName).within(() => {
      cy.get('[data-cy="wishlist-button"]').click();
    });
  } else {
    cy.get('[data-cy="product-card"]').first().within(() => {
      cy.get('[data-cy="wishlist-button"]').click();
    });
  }
});

// Navigation commands
Cypress.Commands.add('navigateToShop', () => {
  cy.get('[data-cy="nav-shop"]').click();
  cy.url().should('include', '/shop');
});

Cypress.Commands.add('navigateToCart', () => {
  cy.get('[data-cy="nav-cart"]').click();
  cy.url().should('include', '/cart');
});

Cypress.Commands.add('navigateToCheckout', () => {
  cy.visit('/cart');
  cy.get('[data-cy="checkout-button"]').click();
  cy.url().should('include', '/checkout');
});

// Form filling commands
Cypress.Commands.add('fillShippingInfo', (info = {}) => {
  const defaultInfo = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+91 9876543210',
    addressLine1: '123 Test Street',
    addressLine2: 'Test Area',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    ...info
  };

  cy.get('[data-cy="recipient-name-input"]').type(`${defaultInfo.firstName} ${defaultInfo.lastName}`);
  cy.get('[data-cy="recipient-phone-input"]').type(defaultInfo.phone);
  cy.get('[data-cy="address-line1-input"]').type(defaultInfo.addressLine1);
  cy.get('[data-cy="address-line2-input"]').type(defaultInfo.addressLine2);
  cy.get('[data-cy="city-input"]').type(defaultInfo.city);
  cy.get('[data-cy="state-input"]').type(defaultInfo.state);
  cy.get('[data-cy="zipcode-input"]').type(defaultInfo.zipCode);
});

// Admin commands
Cypress.Commands.add('seedTestData', () => {
  cy.visit('/admin');
  
  // Seed products if button exists
  cy.get('body').then($body => {
    if ($body.find('button:contains("Seed Products")').length > 0) {
      cy.contains('Seed Products').click();
    }
  });
  
  // Seed artisans if button exists
  cy.get('body').then($body => {
    if ($body.find('button:contains("Seed Artisan Profiles")').length > 0) {
      cy.contains('Seed Artisan Profiles').click();
    }
  });
});

// Utility commands
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.get('[data-cy="loading-spinner"]').should('not.exist');
});

Cypress.Commands.add('checkNoErrors', () => {
  cy.window().then((win) => {
    expect(win.console.error).to.not.have.been.called;
  });
});

// Mock payment commands
Cypress.Commands.add('mockRazorpayPayment', (success = true) => {
  cy.window().then((win) => {
    win.Razorpay = function(options) {
      return {
        open: () => {
          if (success) {
            options.handler({
              razorpay_payment_id: 'pay_test_123',
              razorpay_order_id: 'order_test_123',
              razorpay_signature: 'test_signature'
            });
          } else {
            options.modal.ondismiss();
          }
        }
      };
    };
  });
});

// Category testing commands
Cypress.Commands.add('selectCategory', (categoryName) => {
  cy.visit('/shop');
  cy.contains('[data-cy="category-card"]', categoryName).click();
});

// Search commands
Cypress.Commands.add('searchProducts', (query) => {
  cy.visit('/shop');
  cy.get('[data-cy="algolia-search-input"]').type(query);
});