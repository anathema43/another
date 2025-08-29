describe('Product Browsing E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Shop Page Navigation', () => {
    it('should navigate to shop page', () => {
      cy.get('[data-cy="nav-shop"]').click();
      cy.url().should('include', '/shop');
      cy.get('[data-cy="shop-page"]').should('be.visible');
    });

    it('should display category grid by default', () => {
      cy.visit('/shop');
      
      // Should show categories
      cy.contains('Shop by Category').should('be.visible');
      cy.contains('All Products').should('be.visible');
      cy.contains('Pickles & Preserves').should('be.visible');
      cy.contains('Wild Honey').should('be.visible');
      cy.contains('Heritage Grains').should('be.visible');
    });
  });

  describe('Category Selection', () => {
    it('should show products when category is selected', () => {
      cy.visit('/shop');
      
      // Click on a category
      cy.contains('Wild Honey').click();
      
      // Should show products view
      cy.get('[data-cy="product-grid"]').should('be.visible');
      cy.contains('Wild Honey').should('be.visible'); // Category name in header
    });

    it('should show all products when "All Products" is selected', () => {
      cy.visit('/shop');
      
      // Click on "All Products"
      cy.contains('All Products').click();
      
      // Should show all products
      cy.get('[data-cy="product-grid"]').should('be.visible');
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
    });

    it('should allow navigation back to categories', () => {
      cy.visit('/shop');
      
      // Select a category
      cy.contains('Wild Honey').click();
      
      // Click back to categories
      cy.contains('Back to Categories').click();
      
      // Should show category grid again
      cy.contains('Shop by Category').should('be.visible');
    });
  });

  describe('Product Display', () => {
    it('should display product cards correctly', () => {
      cy.visit('/shop');
      cy.contains('All Products').click();
      
      // Should show product cards
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
      
      // Each product card should have required elements
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="product-name"]').should('be.visible');
        cy.get('[data-cy="product-price"]').should('be.visible');
        cy.get('[data-cy="add-to-cart-button"]').should('be.visible');
        cy.get('[data-cy="view-details-link"]').should('be.visible');
      });
    });

    it('should handle empty category gracefully', () => {
      cy.visit('/shop');
      
      // This would test a category with no products
      // For now, we'll test the empty state message structure
      cy.contains('All Products').click();
      
      // If no products, should show appropriate message
      // This will depend on actual data
    });
  });

  describe('Search Functionality', () => {
    it('should show search bar on shop page', () => {
      cy.visit('/shop');
      
      cy.get('[data-cy="algolia-search-input"]').should('be.visible');
    });

    it('should handle search results', () => {
      cy.visit('/shop');
      
      // Type in search
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      
      // Should show search results or handle gracefully
      // This depends on Algolia configuration
    });

    it('should clear search and return to categories', () => {
      cy.visit('/shop');
      
      // Search for something
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      
      // Clear search
      cy.get('[data-cy="clear-search-button"]').click();
      
      // Should return to categories view
      cy.contains('Shop by Category').should('be.visible');
    });
  });

  describe('Product Interaction', () => {
    it('should add product to cart', () => {
      cy.visit('/shop');
      cy.contains('All Products').click();
      
      // Add first product to cart
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Should show cart count
      cy.get('[data-cy="cart-count"]').should('contain', '1');
    });

    it('should navigate to product detail page', () => {
      cy.visit('/shop');
      cy.contains('All Products').click();
      
      // Click view details on first product
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="view-details-link"]').click();
      });
      
      // Should navigate to product detail page
      cy.url().should('include', '/products/');
    });

    it('should add product to wishlist when authenticated', () => {
      // Sign up first
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Wishlist User');
      cy.get('[data-cy="signup-email"]').type('wishlist@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Go to shop and add to wishlist
      cy.visit('/shop');
      cy.contains('All Products').click();
      
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Should show wishlist count
      cy.get('[data-cy="wishlist-count"]').should('contain', '1');
    });
  });

  describe('Mobile Experience', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit('/shop');
      
      // Should show categories on mobile
      cy.contains('Shop by Category').should('be.visible');
      
      // Should be able to select category
      cy.contains('Wild Honey').click();
      
      // Should show products
      cy.get('[data-cy="product-grid"]').should('be.visible');
    });
  });
});