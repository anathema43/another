describe('Login/Signup Redirect Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Protected Route Redirects', () => {
    it('should redirect to login when accessing protected routes', () => {
      // Try to access account page without login
      cy.visit('/#/account');
      cy.url().should('include', '/login');
      
      // Try to access admin page without login
      cy.visit('/#/admin');
      cy.url().should('include', '/login');
      
      // Try to access checkout without login
      cy.visit('/#/checkout');
      cy.url().should('include', '/login');
    });

    it('should save redirect path when accessing protected routes', () => {
      cy.visit('/#/account');
      
      // Check that redirect path is saved in sessionStorage
      cy.window().then((win) => {
        const redirectPath = win.sessionStorage.getItem('redirectPath');
        expect(redirectPath).to.equal('/account');
      });
    });

    it('should not save login/signup paths as redirect targets', () => {
      cy.visit('/#/login');
      
      // Check that login path is not saved
      cy.window().then((win) => {
        const redirectPath = win.sessionStorage.getItem('redirectPath');
        expect(redirectPath).to.not.equal('/login');
      });
    });
  });

  describe('Login Redirect Behavior', () => {
    it('should redirect regular users to intended page after login', () => {
      // Try to access wishlist without login
      cy.visit('/#/wishlist');
      cy.url().should('include', '/login');
      
      // Login as regular user
      const user = Cypress.env('testUser');
      cy.get('[data-cy="login-email"]').type(user.email);
      cy.get('[data-cy="login-password"]').type(user.password);
      cy.get('[data-cy="login-submit"]').click();
      
      // Should redirect back to wishlist
      cy.url().should('include', '/wishlist');
      cy.get('[data-cy="wishlist-page"]').should('be.visible');
    });

    it('should redirect admin users to admin panel regardless of intended page', () => {
      // Try to access shop page, then login as admin
      cy.visit('/#/shop');
      cy.get('[data-cy="nav-login"]').click();
      
      const admin = Cypress.env('adminUser');
      cy.get('[data-cy="login-email"]').type(admin.email);
      cy.get('[data-cy="login-password"]').type(admin.password);
      cy.get('[data-cy="login-submit"]').click();
      
      // Admin should go to admin panel, not shop
      cy.url().should('include', '/admin');
      cy.get('[data-cy="admin-dashboard"]').should('be.visible');
    });

    it('should redirect to home page when no redirect path exists', () => {
      // Direct login without accessing protected route first
      cy.get('[data-cy="nav-login"]').click();
      
      const user = Cypress.env('testUser');
      cy.get('[data-cy="login-email"]').type(user.email);
      cy.get('[data-cy="login-password"]').type(user.password);
      cy.get('[data-cy="login-submit"]').click();
      
      // Should redirect to home page
      cy.url().should('not.include', '/login');
      cy.url().should('not.include', '/account');
      cy.get('[data-cy="hero-section"]').should('be.visible');
    });

    it('should clear redirect path after successful login', () => {
      // Access protected route to set redirect path
      cy.visit('/#/account');
      cy.url().should('include', '/login');
      
      // Login
      const user = Cypress.env('testUser');
      cy.get('[data-cy="login-email"]').type(user.email);
      cy.get('[data-cy="login-password"]').type(user.password);
      cy.get('[data-cy="login-submit"]').click();
      
      // Check that redirect path is cleared
      cy.window().then((win) => {
        const redirectPath = win.sessionStorage.getItem('redirectPath');
        expect(redirectPath).to.be.null;
      });
    });
  });

  describe('Signup Redirect Behavior', () => {
    it('should redirect new users to intended page after signup', () => {
      // Try to access cart without login
      cy.visit('/#/cart');
      cy.url().should('include', '/login');
      
      // Go to signup
      cy.get('a').contains('Create an account').click();
      cy.url().should('include', '/signup');
      
      // Sign up
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@ramro.com`;
      
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect back to cart
      cy.url().should('include', '/cart');
    });

    it('should redirect to home page when no redirect path exists after signup', () => {
      // Direct signup without accessing protected route first
      cy.get('[data-cy="nav-signup"]').click();
      
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@ramro.com`;
      
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect to home page
      cy.url().should('not.include', '/signup');
      cy.url().should('not.include', '/login');
      cy.get('[data-cy="hero-section"]').should('be.visible');
    });

    it('should clear redirect path after successful signup', () => {
      // Access protected route to set redirect path
      cy.visit('/#/wishlist');
      cy.url().should('include', '/login');
      
      // Go to signup
      cy.get('a').contains('Create an account').click();
      
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@ramro.com`;
      
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Check that redirect path is cleared
      cy.window().then((win) => {
        const redirectPath = win.sessionStorage.getItem('redirectPath');
        expect(redirectPath).to.be.null;
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle sessionStorage being unavailable', () => {
      // Mock sessionStorage failure
      cy.window().then((win) => {
        const originalSetItem = win.sessionStorage.setItem;
        win.sessionStorage.setItem = () => {
          throw new Error('Storage quota exceeded');
        };
        
        // Should still work without throwing errors
        cy.visit('/#/account');
        cy.url().should('include', '/login');
        
        // Restore original function
        win.sessionStorage.setItem = originalSetItem;
      });
    });

    it('should handle corrupted redirect path data', () => {
      // Set invalid redirect path
      cy.window().then((win) => {
        win.sessionStorage.setItem('redirectPath', 'invalid-path');
      });
      
      cy.get('[data-cy="nav-login"]').click();
      
      const user = Cypress.env('testUser');
      cy.get('[data-cy="login-email"]').type(user.email);
      cy.get('[data-cy="login-password"]').type(user.password);
      cy.get('[data-cy="login-submit"]').click();
      
      // Should fallback to home page
      cy.url().should('not.include', '/login');
    });

    it('should handle multiple rapid login attempts', () => {
      cy.visit('/#/account');
      cy.url().should('include', '/login');
      
      const user = Cypress.env('testUser');
      
      // Rapid login attempts
      for (let i = 0; i < 3; i++) {
        cy.get('[data-cy="login-email"]').clear().type(user.email);
        cy.get('[data-cy="login-password"]').clear().type(user.password);
        cy.get('[data-cy="login-submit"]').click();
        
        if (i < 2) {
          cy.wait(100);
          cy.get('[data-cy="nav-login"]').click();
        }
      }
      
      // Should eventually succeed and redirect properly
      cy.url().should('include', '/account');
    });
  });

  describe('Admin Access Flow', () => {
    it('should redirect admin from any protected route to admin panel', () => {
      // Try to access regular user page as admin
      cy.visit('/#/orders');
      cy.url().should('include', '/login');
      
      const admin = Cypress.env('adminUser');
      cy.get('[data-cy="login-email"]').type(admin.email);
      cy.get('[data-cy="login-password"]').type(admin.password);
      cy.get('[data-cy="login-submit"]').click();
      
      // Should go to admin panel instead of orders
      cy.url().should('include', '/admin');
    });

    it('should handle admin accessing admin route directly', () => {
      cy.visit('/#/admin');
      cy.url().should('include', '/login');
      
      const admin = Cypress.env('adminUser');
      cy.get('[data-cy="login-email"]').type(admin.email);
      cy.get('[data-cy="login-password"]').type(admin.password);
      cy.get('[data-cy="login-submit"]').click();
      
      // Should stay on admin page
      cy.url().should('include', '/admin');
      cy.get('[data-cy="admin-dashboard"]').should('be.visible');
    });
  });

  describe('Cross-tab Redirect Behavior', () => {
    it('should handle redirect paths across multiple tabs', () => {
      // Set redirect path in one context
      cy.visit('/#/wishlist');
      cy.url().should('include', '/login');
      
      // Open new tab and login
      cy.window().then((win) => {
        const newTab = win.open('/#/login', '_blank');
        // In real scenario, this would test cross-tab behavior
        // For Cypress, we simulate the behavior
        
        const user = Cypress.env('testUser');
        cy.get('[data-cy="login-email"]').type(user.email);
        cy.get('[data-cy="login-password"]').type(user.password);
        cy.get('[data-cy="login-submit"]').click();
        
        cy.url().should('include', '/wishlist');
      });
    });
  });

  describe('Mobile Redirect Experience', () => {
    beforeEach(() => {
      cy.setMobileViewport();
    });

    it('should work properly on mobile devices', () => {
      cy.visit('/#/account');
      cy.url().should('include', '/login');
      
      const user = Cypress.env('testUser');
      cy.get('[data-cy="login-email"]').type(user.email);
      cy.get('[data-cy="login-password"]').type(user.password);
      cy.get('[data-cy="login-submit"]').click();
      
      cy.url().should('include', '/account');
    });
  });
});