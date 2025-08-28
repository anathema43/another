describe('Shopping Flow Testing', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Product Discovery', () => {
    it('should display products on shop page', () => {
      cy.get('a[href="#/shop"]').click();
      cy.url().should('include', '/shop');
      
      // Should see shop page elements
      cy.contains('Shop Ramro Products').should('be.visible');
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
      
      // Each product card should have required elements
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="product-name"]').should('be.visible');
        cy.get('[data-cy="product-price"]').should('be.visible');
        cy.get('[data-cy="product-image"]').should('be.visible');
        cy.get('button').contains('Add to Cart').should('be.visible');
      });
    });

    it('should show product details when clicked', () => {
      cy.get('a[href="#/shop"]').click();
      
      // Click on first product
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="view-details-link"]').click();
      });
      
      // Should navigate to product detail page
      cy.url().should('include', '/products/');
      cy.get('[data-cy="product-title"]').should('be.visible');
      cy.get('[data-cy="add-to-cart-button"]').should('be.visible');
    });

    it('should handle search functionality', () => {
      cy.get('a[href="#/shop"]').click();
      
      // Test search if available
      cy.get('body').then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type('honey');
          cy.get('[data-cy="product-card"]').should('contain.text', 'honey');
        }
      });
    });
  });

  describe('Shopping Cart', () => {
    it('should add products to cart', () => {
      cy.get('a[href="#/shop"]').click();
      
      // Add first product to cart
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Should see cart count
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      
      // Add same product again
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Should see updated count
      cy.get('[data-cy="cart-count"]').should('contain', '2');
    });

    it('should display cart contents correctly', () => {
      // Add product to cart
      cy.get('a[href="#/shop"]').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="product-name"]').invoke('text').as('productName');
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Go to cart
      cy.get('a[href="#/cart"]').click();
      cy.url().should('include', '/cart');
      
      // Should see cart contents
      cy.contains('Shopping Cart').should('be.visible');
      cy.get('@productName').then((name) => {
        cy.get('[data-cy="cart-item"]').should('contain', name);
      });
      
      // Should see cart totals
      cy.contains('Total:').should('be.visible');
      cy.get('button').contains('Proceed to Checkout').should('be.visible');
    });

    it('should update cart quantities', () => {
      // Add product to cart
      cy.get('a[href="#/shop"]').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Go to cart
      cy.get('a[href="#/cart"]').click();
      
      // Update quantity using + button
      cy.get('[data-cy="quantity-increase"]').click();
      cy.get('[data-cy="quantity-display"]').should('contain', '2');
      
      // Update quantity using - button
      cy.get('[data-cy="quantity-decrease"]').click();
      cy.get('[data-cy="quantity-display"]').should('contain', '1');
    });

    it('should remove items from cart', () => {
      // Add product to cart
      cy.get('a[href="#/shop"]').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Go to cart and remove item
      cy.get('a[href="#/cart"]').click();
      cy.get('[data-cy="remove-item-button"]').click();
      
      // Should show empty cart
      cy.contains('Your Cart is Empty').should('be.visible');
      cy.get('[data-cy="cart-count"]').should('not.exist');
    });

    it('should persist cart across sessions', () => {
      // Add product to cart
      cy.get('a[href="#/shop"]').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Refresh page
      cy.reload();
      
      // Cart should persist
      cy.get('[data-cy="cart-count"]').should('contain', '1');
    });
  });

  describe('Wishlist Functionality', () => {
    beforeEach(() => {
      // Create user account for wishlist testing
      const timestamp = Date.now();
      const testEmail = `wishlist${timestamp}@test.com`;
      
      cy.get('a[href="#/signup"]').click();
      cy.get('input[name="name"]').type('Wishlist User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('WishlistPassword123');
      cy.get('input[name="confirmPassword"]').type('WishlistPassword123');
      cy.get('button[type="submit"]').click();
    });

    it('should add products to wishlist', () => {
      cy.get('a[href="#/shop"]').click();
      
      // Add to wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Should see wishlist count
      cy.get('[data-cy="wishlist-count"]').should('be.visible');
    });

    it('should display wishlist page', () => {
      // Add item to wishlist first
      cy.get('a[href="#/shop"]').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Go to wishlist
      cy.get('a[href="#/wishlist"]').click();
      cy.url().should('include', '/wishlist');
      
      // Should see wishlist contents
      cy.get('[data-cy="wishlist-title"]').should('contain', 'My Wishlist');
      cy.get('[data-cy="wishlist-item"]').should('have.length', 1);
    });

    it('should remove items from wishlist', () => {
      // Add item to wishlist
      cy.get('a[href="#/shop"]').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Go to wishlist and remove
      cy.get('a[href="#/wishlist"]').click();
      cy.get('[data-cy="remove-from-wishlist"]').click();
      
      // Should show empty wishlist
      cy.get('[data-cy="empty-wishlist"]').should('be.visible');
    });
  });
});