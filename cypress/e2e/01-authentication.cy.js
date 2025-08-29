describe('Authentication System E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('User Registration', () => {
    it('should complete user registration successfully', () => {
      cy.visit('/signup');
      
      // Fill registration form
      cy.get('[data-cy="signup-name"]').type('Test User');
      cy.get('[data-cy="signup-email"]').type('test@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      
      // Submit form
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/#/');
      
      // Should be logged in
      cy.get('[data-cy="nav-account"]').should('be.visible');
    });

    it('should validate registration form', () => {
      cy.visit('/signup');
      
      // Submit empty form
      cy.get('[data-cy="signup-submit"]').click();
      
      // Should show validation errors
      cy.contains('Full name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should validate password confirmation', () => {
      cy.visit('/signup');
      
      cy.get('[data-cy="signup-name"]').type('Test User');
      cy.get('[data-cy="signup-email"]').type('test@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('differentpassword');
      
      cy.get('[data-cy="signup-submit"]').click();
      
      cy.contains('Passwords do not match').should('be.visible');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Create user first
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Login Test User');
      cy.get('[data-cy="signup-email"]').type('logintest@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Sign out
      cy.get('[data-cy="logout-button"]').click();
    });

    it('should login with valid credentials', () => {
      cy.visit('/login');
      
      cy.get('[data-cy="login-email"]').type('logintest@example.com');
      cy.get('[data-cy="login-password"]').type('password123');
      cy.get('[data-cy="login-submit"]').click();
      
      // Should redirect to home
      cy.url().should('eq', Cypress.config().baseUrl + '/#/');
      cy.get('[data-cy="nav-account"]').should('be.visible');
    });

    it('should handle invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('[data-cy="login-email"]').type('invalid@example.com');
      cy.get('[data-cy="login-password"]').type('wrongpassword');
      cy.get('[data-cy="login-submit"]').click();
      
      // Should stay on login page with error
      cy.url().should('include', '/login');
      cy.get('[role="alert"]').should('be.visible');
    });

    it('should handle forgot password', () => {
      cy.visit('/login');
      
      cy.get('[data-cy="forgot-password-link"]').click();
      cy.get('[data-cy="reset-email"]').type('test@example.com');
      cy.get('[data-cy="reset-submit"]').click();
      
      // Should show success message
      cy.contains('Password reset email sent').should('be.visible');
    });
  });

  describe('Session Management', () => {
    it('should maintain session across page refresh', () => {
      // Sign up and login
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Session User');
      cy.get('[data-cy="signup-email"]').type('session@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Refresh page
      cy.reload();
      
      // Should still be logged in
      cy.get('[data-cy="nav-account"]').should('be.visible');
    });

    it('should logout successfully', () => {
      // Sign up first
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Logout User');
      cy.get('[data-cy="signup-email"]').type('logout@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Logout
      cy.get('[data-cy="logout-button"]').click();
      
      // Should show login/signup options
      cy.get('[data-cy="nav-login"]').should('be.visible');
      cy.get('[data-cy="nav-signup"]').should('be.visible');
    });
  });
});