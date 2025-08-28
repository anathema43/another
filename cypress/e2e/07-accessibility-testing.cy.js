describe('Accessibility Testing', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  describe('Page Accessibility', () => {
    it('should have no accessibility violations on homepage', () => {
      cy.checkA11y();
    });

    it('should have no accessibility violations on shop page', () => {
      cy.navigateToShop();
      cy.checkA11y();
    });

    it('should have no accessibility violations on product detail page', () => {
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().click();
      cy.checkA11y();
    });

    it('should have no accessibility violations on cart page', () => {
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      cy.navigateToCart();
      cy.checkA11y();
    });

    it('should have no accessibility violations on checkout page', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      cy.checkA11y();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through main elements', () => {
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'skip-to-content');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'nav-home');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'nav-shop');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'nav-cart');
    });

    it('should support keyboard navigation in product grid', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="product-card"]').first().focus();
      cy.focused().should('have.attr', 'data-cy', 'product-card');
      
      // Navigate with arrow keys
      cy.focused().type('{rightarrow}');
      cy.focused().should('have.attr', 'data-cy', 'product-card');
      
      // Enter to view product
      cy.focused().type('{enter}');
      cy.url().should('include', '/products/');
    });

    it('should support keyboard navigation in forms', () => {
      cy.get('[data-cy="nav-login"]').click();
      
      cy.get('[data-cy="login-email"]').focus();
      cy.focused().type('test@example.com');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'login-password');
      cy.focused().type('password123');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'login-submit');
      
      // Should be able to submit with Enter
      cy.focused().type('{enter}');
    });

    it('should trap focus in modals', () => {
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="quick-view-button"]').click();
      });
      
      cy.get('[data-cy="product-modal"]').should('be.visible');
      
      // Focus should be trapped within modal
      cy.get('[data-cy="modal-close-button"]').focus();
      cy.focused().tab();
      cy.focused().should('be.within', '[data-cy="product-modal"]');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist');
      cy.get('h1').should('have.length', 1);
      
      // Check heading order
      cy.get('h1, h2, h3, h4, h5, h6').then(($headings) => {
        const headingLevels = [...$headings].map(h => parseInt(h.tagName.charAt(1)));
        
        for (let i = 1; i < headingLevels.length; i++) {
          const current = headingLevels[i];
          const previous = headingLevels[i - 1];
          
          // Heading levels should not skip more than one level
          expect(current - previous).to.be.at.most(1);
        }
      });
    });

    it('should have proper alt text for images', () => {
      cy.navigateToShop();
      
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
        cy.wrap($img).invoke('attr', 'alt').should('not.be.empty');
      });
    });

    it('should have proper labels for form inputs', () => {
      cy.get('[data-cy="nav-login"]').click();
      
      cy.get('input').each(($input) => {
        const id = $input.attr('id');
        if (id) {
          cy.get(`label[for="${id}"]`).should('exist');
        } else {
          cy.wrap($input).should('have.attr', 'aria-label');
        }
      });
    });

    it('should have proper ARIA attributes', () => {
      cy.navigateToShop();
      
      // Check buttons have proper roles
      cy.get('[data-cy="add-to-cart-button"]').each(($button) => {
        cy.wrap($button).should('have.attr', 'aria-label');
      });
      
      // Check navigation has proper landmarks
      cy.get('nav').should('have.attr', 'role', 'navigation');
      cy.get('main').should('have.attr', 'role', 'main');
    });

    it('should announce dynamic content changes', () => {
      cy.navigateToShop();
      
      // Add product to cart
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Check for live region announcement
      cy.get('[data-cy="cart-announcement"]').should('have.attr', 'aria-live', 'polite');
      cy.get('[data-cy="cart-announcement"]').should('contain', 'added to cart');
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient color contrast', () => {
      cy.checkA11y(null, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
    });

    it('should be usable without color alone', () => {
      // Check that status indicators use more than just color
      cy.navigateToShop();
      
      cy.get('[data-cy="stock-status"]').each(($status) => {
        // Should have text or icon in addition to color
        cy.wrap($status).should('not.be.empty');
        cy.wrap($status).should(($el) => {
          const text = $el.text().trim();
          const hasIcon = $el.find('svg, i, .icon').length > 0;
          expect(text.length > 0 || hasIcon).to.be.true;
        });
      });
    });

    it('should support high contrast mode', () => {
      // Simulate high contrast mode
      cy.get('body').invoke('addClass', 'high-contrast');
      
      cy.navigateToShop();
      cy.checkA11y();
    });
  });

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      cy.setMobileViewport();
    });

    it('should be accessible on mobile devices', () => {
      cy.checkA11y();
    });

    it('should have proper touch targets', () => {
      cy.navigateToShop();
      
      // Check that interactive elements are large enough
      cy.get('[data-cy="add-to-cart-button"]').each(($button) => {
        cy.wrap($button).then(($el) => {
          const rect = $el[0].getBoundingClientRect();
          expect(rect.width).to.be.at.least(44); // 44px minimum touch target
          expect(rect.height).to.be.at.least(44);
        });
      });
    });

    it('should support mobile screen readers', () => {
      cy.navigateToShop();
      
      // Check for mobile-specific ARIA attributes
      cy.get('[data-cy="mobile-menu-button"]').should('have.attr', 'aria-expanded');
      cy.get('[data-cy="mobile-menu-button"]').should('have.attr', 'aria-controls');
    });
  });

  describe('Focus Management', () => {
    it('should manage focus when opening modals', () => {
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="quick-view-button"]').click();
      });
      
      // Focus should move to modal
      cy.get('[data-cy="product-modal"]').should('be.visible');
      cy.focused().should('be.within', '[data-cy="product-modal"]');
    });

    it('should restore focus when closing modals', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="quick-view-button"]').focus().click();
      });
      
      cy.get('[data-cy="modal-close-button"]').click();
      
      // Focus should return to trigger element
      cy.focused().should('have.attr', 'data-cy', 'quick-view-button');
    });

    it('should skip to main content', () => {
      cy.get('[data-cy="skip-to-content"]').focus().click();
      cy.focused().should('have.attr', 'data-cy', 'main-content');
    });
  });

  describe('Error Accessibility', () => {
    it('should announce form errors to screen readers', () => {
      cy.get('[data-cy="nav-login"]').click();
      
      cy.get('[data-cy="login-submit"]').click();
      
      // Error should be announced
      cy.get('[data-cy="error-message"]').should('have.attr', 'role', 'alert');
      cy.get('[data-cy="error-message"]').should('have.attr', 'aria-live', 'assertive');
    });

    it('should associate errors with form fields', () => {
      cy.get('[data-cy="nav-login"]').click();
      
      cy.get('[data-cy="login-submit"]').click();
      
      cy.get('[data-cy="login-email"]').should('have.attr', 'aria-describedby');
      cy.get('[data-cy="login-email"]').invoke('attr', 'aria-describedby').then((describedBy) => {
        cy.get(`#${describedBy}`).should('exist');
        cy.get(`#${describedBy}`).should('contain', 'required');
      });
    });
  });

  describe('Language and Internationalization', () => {
    it('should have proper language attributes', () => {
      cy.get('html').should('have.attr', 'lang');
      cy.get('html').invoke('attr', 'lang').should('match', /^[a-z]{2}(-[A-Z]{2})?$/);
    });

    it('should handle right-to-left languages', () => {
      // Test RTL support if implemented
      cy.get('html').invoke('attr', 'dir', 'rtl');
      cy.navigateToShop();
      
      // Check that layout adapts properly
      cy.get('[data-cy="product-grid"]').should('have.css', 'direction', 'rtl');
    });
  });
});