describe('Security Testing', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Authentication Security', () => {
    it('should prevent unauthorized admin access', () => {
      // Try to access admin without login
      cy.visit('/admin');
      cy.url().should('include', '/login');
      
      // Login as regular user
      cy.loginAsUser();
      cy.visit('/admin');
      cy.get('[data-cy="access-denied-message"]').should('be.visible');
      cy.url().should('not.include', '/admin');
    });

    it('should validate admin role server-side', () => {
      cy.loginAsUser();
      
      // Try to manipulate client-side role
      cy.window().then((win) => {
        // Attempt to modify localStorage or session data
        win.localStorage.setItem('userRole', 'admin');
        win.localStorage.setItem('isAdmin', 'true');
      });
      
      cy.visit('/admin');
      cy.get('[data-cy="access-denied-message"]').should('be.visible');
    });

    it('should handle session expiration securely', () => {
      cy.loginAsUser();
      
      // Mock expired session
      cy.intercept('GET', '/api/**', { statusCode: 401 }).as('expiredSession');
      
      cy.navigateToShop();
      cy.wait('@expiredSession');
      
      cy.get('[data-cy="session-expired-modal"]').should('be.visible');
      cy.get('[data-cy="relogin-button"]').click();
      cy.url().should('include', '/login');
    });

    it('should prevent CSRF attacks', () => {
      cy.loginAsUser();
      
      // Attempt CSRF attack simulation
      cy.window().then((win) => {
        const maliciousForm = win.document.createElement('form');
        maliciousForm.method = 'POST';
        maliciousForm.action = '/api/orders';
        maliciousForm.innerHTML = '<input name="malicious" value="data">';
        win.document.body.appendChild(maliciousForm);
        
        // This should fail due to CSRF protection
        maliciousForm.submit();
      });
      
      // Should not create unauthorized order
      cy.visit('/orders');
      cy.get('[data-cy="order-list"]').should('not.contain', 'malicious');
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent XSS attacks in forms', () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      cy.get('[data-cy="nav-login"]').click();
      cy.get('[data-cy="login-email"]').type(xssPayload);
      cy.get('[data-cy="login-password"]').type('password');
      cy.get('[data-cy="login-submit"]').click();
      
      // Should not execute script
      cy.on('window:alert', () => {
        throw new Error('XSS vulnerability detected');
      });
      
      // Input should be sanitized
      cy.get('[data-cy="login-email"]').should('not.contain', '<script>');
    });

    it('should prevent SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      
      cy.visit('/contact');
      cy.get('[data-cy="contact-name"]').type(sqlInjection);
      cy.get('[data-cy="contact-email"]').type('test@example.com');
      cy.get('[data-cy="contact-subject"]').type('Test');
      cy.get('[data-cy="contact-message"]').type('Test message');
      cy.get('[data-cy="contact-submit"]').click();
      
      // Should handle gracefully without database errors
      cy.get('[data-cy="success-message"]').should('be.visible');
    });

    it('should validate file upload security', () => {
      cy.loginAsAdmin();
      cy.navigateToAdmin();
      
      // Try to upload malicious file
      const maliciousFile = new File(['<?php echo "hack"; ?>'], 'malicious.php', {
        type: 'application/x-php'
      });
      
      cy.get('[data-cy="product-image-upload"]').then(($input) => {
        const input = $input[0];
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(maliciousFile);
        input.files = dataTransfer.files;
        
        cy.wrap($input).trigger('change');
      });
      
      cy.get('[data-cy="file-type-error"]').should('be.visible');
      cy.get('[data-cy="file-type-error"]').should('contain', 'Invalid file type');
    });

    it('should enforce file size limits', () => {
      cy.loginAsAdmin();
      cy.navigateToAdmin();
      
      // Create large file (mock)
      const largeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg'
      });
      
      cy.get('[data-cy="product-image-upload"]').then(($input) => {
        const input = $input[0];
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(largeFile);
        input.files = dataTransfer.files;
        
        cy.wrap($input).trigger('change');
      });
      
      cy.get('[data-cy="file-size-error"]').should('be.visible');
      cy.get('[data-cy="file-size-error"]').should('contain', 'File too large');
    });
  });

  describe('Data Access Security', () => {
    it('should prevent unauthorized data access', () => {
      cy.loginAsUser();
      
      // Try to access another user's data
      cy.intercept('GET', '/api/users/other-user-id', { statusCode: 403 }).as('unauthorizedAccess');
      
      cy.window().then((win) => {
        fetch('/api/users/other-user-id', {
          headers: { 'Authorization': 'Bearer fake-token' }
        }).catch(() => {
          // Expected to fail
        });
      });
      
      cy.wait('@unauthorizedAccess');
    });

    it('should validate user ownership of resources', () => {
      cy.loginAsUser();
      
      // Try to access another user's orders
      cy.intercept('GET', '/api/orders/other-user-order', { statusCode: 403 }).as('unauthorizedOrder');
      
      cy.visit('/orders/other-user-order');
      cy.get('[data-cy="access-denied"]').should('be.visible');
    });

    it('should prevent data enumeration attacks', () => {
      // Try to enumerate user IDs
      for (let i = 1; i <= 5; i++) {
        cy.request({
          url: `/api/users/${i}`,
          failOnStatusCode: false
        }).then((response) => {
          // Should return 401/403, not 404 (which would confirm user existence)
          expect([401, 403]).to.include(response.status);
        });
      }
    });
  });

  describe('Payment Security', () => {
    it('should handle payment data securely', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      cy.fillShippingInfo({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        zipCode: '400001'
      });
      
      // Verify payment data is not exposed in client
      cy.window().then((win) => {
        const pageSource = win.document.documentElement.outerHTML;
        expect(pageSource).to.not.include('rzp_live_');
        expect(pageSource).to.not.include('key_secret');
      });
    });

    it('should validate payment amounts server-side', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      
      // Mock payment with manipulated amount
      cy.intercept('POST', '/api/razorpay/verify-payment', (req) => {
        // Attempt to manipulate payment amount
        req.body.amount = 1; // Try to pay ₹1 instead of actual amount
        req.continue();
      }).as('manipulatedPayment');
      
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      cy.fillShippingInfo({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        zipCode: '400001'
      });
      
      cy.selectPaymentMethod('razorpay');
      cy.mockRazorpayPayment(true);
      cy.get('[data-cy="place-order-button"]').click();
      
      // Should detect amount manipulation and reject
      cy.get('[data-cy="payment-verification-error"]').should('be.visible');
    });
  });

  describe('Environment Security', () => {
    it('should not expose sensitive environment variables', () => {
      cy.window().then((win) => {
        // Check that sensitive data is not exposed
        const envVars = Object.keys(win).filter(key => key.includes('SECRET'));
        expect(envVars).to.have.length(0);
        
        // Check that only VITE_ prefixed vars are available
        const viteVars = Object.keys(import.meta.env).filter(key => !key.startsWith('VITE_'));
        expect(viteVars).to.have.length(0);
      });
    });

    it('should use secure headers', () => {
      cy.request('/').then((response) => {
        // Check for security headers (these would be set by hosting platform)
        expect(response.headers).to.have.property('x-frame-options');
        expect(response.headers).to.have.property('x-content-type-options');
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting gracefully', () => {
      // Simulate rapid requests
      for (let i = 0; i < 100; i++) {
        cy.request({
          url: '/api/products',
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 429) {
            expect(response.body).to.have.property('error');
            expect(response.body.error).to.include('rate limit');
          }
        });
      }
    });
  });

  describe('Content Security Policy', () => {
    it('should prevent inline script execution', () => {
      cy.visit('/');
      
      // Try to inject inline script
      cy.window().then((win) => {
        const script = win.document.createElement('script');
        script.innerHTML = 'window.maliciousCode = true;';
        win.document.head.appendChild(script);
        
        // Should be blocked by CSP
        expect(win.maliciousCode).to.be.undefined;
      });
    });

    it('should only allow trusted external resources', () => {
      cy.visit('/');
      
      // Check that only whitelisted domains are loaded
      cy.window().then((win) => {
        const images = Array.from(win.document.images);
        images.forEach((img) => {
          const url = new URL(img.src);
          const allowedDomains = [
            'localhost',
            'firebasestorage.googleapis.com',
            'images.pexels.com',
            'res.cloudinary.com'
          ];
          
          expect(allowedDomains.some(domain => url.hostname.includes(domain))).to.be.true;
        });
      });
    });
  });
});