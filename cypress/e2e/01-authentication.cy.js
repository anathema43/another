describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('User Registration', () => {
    it('should allow new user registration', () => {
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@ramro.com`;
      
      cy.get('[data-cy="nav-signup"]').click();
      cy.url().should('include', '/signup');
      
      // Fill registration form
      cy.get('[data-cy="signup-name"]').type('Test User');
      cy.get('[data-cy="signup-email"]').type(testEmail);
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      
      // Submit form
      cy.get('[data-cy="signup-submit"]').click();
      
      // Verify successful registration
      cy.url().should('not.include', '/signup');

    it('should redirect to intended page after signup', () => {
      // Try to access protected route without login
      cy.visit('/#/wishlist');
      cy.url().should('include', '/login');
      
      // Go to signup instead
      cy.get('a').contains('Create an account').click();
      cy.url().should('include', '/signup');
      
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@ramro.com`;
      
      // Fill registration form
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect back to wishlist page
      cy.url().should('include', '/wishlist');
    });

    it('should redirect to home page when no redirect path exists after signup', () => {
      const timestamp = Date.now();
      const testEmail = `test${timestamp}@ramro.com`;
      
      cy.get('a[href="#/signup"]').click();
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect to home page
      cy.url().should('not.include', '/signup');
      cy.url().should('not.include', '/login');
    });
      cy.get('[data-cy="user-menu"]').should('be.visible');
      cy.get('[data-cy="welcome-message"]').should('contain', 'Test User');
    });

    it('should show validation errors for invalid registration', () => {
      cy.get('[data-cy="nav-signup"]').click();
      
      // Test empty form submission
      cy.get('[data-cy="signup-submit"]').click();
      cy.get('[data-cy="error-message"]').should('contain', 'required');
      
      // Test invalid email
      cy.get('[data-cy="signup-email"]').type('invalid-email');
      cy.get('[data-cy="signup-submit"]').click();
      cy.get('[data-cy="error-message"]').should('contain', 'valid email');
      
      // Test password mismatch
      cy.get('[data-cy="signup-email"]').clear().type('test@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('different123');
      cy.get('[data-cy="signup-submit"]').click();
      cy.get('[data-cy="error-message"]').should('contain', 'passwords do not match');
    });

    it('should prevent registration with existing email', () => {
      const existingEmail = Cypress.env('testUser').email;
      
      cy.get('[data-cy="nav-signup"]').click();
      cy.get('[data-cy="signup-name"]').type('Another User');
      cy.get('[data-cy="signup-email"]').type(existingEmail);
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      cy.get('[data-cy="error-message"]').should('contain', 'email already exists');
    });
  });

  describe('User Login', () => {
    it('should allow valid user login', () => {
      const user = Cypress.env('testUser');
      
      cy.get('[data-cy="nav-login"]').click();
      cy.url().should('include', '/login');
      
      cy.get('[data-cy="login-email"]').type(user.email);
      cy.get('[data-cy="login-password"]').type(user.password);
      cy.get('[data-cy="login-submit"]').click();
      
      // Verify successful login
      cy.url().should('not.include', '/login');
      cy.get('[data-cy="user-menu"]').should('be.visible');

    it('should redirect to intended page after login', () => {
      // Try to access protected route without login
      cy.visit('/#/account');
      cy.url().should('include', '/login');
      
      // Login
      cy.get('input[name="email"]').type('test@ramro.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect back to account page
      cy.url().should('include', '/account');
    });

    it('should redirect admin users to admin panel after login', () => {
      const admin = Cypress.env('adminUser');
      
      cy.get('a[href="#/login"]').click();
      cy.get('input[name="email"]').type(admin.email);
      cy.get('input[name="password"]').type(admin.password);
      cy.get('button[type="submit"]').click();
      
      // Admin should be redirected to admin panel
      cy.url().should('include', '/admin');
    });

    it('should redirect to home page when no redirect path exists', () => {
      cy.get('a[href="#/login"]').click();
      cy.get('input[name="email"]').type('test@ramro.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect to home page
      cy.url().should('not.include', '/login');
      cy.url().should('not.include', '/account');
    });
      cy.get('[data-cy="user-name"]').should('contain', user.name);
    });

    it('should reject invalid credentials', () => {
      cy.get('[data-cy="nav-login"]').click();
      
      cy.get('[data-cy="login-email"]').type('invalid@email.com');
      cy.get('[data-cy="login-password"]').type('wrongpassword');
      cy.get('[data-cy="login-submit"]').click();
      
      cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');
      cy.url().should('include', '/login');
    });

    it('should show validation for empty fields', () => {
      cy.get('[data-cy="nav-login"]').click();
      cy.get('[data-cy="login-submit"]').click();
      
      cy.get('[data-cy="email-error"]').should('be.visible');
      cy.get('[data-cy="password-error"]').should('be.visible');
    });
  });

  describe('Google OAuth Login', () => {
    it('should handle Google OAuth flow', () => {
      cy.get('[data-cy="nav-login"]').click();
      
      // Mock Google OAuth
      cy.window().then((win) => {
        cy.stub(win, 'open').returns({
          closed: false,
          location: { href: 'https://accounts.google.com/oauth/callback?code=test' }
        });
      });
      
      cy.get('[data-cy="google-login-button"]').click();
      
      // Verify OAuth flow initiation
      cy.window().its('open').should('have.been.called');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.loginAsUser();
    });

    it('should successfully logout user', () => {
      cy.get('[data-cy="user-menu"]').click();
      cy.get('[data-cy="logout-button"]').click();
      
      // Verify logout
      cy.get('[data-cy="nav-login"]').should('be.visible');
      cy.get('[data-cy="user-menu"]').should('not.exist');
      cy.window().its('localStorage').should('not.contain.key', 'auth-storage');
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', () => {
      cy.get('[data-cy="nav-login"]').click();
      cy.get('[data-cy="forgot-password-link"]').click();
      
      cy.get('[data-cy="reset-email"]').type('test@ramro.com');
      cy.get('[data-cy="reset-submit"]').click();
      
      cy.contains('Password reset email sent').should('be.visible');
    });
    
    it('should validate email before sending reset', () => {
      cy.get('[data-cy="nav-login"]').click();
      cy.get('[data-cy="forgot-password-link"]').click();
      
      // Test empty email
      cy.get('[data-cy="reset-submit"]').click();
      cy.get('[data-cy="reset-submit"]').should('be.disabled');
      
      // Test invalid email
      cy.get('[data-cy="reset-email"]').type('invalid-email');
      cy.get('[data-cy="reset-submit"]').click();
      cy.contains('valid email address').should('be.visible');
    });
    
    it('should show intelligent error for wrong password', () => {
      cy.get('[data-cy="nav-login"]').click();
      
      cy.get('[data-cy="login-email"]').type('test@ramro.com');
      cy.get('[data-cy="login-password"]').type('wrongpassword');
      cy.get('[data-cy="login-submit"]').click();
      
      cy.contains('Incorrect password').should('be.visible');
      cy.get('[data-cy="forgot-password-link"]').should('have.class', 'font-semibold');
    });
    
    it('should show signup button for non-existent user', () => {
      cy.get('[data-cy="nav-login"]').click();
      
      cy.get('[data-cy="login-email"]').type('nonexistent@example.com');
      cy.get('[data-cy="login-password"]').type('password123');
      cy.get('[data-cy="login-submit"]').click();
      
      cy.contains('No account found with this email').should('be.visible');
      cy.get('a').contains('Create Account Instead').should('be.visible');
    });
  });

  describe('Session Management', () => {
    it('should maintain session across page refreshes', () => {
      cy.loginAsUser();
      cy.reload();
      
      cy.get('[data-cy="user-menu"]').should('be.visible');
      cy.window().its('localStorage').should('contain.key', 'auth-storage');
    });

    it('should redirect to login for protected routes', () => {
      cy.visit('/account');
      cy.url().should('include', '/login');
      
      cy.visit('/admin');
      cy.url().should('include', '/login');
    });
  });
});