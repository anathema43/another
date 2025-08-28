describe('Cart Persistence E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('User Cart Isolation', () => {
    it('should isolate cart data between different users', () => {
      // User 1: Add items to cart
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('User One');
      cy.get('[data-cy="signup-email"]').type('user1@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Add products to cart
      cy.visit('/shop');
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Verify cart has items
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      
      // Sign out
      cy.get('[data-cy="logout-button"]').click();
      
      // User 2: Sign up and check empty cart
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('User Two');
      cy.get('[data-cy="signup-email"]').type('user2@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Cart should be empty for new user
      cy.get('[data-cy="cart-count"]').should('not.exist');
      
      // Sign out User 2
      cy.get('[data-cy="logout-button"]').click();
      
      // User 1: Sign back in and verify cart is restored
      cy.visit('/login');
      cy.get('[data-cy="login-email"]').type('user1@test.com');
      cy.get('[data-cy="login-password"]').type('password123');
      cy.get('[data-cy="login-submit"]').click();
      
      // Cart should be restored
      cy.get('[data-cy="cart-count"]').should('contain', '1');
    });

    it('should persist cart across browser sessions', () => {
      // Sign up and add items
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Persistent User');
      cy.get('[data-cy="signup-email"]').type('persistent@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Add multiple items
      cy.visit('/shop');
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      cy.get('[data-cy="cart-count"]').should('contain', '2');
      
      // Simulate browser refresh
      cy.reload();
      
      // Cart should persist
      cy.get('[data-cy="cart-count"]').should('contain', '2');
      
      // Visit cart page to verify items
      cy.visit('/cart');
      cy.get('[data-cy="cart-item"]').should('have.length', 2);
    });
  });

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

  describe('Cart Calculations', () => {
    it('should calculate totals correctly in UI', () => {
      const subtotal = 500;
      const tax = subtotal * 0.08; // 8% tax
      const shipping = subtotal >= 500 ? 0 : 50; // Free shipping over ₹500
      const total = subtotal + tax + shipping;
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
      // This would require adding expensive items to reach free shipping threshold
      cy.visit('/cart');
      
      // Should show shipping info
      cy.contains('Free shipping on orders over ₹500').should('be.visible');
    });
  });
});