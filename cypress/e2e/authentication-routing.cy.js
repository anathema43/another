describe('Authentication Routing E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login Routing', () => {
    it('should redirect to home page after successful login', () => {
      // First create a user account
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Login Test User');
      cy.get('[data-cy="signup-email"]').type('logintest@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should redirect to home after signup
      cy.url().should('eq', Cypress.config().baseUrl + '/#/');
      
      // Sign out
      cy.get('[data-cy="logout-button"]').click();
      
      // Now test login
      cy.visit('/login');
      cy.get('[data-cy="login-email"]').type('logintest@example.com');
      cy.get('[data-cy="login-password"]').type('password123');
      cy.get('[data-cy="login-submit"]').click();
      
      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/#/');
    });

    it('should redirect to saved path after login', () => {
      // First create a user account
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Redirect Test User');
      cy.get('[data-cy="signup-email"]').type('redirect@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Sign out
      cy.get('[data-cy="logout-button"]').click();
      
      // Try to access protected route (should save redirect path)
      cy.visit('/checkout');
      
      // Should be redirected to login
      cy.url().should('include', '/login');
      
      // Login
      cy.get('[data-cy="login-email"]').type('redirect@example.com');
      cy.get('[data-cy="login-password"]').type('password123');
      cy.get('[data-cy="login-submit"]').click();
      
      // Should redirect to originally requested page
      cy.url().should('include', '/checkout');
    });

    it('should stay on login page when login fails', () => {
      cy.visit('/login');
      
      // Try to login with invalid credentials
      cy.get('[data-cy="login-email"]').type('invalid@example.com');
      cy.get('[data-cy="login-password"]').type('wrongpassword');
      cy.get('[data-cy="login-submit"]').click();
      
      // Should stay on login page and show error
      cy.url().should('include', '/login');
      cy.get('[role="alert"]').should('be.visible');
    });

    it('should handle admin user routing', () => {
      // This test assumes an admin user exists
      // In a real test, you'd create an admin user first
      cy.visit('/login');
      
      // Try to login as admin (this would need to be set up in test data)
      cy.get('[data-cy="login-email"]').type('admin@test.com');
      cy.get('[data-cy="login-password"]').type('adminpassword');
      cy.get('[data-cy="login-submit"]').click();
      
      // Admin users should go to admin panel
      cy.url().should('include', '/admin');
    });
  });

  describe('Signup Routing', () => {
    it('should redirect to home page after successful signup', () => {
      cy.visit('/signup');
      
      cy.get('[data-cy="signup-name"]').type('New User');
      cy.get('[data-cy="signup-email"]').type('newuser@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/#/');
      
      // Should be logged in
      cy.get('[data-cy="nav-account"]').should('be.visible');
    });

    it('should stay on signup page when signup fails', () => {
      cy.visit('/signup');
      
      // Try to signup with invalid data
      cy.get('[data-cy="signup-name"]').type('Test User');
      cy.get('[data-cy="signup-email"]').type('invalid-email');
      cy.get('[data-cy="signup-password"]').type('123'); // Too short
      cy.get('[data-cy="signup-confirm-password"]').type('456'); // Doesn't match
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should stay on signup page and show validation errors
      cy.url().should('include', '/signup');
      cy.get('[role="alert"]').should('be.visible');
    });

    it('should validate form before attempting signup', () => {
      cy.visit('/signup');
      
      // Submit empty form
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should show validation errors
      cy.contains('Full name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
      
      // Should not navigate
      cy.url().should('include', '/signup');
    });

    it('should validate password confirmation', () => {
      cy.visit('/signup');
      
      cy.get('[data-cy="signup-name"]').type('Test User');
      cy.get('[data-cy="signup-email"]').type('test@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('differentpassword');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should show password mismatch error
      cy.contains('Passwords do not match').should('be.visible');
      cy.url().should('include', '/signup');
    });
  });

  describe('Protected Route Behavior', () => {
    it('should save redirect path when accessing protected routes', () => {
      // Try to access checkout without being logged in
      cy.visit('/checkout');
      
      // Should redirect to login
      cy.url().should('include', '/login');
      
      // Login
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Protected Route User');
      cy.get('[data-cy="signup-email"]').type('protected@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should redirect to originally requested page
      cy.url().should('include', '/checkout');
    });

    it('should redirect to login for account page when not authenticated', () => {
      cy.visit('/account');
      
      cy.url().should('include', '/login');
    });

    it('should redirect to login for orders page when not authenticated', () => {
      cy.visit('/orders');
      
      cy.url().should('include', '/login');
    });
  });

  describe('Session Management', () => {
    it('should maintain authentication state across page refreshes', () => {
      // Sign up
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Session Test User');
      cy.get('[data-cy="signup-email"]').type('session@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should be logged in
      cy.get('[data-cy="nav-account"]').should('be.visible');
      
      // Refresh page
      cy.reload();
      
      // Should still be logged in
      cy.get('[data-cy="nav-account"]').should('be.visible');
    });

    it('should clear authentication state after logout', () => {
      // Sign up and login
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Logout Test User');
      cy.get('[data-cy="signup-email"]').type('logout@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should be logged in
      cy.get('[data-cy="nav-account"]').should('be.visible');
      
      // Logout
      cy.get('[data-cy="logout-button"]').click();
      
      // Should show login/signup options
      cy.get('[data-cy="nav-login"]').should('be.visible');
      cy.get('[data-cy="nav-signup"]').should('be.visible');
      cy.get('[data-cy="nav-account"]').should('not.exist');
    });
  });
});