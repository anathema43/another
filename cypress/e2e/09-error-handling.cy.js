describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Network Error Handling', () => {
    it('should handle API server downtime', () => {
      // Simulate server downtime
      cy.intercept('GET', '/api/**', { forceNetworkError: true }).as('networkError');
      
      cy.navigateToShop();
      cy.wait('@networkError');
      
      cy.get('[data-cy="network-error-message"]').should('be.visible');
      cy.get('[data-cy="retry-button"]').should('be.visible');
      cy.get('[data-cy="offline-indicator"]').should('be.visible');
    });

    it('should handle slow network connections', () => {
      // Simulate slow network
      cy.intercept('GET', '/api/products', (req) => {
        req.reply((res) => {
          res.delay(5000); // 5 second delay
          res.send({ fixture: 'products.json' });
        });
      }).as('slowRequest');
      
      cy.navigateToShop();
      
      // Should show loading state
      cy.get('[data-cy="loading-spinner"]').should('be.visible');
      cy.get('[data-cy="loading-message"]').should('contain', 'Loading products');
      
      cy.wait('@slowRequest');
      cy.get('[data-cy="loading-spinner"]').should('not.exist');
      cy.get('[data-cy="product-grid"]').should('be.visible');
    });

    it('should handle intermittent connectivity', () => {
      cy.navigateToShop();
      
      // Simulate network going offline
      cy.window().then((win) => {
        win.navigator.onLine = false;
        win.dispatchEvent(new Event('offline'));
      });
      
      cy.get('[data-cy="offline-banner"]').should('be.visible');
      cy.get('[data-cy="offline-message"]').should('contain', 'You are currently offline');
      
      // Simulate network coming back online
      cy.window().then((win) => {
        win.navigator.onLine = true;
        win.dispatchEvent(new Event('online'));
      });
      
      cy.get('[data-cy="online-banner"]').should('be.visible');
      cy.get('[data-cy="offline-banner"]').should('not.exist');
    });

    it('should retry failed requests automatically', () => {
      let requestCount = 0;
      
      cy.intercept('GET', '/api/products', (req) => {
        requestCount++;
        if (requestCount < 3) {
          req.reply({ statusCode: 500 });
        } else {
          req.reply({ fixture: 'products.json' });
        }
      }).as('retryRequest');
      
      cy.navigateToShop();
      
      // Should eventually succeed after retries
      cy.wait('@retryRequest');
      cy.get('[data-cy="product-grid"]').should('be.visible');
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle expired authentication tokens', () => {
      cy.loginAsUser();
      
      // Simulate expired token
      cy.intercept('GET', '/api/cart', { statusCode: 401 }).as('expiredToken');
      
      cy.navigateToCart();
      cy.wait('@expiredToken');
      
      cy.get('[data-cy="session-expired-modal"]').should('be.visible');
      cy.get('[data-cy="relogin-button"]').should('be.visible');
    });

    it('should handle authentication service downtime', () => {
      cy.intercept('POST', '/api/auth/login', { forceNetworkError: true }).as('authError');
      
      cy.get('[data-cy="nav-login"]').click();
      cy.get('[data-cy="login-email"]').type('test@ramro.com');
      cy.get('[data-cy="login-password"]').type('password123');
      cy.get('[data-cy="login-submit"]').click();
      
      cy.wait('@authError');
      cy.get('[data-cy="auth-service-error"]').should('be.visible');
      cy.get('[data-cy="try-again-later"]').should('be.visible');
    });

    it('should handle invalid session states', () => {
      // Manually corrupt session data
      cy.window().then((win) => {
        win.localStorage.setItem('auth-storage', 'invalid-json');
      });
      
      cy.reload();
      
      // Should handle gracefully and clear invalid session
      cy.get('[data-cy="nav-login"]').should('be.visible');
      cy.window().its('localStorage').should('not.contain.key', 'auth-storage');
    });
  });

  describe('Payment Error Handling', () => {
    beforeEach(() => {
      cy.loginAsUser();
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      cy.fillShippingInfo({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@ramro.com',
        phone: '+91 9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        zipCode: '400001'
      });
    });

    it('should handle Razorpay service downtime', () => {
      cy.selectPaymentMethod('razorpay');
      
      // Mock Razorpay script loading failure
      cy.window().then((win) => {
        delete win.Razorpay;
      });
      
      cy.get('[data-cy="place-order-button"]').click();
      
      cy.get('[data-cy="payment-service-error"]').should('be.visible');
      cy.get('[data-cy="alternative-payment-options"]').should('be.visible');
    });

    it('should handle payment gateway timeouts', () => {
      cy.selectPaymentMethod('razorpay');
      
      cy.window().then((win) => {
        win.Razorpay = cy.stub().callsFake((options) => ({
          open: cy.stub().callsFake(() => {
            // Simulate timeout
            setTimeout(() => {
              options.modal.ondismiss();
            }, 30000);
          })
        }));
      });
      
      cy.get('[data-cy="place-order-button"]').click();
      
      cy.get('[data-cy="payment-timeout-error"]').should('be.visible');
      cy.get('[data-cy="retry-payment-button"]').should('be.visible');
    });

    it('should handle insufficient funds', () => {
      cy.selectPaymentMethod('razorpay');
      
      cy.window().then((win) => {
        win.Razorpay = cy.stub().callsFake((options) => ({
          open: cy.stub().callsFake(() => {
            // Simulate insufficient funds error
            options.handler({
              error: {
                code: 'PAYMENT_FAILED',
                description: 'Insufficient funds',
                reason: 'payment_failed'
              }
            });
          })
        }));
      });
      
      cy.get('[data-cy="place-order-button"]').click();
      
      cy.get('[data-cy="insufficient-funds-error"]').should('be.visible');
      cy.get('[data-cy="try-different-payment"]').should('be.visible');
    });
  });

  describe('Data Validation Errors', () => {
    it('should handle invalid product data', () => {
      // Mock invalid product response
      cy.intercept('GET', '/api/products', {
        body: [
          {
            id: '1',
            name: '', // Invalid: empty name
            price: -100, // Invalid: negative price
            quantityAvailable: 'invalid' // Invalid: non-numeric quantity
          }
        ]
      }).as('invalidProducts');
      
      cy.navigateToShop();
      cy.wait('@invalidProducts');
      
      cy.get('[data-cy="data-error-message"]').should('be.visible');
      cy.get('[data-cy="fallback-content"]').should('be.visible');
    });

    it('should handle malformed API responses', () => {
      cy.intercept('GET', '/api/products', {
        body: 'invalid json response'
      }).as('malformedResponse');
      
      cy.navigateToShop();
      cy.wait('@malformedResponse');
      
      cy.get('[data-cy="parsing-error"]').should('be.visible');
      cy.get('[data-cy="contact-support"]').should('be.visible');
    });

    it('should validate form inputs client-side', () => {
      cy.get('[data-cy="nav-signup"]').click();
      
      // Test invalid email format
      cy.get('[data-cy="signup-email"]').type('invalid-email');
      cy.get('[data-cy="signup-email"]').blur();
      cy.get('[data-cy="email-format-error"]').should('be.visible');
      
      // Test password strength
      cy.get('[data-cy="signup-password"]').type('weak');
      cy.get('[data-cy="signup-password"]').blur();
      cy.get('[data-cy="password-strength-error"]').should('be.visible');
      
      // Test phone number format
      cy.get('[data-cy="signup-phone"]').type('invalid-phone');
      cy.get('[data-cy="signup-phone"]').blur();
      cy.get('[data-cy="phone-format-error"]').should('be.visible');
    });
  });

  describe('Browser Compatibility Issues', () => {
    it('should handle unsupported browser features gracefully', () => {
      // Mock unsupported localStorage
      cy.window().then((win) => {
        delete win.localStorage;
      });
      
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      
      // Should show warning about limited functionality
      cy.get('[data-cy="browser-compatibility-warning"]').should('be.visible');
      cy.get('[data-cy="upgrade-browser-message"]').should('be.visible');
    });

    it('should handle JavaScript disabled scenarios', () => {
      // This would require server-side rendering testing
      // For now, test that critical content is available without JS
      cy.get('[data-cy="noscript-message"]').should('exist');
    });

    it('should handle cookie disabled scenarios', () => {
      // Clear all cookies and disable them
      cy.clearCookies();
      
      cy.window().then((win) => {
        // Mock cookie setting failure
        Object.defineProperty(win.document, 'cookie', {
          get: () => '',
          set: () => false
        });
      });
      
      cy.navigateToShop();
      cy.get('[data-cy="cookies-disabled-warning"]').should('be.visible');
    });
  });

  describe('Resource Loading Errors', () => {
    it('should handle missing images gracefully', () => {
      cy.intercept('GET', '**/*.jpg', { statusCode: 404 }).as('imageError');
      cy.intercept('GET', '**/*.png', { statusCode: 404 }).as('imageError2');
      
      cy.navigateToShop();
      
      cy.get('[data-cy="product-image"]').each(($img) => {
        // Should show placeholder or fallback image
        cy.wrap($img).should('have.attr', 'src').and('include', 'placeholder');
      });
    });

    it('should handle CSS loading failures', () => {
      // Simulate CSS loading failure
      cy.intercept('GET', '**/*.css', { statusCode: 404 }).as('cssError');
      
      cy.reload();
      
      // Should still be functional with basic styling
      cy.get('[data-cy="unstyled-warning"]').should('be.visible');
      cy.get('body').should('have.class', 'no-css-fallback');
    });

    it('should handle font loading failures', () => {
      // Mock font loading failure
      cy.document().then((doc) => {
        const style = doc.createElement('style');
        style.textContent = '@font-face { font-family: "CustomFont"; src: url("invalid.woff2"); }';
        doc.head.appendChild(style);
      });
      
      cy.navigateToShop();
      
      // Should fallback to system fonts
      cy.get('body').should('have.css', 'font-family').and('include', 'system');
    });
  });

  describe('Memory and Performance Issues', () => {
    it('should handle memory leaks in long sessions', () => {
      // Simulate long browsing session
      for (let i = 0; i < 10; i++) {
        cy.navigateToShop();
        cy.get('[data-cy="product-card"]').first().click();
        cy.go('back');
      }
      
      // Check that memory usage is reasonable
      cy.window().then((win) => {
        if (win.performance && win.performance.memory) {
          const memoryInfo = win.performance.memory;
          expect(memoryInfo.usedJSHeapSize).to.be.lessThan(100 * 1024 * 1024); // 100MB limit
        }
      });
    });

    it('should handle large datasets efficiently', () => {
      // Mock large product dataset
      const largeProductSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        name: `Product ${i}`,
        price: 100 + i,
        image: `https://example.com/product${i}.jpg`,
        category: 'test'
      }));
      
      cy.intercept('GET', '/api/products', { body: largeProductSet }).as('largeDataset');
      
      cy.navigateToShop();
      cy.wait('@largeDataset');
      
      // Should implement pagination or virtual scrolling
      cy.get('[data-cy="pagination"]').should('be.visible');
      cy.get('[data-cy="product-card"]').should('have.length.lessThan', 50); // Should not render all items
    });
  });

  describe('Security Error Handling', () => {
    it('should handle CSRF token errors', () => {
      cy.intercept('POST', '/api/**', { statusCode: 403, body: { error: 'CSRF token mismatch' } }).as('csrfError');
      
      cy.loginAsUser();
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      
      cy.wait('@csrfError');
      cy.get('[data-cy="security-error"]').should('be.visible');
      cy.get('[data-cy="refresh-page-button"]').should('be.visible');
    });

    it('should handle XSS attempts gracefully', () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      cy.get('[data-cy="nav-login"]').click();
      cy.get('[data-cy="login-email"]').type(xssPayload);
      cy.get('[data-cy="login-submit"]').click();
      
      // Should sanitize input and not execute script
      cy.get('[data-cy="login-email"]').should('not.contain', '<script>');
      cy.on('window:alert', () => {
        throw new Error('XSS vulnerability detected');
      });
    });
  });

  describe('Third-Party Service Failures', () => {
    it('should handle analytics service failures', () => {
      // Mock analytics service failure
      cy.window().then((win) => {
        win.gtag = undefined;
        win.ga = undefined;
      });
      
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      
      // Should continue functioning without analytics
      cy.get('[data-cy="product-grid"]').should('be.visible');
      cy.get('[data-cy="cart-count"]').should('contain', '1');
    });

    it('should handle CDN failures', () => {
      // Mock CDN failure for external resources
      cy.intercept('GET', 'https://cdn.**', { statusCode: 404 }).as('cdnFailure');
      
      cy.navigateToShop();
      
      // Should fallback to local resources
      cy.get('[data-cy="fallback-resources-loaded"]').should('be.visible');
    });
  });

  describe('Error Recovery', () => {
    it('should allow users to recover from errors', () => {
      // Simulate error state
      cy.intercept('GET', '/api/products', { statusCode: 500 }).as('serverError');
      
      cy.navigateToShop();
      cy.wait('@serverError');
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.get('[data-cy="retry-button"]').should('be.visible');
      
      // Fix the error and retry
      cy.intercept('GET', '/api/products', { fixture: 'products.json' }).as('fixedRequest');
      cy.get('[data-cy="retry-button"]').click();
      
      cy.wait('@fixedRequest');
      cy.get('[data-cy="product-grid"]').should('be.visible');
      cy.get('[data-cy="error-message"]').should('not.exist');
    });

    it('should provide helpful error messages', () => {
      cy.intercept('GET', '/api/products', { statusCode: 500 }).as('serverError');
      
      cy.navigateToShop();
      cy.wait('@serverError');
      
      cy.get('[data-cy="error-message"]').should('contain', 'temporarily unavailable');
      cy.get('[data-cy="error-help-text"]').should('contain', 'try again in a few moments');
      cy.get('[data-cy="contact-support-link"]').should('be.visible');
    });
  });
});