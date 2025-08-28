describe('Authentication Lifecycle', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('User Registration', () => {
    it('should successfully register a new user', () => {
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@ramro.com`;
      
      // Navigate to signup
      cy.get('a[href="#/signup"]').click();
      cy.url().should('include', '/signup');
      
      // Fill registration form
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Verify successful registration
      cy.url().should('not.include', '/signup');
      cy.contains('Test User').should('be.visible');
    });

    it('should handle registration with already-used email', () => {
      // Try to register with existing email
      cy.get('a[href="#/signup"]').click();
      
      cy.get('input[name="name"]').type('Another User');
      cy.get('input[name="email"]').type('existing@ramro.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains('email already exists').should('be.visible');
      cy.url().should('include', '/signup');
    });
  });

  describe('User Login', () => {
    it('should successfully login with correct credentials', () => {
      cy.get('a[href="#/login"]').click();
      cy.url().should('include', '/login');
      
      // Use test credentials
      cy.get('input[name="email"]').type('test@ramro.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Verify successful login
      cy.url().should('not.include', '/login');
      cy.get('button').contains('Logout').should('be.visible');
    });

    it('should handle incorrect login credentials', () => {
      cy.get('a[href="#/login"]').click();
      
      cy.get('input[name="email"]').type('wrong@email.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Should show error and stay on login page
      cy.contains('Invalid email or password').should('be.visible');
      cy.url().should('include', '/login');
    });
  });

  describe('User Logout', () => {
    beforeEach(() => {
      // Login first
      cy.get('a[href="#/login"]').click();
      cy.get('input[name="email"]').type('test@ramro.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.get('button').contains('Logout').should('be.visible');
    });

    it('should successfully logout user', () => {
      // Click logout button
      cy.get('button').contains('Logout').click();
      
      // Verify logout
      cy.get('a[href="#/login"]').should('be.visible');
      cy.get('button').contains('Logout').should('not.exist');
    });
  });
});