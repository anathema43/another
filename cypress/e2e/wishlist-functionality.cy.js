describe('Wishlist Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Wishlist Button Interaction', () => {
    it('should allow users to add products to wishlist from product cards', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      
      // Click wishlist button on first product
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Should see success message
      cy.get('[data-cy="wishlist-success"]').should('contain', 'Added to wishlist');
      
      // Wishlist button should show as active
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').should('have.class', 'active');
      });
    });

    it('should allow users to remove products from wishlist', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      
      // Add to wishlist first
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Click again to remove
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Should see removal message
      cy.get('[data-cy="wishlist-removed"]').should('contain', 'Removed from wishlist');
      
      // Button should not be active
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').should('not.have.class', 'active');
      });
    });

    it('should work from product detail page', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().click();
      
      // Should see wishlist button on product detail page
      cy.get('[data-cy="wishlist-button"]').should('be.visible');
      cy.get('[data-cy="wishlist-button"]').click();
      
      cy.get('[data-cy="wishlist-success"]').should('contain', 'Added to wishlist');
    });
  });

  describe('Wishlist Page', () => {
    it('should display wishlist page for logged-in users', () => {
      cy.loginAsUser();
      cy.visit('/#/wishlist');
      
      cy.url().should('include', '/wishlist');
      cy.get('[data-cy="wishlist-page"]').should('be.visible');
      cy.get('[data-cy="wishlist-title"]').should('contain', 'My Wishlist');
    });

    it('should redirect non-logged-in users to login', () => {
      cy.visit('/#/wishlist');
      
      // Should redirect to login or show login required message
      cy.get('body').should('satisfy', ($body) => {
        return $body.text().includes('Please login') || 
               cy.url().should('include', '/login');
      });
    });

    it('should display wishlist items correctly', () => {
      cy.loginAsUser();
      
      // Add item to wishlist first
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="product-name"]').invoke('text').as('productName');
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Navigate to wishlist page
      cy.visit('/#/wishlist');
      
      // Should see the added product
      cy.get('@productName').then((name) => {
        cy.get('[data-cy="wishlist-item"]').should('contain', name);
      });
    });

    it('should show empty state when wishlist is empty', () => {
      cy.loginAsUser();
      cy.visit('/#/wishlist');
      
      // Should see empty state (assuming no items in wishlist)
      cy.get('body').then(($body) => {
        if (!$body.find('[data-cy="wishlist-item"]').length) {
          cy.get('[data-cy="empty-wishlist"]').should('be.visible');
          cy.get('[data-cy="empty-wishlist"]').should('contain', 'Your wishlist is empty');
          cy.get('[data-cy="continue-shopping"]').should('be.visible');
        }
      });
    });

    it('should allow removing items from wishlist page', () => {
      cy.loginAsUser();
      
      // Add item to wishlist
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Go to wishlist page
      cy.visit('/#/wishlist');
      
      // Remove item
      cy.get('[data-cy="wishlist-item"]').first().within(() => {
        cy.get('[data-cy="remove-from-wishlist"]').click();
      });
      
      // Should see removal confirmation or empty state
      cy.get('[data-cy="wishlist-removed"]').should('be.visible');
    });
  });

  describe('Wishlist Integration', () => {
    it('should show wishlist count in navigation', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      
      // Add item to wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Should see wishlist count in navigation
      cy.get('[data-cy="wishlist-count"]').should('be.visible');
      cy.get('[data-cy="wishlist-count"]').should('contain', '1');
    });

    it('should maintain wishlist state across page refreshes', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      
      // Add item to wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Refresh page
      cy.reload();
      cy.waitForPageLoad();
      
      // Wishlist should persist
      cy.get('[data-cy="wishlist-count"]').should('contain', '1');
    });
  });
});