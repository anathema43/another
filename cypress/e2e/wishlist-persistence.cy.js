describe('Wishlist Persistence E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Wishlist User Isolation', () => {
    it('should isolate wishlist data between users', () => {
      // User 1: Add items to wishlist
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Wishlist User One');
      cy.get('[data-cy="signup-email"]').type('wishlist1@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Add products to wishlist
      cy.visit('/shop');
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Verify wishlist count
      cy.get('[data-cy="wishlist-count"]').should('contain', '2');
      
      // Visit wishlist page
      cy.visit('/wishlist');
      cy.get('[data-cy="wishlist-item"]').should('have.length', 2);
      
      // Sign out
      cy.get('[data-cy="logout-button"]').click();
      
      // User 2: Sign up and check empty wishlist
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Wishlist User Two');
      cy.get('[data-cy="signup-email"]').type('wishlist2@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Wishlist should be empty for new user
      cy.get('[data-cy="wishlist-count"]').should('not.exist');
      cy.visit('/wishlist');
      cy.get('[data-cy="empty-wishlist"]').should('be.visible');
      
      // Sign out User 2
      cy.get('[data-cy="logout-button"]').click();
      
      // User 1: Sign back in and verify wishlist is restored
      cy.visit('/login');
      cy.get('[data-cy="login-email"]').type('wishlist1@test.com');
      cy.get('[data-cy="login-password"]').type('password123');
      cy.get('[data-cy="login-submit"]').click();
      
      // Wishlist should be restored
      cy.get('[data-cy="wishlist-count"]').should('contain', '2');
      cy.visit('/wishlist');
      cy.get('[data-cy="wishlist-item"]').should('have.length', 2);
    });
  });

  describe('Wishlist Button Functionality', () => {
    beforeEach(() => {
      // Set up authenticated user
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Wishlist Test User');
      cy.get('[data-cy="signup-email"]').type('wishlisttest@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
    });

    it('should add and remove items from wishlist', () => {
      cy.visit('/shop');
      
      // Add to wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Verify wishlist count increases
      cy.get('[data-cy="wishlist-count"]').should('contain', '1');
      
      // Remove from wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Verify wishlist count decreases
      cy.get('[data-cy="wishlist-count"]').should('not.exist');
    });

    it('should show correct heart icon states', () => {
      cy.visit('/shop');
      
      // Initially should show empty heart
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').should('have.attr', 'title', 'Add to wishlist');
      });
      
      // Click to add to wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Should now show filled heart
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').should('have.attr', 'title', 'Remove from wishlist');
      });
    });

    it('should persist wishlist across page navigation', () => {
      cy.visit('/shop');
      
      // Add to wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Navigate away and back
      cy.visit('/about');
      cy.visit('/shop');
      
      // Wishlist state should persist
      cy.get('[data-cy="wishlist-count"]').should('contain', '1');
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').should('have.attr', 'title', 'Remove from wishlist');
      });
    });
  });

  describe('Wishlist Page Functionality', () => {
    beforeEach(() => {
      // Set up authenticated user with wishlist items
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Wishlist Page User');
      cy.get('[data-cy="signup-email"]').type('wishlistpage@test.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Add items to wishlist
      cy.visit('/shop');
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
    });

    it('should display wishlist items correctly', () => {
      cy.visit('/wishlist');
      
      cy.get('[data-cy="wishlist-title"]').should('contain', 'My Wishlist');
      cy.get('[data-cy="wishlist-item"]').should('have.length', 2);
    });

    it('should allow removing items from wishlist page', () => {
      cy.visit('/wishlist');
      
      // Remove first item
      cy.get('[data-cy="wishlist-item"]').first().within(() => {
        cy.get('[data-cy="remove-from-wishlist"]').click();
      });
      
      // Should have one less item
      cy.get('[data-cy="wishlist-item"]').should('have.length', 1);
      cy.get('[data-cy="wishlist-count"]').should('contain', '1');
    });

    it('should allow moving all items to cart', () => {
      cy.visit('/wishlist');
      
      // Click move all to cart
      cy.get('button').contains('Move All to Cart').click();
      
      // Cart should now have items
      cy.get('[data-cy="cart-count"]').should('contain', '2');
      
      // Verify in cart page
      cy.visit('/cart');
      cy.get('[data-cy="cart-item"]').should('have.length', 2);
    });

    it('should show empty state when wishlist is empty', () => {
      // Remove all items first
      cy.visit('/wishlist');
      cy.get('[data-cy="wishlist-item"]').each(() => {
        cy.get('[data-cy="remove-from-wishlist"]').first().click();
      });
      
      // Should show empty state
      cy.get('[data-cy="empty-wishlist"]').should('be.visible');
      cy.get('[data-cy="continue-shopping"]').should('be.visible');
    });
  });

  describe('Authentication Required', () => {
    it('should redirect to login when accessing wishlist without auth', () => {
      cy.visit('/wishlist');
      
      cy.get('h2').should('contain', 'Please login to view your wishlist');
      cy.get('a').contains('Login').should('have.attr', 'href').and('include', '/login');
    });

    it('should redirect to login when clicking wishlist button without auth', () => {
      cy.visit('/shop');
      
      // Try to add to wishlist without being logged in
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });
});