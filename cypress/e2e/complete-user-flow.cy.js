describe('Complete User Flow - Darjeeling Souls E-commerce', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });

  describe('Authentication Flow', () => {
    it('should complete signup and login flow', () => {
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@darjeelingsouls.com`;
      
      // Test Signup
      cy.get('a[href="#/signup"]').click();
      cy.url().should('include', '/signup');
      
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('TestPassword123');
      cy.get('input[name="confirmPassword"]').type('TestPassword123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect after successful signup
      cy.url().should('not.include', '/signup');
      
      // Test Logout
      cy.get('button').contains('Sign Out').click();
      
      // Test Login
      cy.get('a[href="#/login"]').click();
      cy.url().should('include', '/login');
      
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('TestPassword123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect after successful login
      cy.url().should('not.include', '/login');
    });

    it('should handle authentication errors gracefully', () => {
      cy.get('a[href="#/login"]').click();
      
      // Test with invalid credentials
      cy.get('input[name="email"]').type('invalid@email.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.get('[role="alert"]').should('be.visible');
      cy.url().should('include', '/login');
    });
  });

  describe('Product Browsing and Shopping', () => {
    it('should browse products and add to cart', () => {
      // Navigate to shop
      cy.get('a[href="#/shop"]').click();
      cy.url().should('include', '/shop');
      
      // Should see products
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
      
      // Add product to cart
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Should see cart count
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      
      // Go to cart
      cy.get('a[href="#/cart"]').click();
      cy.url().should('include', '/cart');
      
      // Should see product in cart
      cy.contains('Shopping Cart').should('be.visible');
      cy.get('[data-cy="cart-item"]').should('have.length', 1);
    });

    it('should handle wishlist functionality', () => {
      // Create account first
      const timestamp = Date.now();
      const testEmail = `wishlist${timestamp}@test.com`;
      
      cy.get('a[href="#/signup"]').click();
      cy.get('input[name="name"]').type('Wishlist User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('TestPassword123');
      cy.get('input[name="confirmPassword"]').type('TestPassword123');
      cy.get('button[type="submit"]').click();
      
      // Navigate to shop
      cy.get('a[href="#/shop"]').click();
      
      // Add to wishlist
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="wishlist-button"]').click();
      });
      
      // Should see wishlist count
      cy.get('[data-cy="wishlist-count"]').should('be.visible');
      
      // Go to wishlist
      cy.get('a[href="#/wishlist"]').click();
      cy.url().should('include', '/wishlist');
      
      // Should see product in wishlist
      cy.get('[data-cy="wishlist-item"]').should('have.length', 1);
    });
  });

  describe('Stories and Content', () => {
    it('should display stories page correctly', () => {
      cy.get('a[href="#/stories"]').click();
      cy.url().should('include', '/stories');
      
      // Should see stories
      cy.contains('Darjeeling Stories & News').should('be.visible');
      cy.get('article').should('have.length.greaterThan', 0);
      
      // Test story detail
      cy.get('article').first().within(() => {
        cy.get('a').contains('Read Story').click();
      });
      
      cy.url().should('include', '/stories/');
      cy.get('article').should('be.visible');
    });

    it('should display artisans directory', () => {
      cy.get('a[href="#/artisans"]').click();
      cy.url().should('include', '/artisans');
      
      // Should see artisans
      cy.contains('Meet Our Artisans').should('be.visible');
      cy.get('a').should('have.length.greaterThan', 0);
      
      // Test artisan profile
      cy.get('a').first().click();
      cy.url().should('include', '/artisans/');
    });
  });

  describe('Complete Purchase Flow', () => {
    it('should complete full purchase journey', () => {
      const timestamp = Date.now();
      const testEmail = `purchase${timestamp}@test.com`;
      
      // 1. Create account
      cy.get('a[href="#/signup"]').click();
      cy.get('input[name="name"]').type('Purchase User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('TestPassword123');
      cy.get('input[name="confirmPassword"]').type('TestPassword123');
      cy.get('button[type="submit"]').click();
      
      // 2. Browse and add products
      cy.get('a[href="#/shop"]').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
      
      // 3. Go to cart
      cy.get('a[href="#/cart"]').click();
      cy.contains('Shopping Cart').should('be.visible');
      
      // 4. Proceed to checkout
      cy.get('button').contains('Proceed to Checkout').click();
      cy.url().should('include', '/checkout');
      
      // 5. Fill shipping information
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="phone"]').type('+91 9876543210');
      cy.get('input[name="address"]').type('123 Test Street');
      cy.get('input[name="city"]').type('Mumbai');
      cy.get('input[name="zipCode"]').type('400001');
      
      // 6. Select payment method
      cy.get('input[value="cod"]').check();
      
      // 7. Place order
      cy.get('button').contains('Place Order').click();
      
      // 8. Should see success or orders page
      cy.url().should('include', '/orders');
    });
  });

  describe('Content Navigation', () => {
    it('should navigate between all content types', () => {
      // Test stories navigation
      cy.get('a[href="/stories"]').click();
      cy.url().should('include', '/stories');
      cy.get('article').should('have.length.greaterThan', 0);
      
      // Test story detail
      cy.get('article').first().within(() => {
        cy.get('a').contains('Read Story').click();
      });
      cy.url().should('include', '/stories/');
      cy.get('h1').should('be.visible');
      
      // Back to stories
      cy.get('a').contains('Back to Stories').click();
      cy.url().should('include', '/stories');
      
      // Test artisans navigation
      cy.get('a[href="/artisans"]').click();
      cy.url().should('include', '/artisans');
      cy.get('[data-cy="artisan-card"]').should('have.length.greaterThan', 0);
      
      // Test artisan profile
      cy.get('[data-cy="artisan-card"]').first().click();
      cy.url().should('include', '/artisans/');
      cy.get('h1').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Test offline functionality
      cy.window().then((win) => {
        win.navigator.onLine = false;
        win.dispatchEvent(new Event('offline'));
      });
      
      cy.get('a[href="#/shop"]').click();
      
      // Should handle offline state
      cy.get('body').should('be.visible');
    });

    it('should handle invalid routes', () => {
      cy.visit('/#/nonexistent-page');
      
      // Should redirect to home or show 404
      cy.url().should('not.include', '/nonexistent-page');
    });
  });

  describe('Mobile Experience', () => {
    beforeEach(() => {
      cy.viewport('iphone-6');
    });

    it('should work properly on mobile devices', () => {
      // Test mobile navigation
      cy.get('[data-cy="mobile-menu-button"]').should('be.visible');
      cy.get('[data-cy="mobile-menu-button"]').click();
      cy.get('[data-cy="mobile-menu"]').should('be.visible');
      
      // Test mobile shopping
      cy.get('[data-cy="mobile-nav-shop"]').click();
      cy.url().should('include', '/shop');
      
      // Should see products on mobile
      cy.get('[data-cy="product-card"]').should('be.visible');
    });
  });

  describe('Performance and Accessibility', () => {
    it('should load pages quickly', () => {
      const pages = ['/', '/shop', '/about', '/contact', '/stories', '/artisans'];
      
      pages.forEach(page => {
        const startTime = Date.now();
        cy.visit(`/#${page}`);
        cy.get('body').should('be.visible');
        
        cy.then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(5000); // 5 second limit
        });
      });
    });

    it('should have proper accessibility features', () => {
      cy.visit('/');
      
      // Check for proper heading structure
      cy.get('h1').should('exist');
      
      // Check for alt text on images
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
      
      // Check for proper form labels
      cy.visit('/#/contact');
      cy.get('input').each(($input) => {
        const id = $input.attr('id');
        if (id) {
          cy.get(`label[for="${id}"]`).should('exist');
        }
      });
    });
  });
});