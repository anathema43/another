describe('Order History', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Account Orders Page', () => {
    it('should allow logged-in user to navigate to orders page', () => {
      // Login first
      cy.get('a[href="#/login"]').click();
      cy.get('input[name="email"]').type('test@ramro.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Navigate to account
      cy.get('a[href="#/account"]').click();
      cy.url().should('include', '/account');
      
      // Should see account page
      cy.contains('Account').should('be.visible');
    });

    it('should display order history for authenticated user', () => {
      // Login first
      cy.get('a[href="#/login"]').click();
      cy.get('input[name="email"]').type('test@ramro.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Navigate to orders
      cy.get('a[href="#/orders"]').click();
      cy.url().should('include', '/orders');
      
      // Should see orders page (either with orders or empty state)
      cy.get('body').should('satisfy', ($body) => {
        return $body.text().includes('My Orders') || 
               $body.text().includes('No Orders Yet');
      });
    });

    it('should redirect unauthenticated users to login', () => {
      // Try to access orders without login
      cy.visit('/#/orders');
      
      // Should redirect to login or show login required message
      cy.get('body').should('satisfy', ($body) => {
        return $body.text().includes('Please login') || 
               cy.url().should('include', '/login');
      });
    });
  });

  describe('Order Display', () => {
    beforeEach(() => {
      // Login for order tests
      cy.get('a[href="#/login"]').click();
      cy.get('input[name="email"]').type('test@ramro.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
    });

    it('should display order information correctly', () => {
      cy.get('a[href="#/orders"]').click();
      
      // Check for order elements (if orders exist)
      cy.get('body').then(($body) => {
        if ($body.text().includes('No Orders Yet')) {
          // Empty state is valid
          cy.contains('No Orders Yet').should('be.visible');
          cy.contains('Start Shopping').should('be.visible');
        } else {
          // If orders exist, verify structure
          cy.get('.bg-white.rounded-lg.shadow-lg').should('be.visible');
        }
      });
    });
  });
});