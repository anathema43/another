describe('Complete User Flow E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('End-to-End User Journey', () => {
    it('should complete full user journey from signup to order', () => {
      // Step 1: User Registration
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Complete Flow User');
      cy.get('[data-cy="signup-email"]').type('complete@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should redirect to home after signup
      cy.url().should('eq', Cypress.config().baseUrl + '/#/');
      
      // Step 2: Browse Products
      cy.visit('/shop');
      cy.get('[data-cy="product-grid"]').should('be.visible');
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
      
      // Step 3: Add Products to Cart
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Verify cart count increases
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      
      // Add another product
      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      cy.get('[data-cy="cart-count"]').should('contain', '2');
      
      // Step 4: View Cart
      cy.visit('/cart');
      cy.get('[data-cy="cart-item"]').should('have.length', 2);
      
      // Verify totals are calculated
      cy.contains('Subtotal:').should('be.visible');
      cy.contains('Tax:').should('be.visible');
      cy.contains('Shipping:').should('be.visible');
      cy.contains('Total:').should('be.visible');
      
      // Step 5: Proceed to Checkout
      cy.get('[data-cy="checkout-button"]').click();
      cy.url().should('include', '/checkout');
      
      // Step 6: Fill Shipping Information
      cy.get('input[name="firstName"]').type('Complete');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('complete@test.com');
      cy.get('input[name="phone"]').type('+91 9876543210');
      cy.get('input[name="address"]').type('123 Test Street');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="state"]').type('Maharashtra');
      cy.get('input[name="zipCode"]').type('400001');
      
      // Step 7: Proceed to Payment
      cy.get('button[type="submit"]').click();
      
      // Should show payment step
      cy.contains('Complete Payment').should('be.visible');
      cy.contains('Pay ₹').should('be.visible');
    });

    it('should handle cart persistence across sessions', () => {
      // Sign up and add items
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Persistence User');
      cy.get('[data-cy="signup-email"]').type('persistence@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Add items to cart
      cy.visit('/shop');
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Verify cart count
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      
      // Refresh page
      cy.reload();
      
      // Cart should persist
      cy.get('[data-cy="cart-count"]').should('contain', '1');
    });

    it('should browse stories and artisans', () => {
      // Test stories page
      cy.visit('/stories');
      cy.get('h1').should('contain', 'Stories');
      
      // Should show stories (demo or real)
      cy.get('article').should('have.length.greaterThan', 0);
      
      // Test artisans page
      cy.visit('/artisans');
      cy.get('h1').should('contain', 'Meet Our Artisans');
      
      // Should show artisans
      cy.get('[data-cy="artisan-card"]').should('have.length.greaterThan', 0);
    });

    it('should handle wishlist functionality', () => {
      // Sign up first
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Wishlist User');
      cy.get('[data-cy="signup-email"]').type('wishlist@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Add to wishlist
      cy.visit('/shop');
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Verify wishlist count
      cy.get('[data-cy="wishlist-count"]').should('contain', '1');
      
      // Visit wishlist page
      cy.visit('/wishlist');
      cy.get('[data-cy="wishlist-item"]').should('have.length', 1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Test offline behavior
      cy.visit('/shop');
      
      // Should show products even if Firebase is not configured
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
    });

    it('should handle authentication errors', () => {
      // Try to access protected route without auth
      cy.visit('/checkout');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should handle payment configuration errors', () => {
      // Sign up and add items
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Payment Test User');
      cy.get('[data-cy="signup-email"]').type('payment@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Add items and go to checkout
      cy.visit('/shop');
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      cy.visit('/checkout');
      
      // Fill shipping info
      cy.get('input[name="firstName"]').type('Payment');
      cy.get('input[name="lastName"]').type('Test');
      cy.get('input[name="email"]').type('payment@test.com');
      cy.get('input[name="phone"]').type('+91 9876543210');
      cy.get('input[name="address"]').type('123 Test Street');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="zipCode"]').type('400001');
      
      cy.get('button[type="submit"]').click();
      
      // Should handle payment configuration gracefully
      cy.contains('Payment Configuration Required').should('be.visible');
    });
  });
});