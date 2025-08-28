describe('Authentication System Testing', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('User Registration', () => {
    it('should register new user successfully', () => {
      const timestamp = Date.now();
      const testEmail = `newuser${timestamp}@darjeelingsouls.com`;
      
      cy.get('a[href="#/signup"]').click();
      cy.url().should('include', '/signup');
      
      // Fill registration form
      cy.get('input[name="name"]').type('New Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('SecurePassword123');
      cy.get('input[name="confirmPassword"]').type('SecurePassword123');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to home page
      cy.url().should('not.include', '/signup');
      cy.url().should('not.include', '/login');
    });

    it('should validate registration form fields', () => {
      cy.get('a[href="#/signup"]').click();
      
      // Test empty form submission
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.get('[role="alert"]').should('be.visible');
      
      // Test password mismatch
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('different123');
      cy.get('button[type="submit"]').click();
      
      cy.get('[role="alert"]').should('contain', 'Passwords do not match');
    });

    it('should handle registration errors', () => {
      cy.get('a[href="#/signup"]').click();
      
      // Test with invalid email
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('TestPassword123');
      cy.get('input[name="confirmPassword"]').type('TestPassword123');
      cy.get('button[type="submit"]').click();
      
      cy.get('[role="alert"]').should('contain', 'valid email');
    });
  });

  describe('User Login', () => {
    it('should login existing user successfully', () => {
      // First create a user
      const timestamp = Date.now();
      const testEmail = `logintest${timestamp}@test.com`;
      
      cy.get('a[href="#/signup"]').click();
      cy.get('input[name="name"]').type('Login Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('LoginPassword123');
      cy.get('input[name="confirmPassword"]').type('LoginPassword123');
      cy.get('button[type="submit"]').click();
      
      // Logout
      cy.get('button').contains('Sign Out').click();
      
      // Now test login
      cy.get('a[href="#/login"]').click();
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('LoginPassword123');
      cy.get('button[type="submit"]').click();
      
      // Should be logged in
      cy.url().should('not.include', '/login');
      cy.get('button').contains('Sign Out').should('be.visible');
    });

    it('should validate login form', () => {
      cy.get('a[href="#/login"]').click();
      
      // Test empty form
      cy.get('button[type="submit"]').click();
      cy.get('[role="alert"]').should('be.visible');
      
      // Test invalid email format
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();
      
      cy.get('[role="alert"]').should('contain', 'valid email');
    });

    it('should handle login errors', () => {
      cy.get('a[href="#/login"]').click();
      
      // Test with non-existent user
      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Should show error
      cy.get('[role="alert"]').should('be.visible');
    });
  });

  describe('Session Management', () => {
    it('should maintain session across page refreshes', () => {
      const timestamp = Date.now();
      const testEmail = `session${timestamp}@test.com`;
      
      // Create and login user
      cy.get('a[href="#/signup"]').click();
      cy.get('input[name="name"]').type('Session User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('SessionPassword123');
      cy.get('input[name="confirmPassword"]').type('SessionPassword123');
      cy.get('button[type="submit"]').click();
      
      // Refresh page
      cy.reload();
      
      // Should still be logged in
      cy.get('button').contains('Sign Out').should('be.visible');
    });

    it('should logout user properly', () => {
      const timestamp = Date.now();
      const testEmail = `logout${timestamp}@test.com`;
      
      // Create and login user
      cy.get('a[href="#/signup"]').click();
      cy.get('input[name="name"]').type('Logout User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('LogoutPassword123');
      cy.get('input[name="confirmPassword"]').type('LogoutPassword123');
      cy.get('button[type="submit"]').click();
      
      // Logout
      cy.get('button').contains('Sign Out').click();
      
      // Should be logged out
      cy.get('a[href="#/login"]').should('be.visible');
      cy.get('button').contains('Sign Out').should('not.exist');
    });
  });
});