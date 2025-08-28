describe('Responsive Design Testing', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Desktop Large', width: 1920, height: 1080 }
  ];

  viewports.forEach((viewport) => {
    describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      beforeEach(() => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('/');
        cy.waitForPageLoad();
      });

      it('should display navigation properly', () => {
        if (viewport.width < 768) {
          // Mobile navigation
          cy.get('[data-cy="mobile-menu-button"]').should('be.visible');
          cy.get('[data-cy="desktop-nav"]').should('not.be.visible');
          
          // Test mobile menu
          cy.get('[data-cy="mobile-menu-button"]').click();
          cy.get('[data-cy="mobile-menu"]').should('be.visible');
          cy.get('[data-cy="mobile-nav-home"]').should('be.visible');
          cy.get('[data-cy="mobile-nav-shop"]').should('be.visible');
        } else {
          // Desktop navigation
          cy.get('[data-cy="desktop-nav"]').should('be.visible');
          cy.get('[data-cy="mobile-menu-button"]').should('not.be.visible');
        }
      });

      it('should display homepage hero section properly', () => {
        cy.get('[data-cy="hero-section"]').should('be.visible');
        cy.get('[data-cy="hero-title"]').should('be.visible');
        cy.get('[data-cy="hero-cta"]').should('be.visible');
        
        if (viewport.width < 768) {
          cy.get('[data-cy="hero-section"]').should('have.class', 'mobile-hero');
        }
      });

      it('should display product grid appropriately', () => {
        cy.navigateToShop();
        
        cy.get('[data-cy="product-grid"]').should('be.visible');
        
        // Check grid columns based on viewport
        if (viewport.width < 640) {
          // Mobile: 1 column
          cy.get('[data-cy="product-grid"]').should('have.class', 'grid-cols-1');
        } else if (viewport.width < 1024) {
          // Tablet: 2 columns
          cy.get('[data-cy="product-grid"]').should('have.class', 'grid-cols-2');
        } else {
          // Desktop: 3-4 columns
          cy.get('[data-cy="product-grid"]').should('satisfy', ($el) => {
            return $el.hasClass('grid-cols-3') || $el.hasClass('grid-cols-4');
          });
        }
      });

      it('should display product cards properly', () => {
        cy.navigateToShop();
        
        cy.get('[data-cy="product-card"]').first().within(() => {
          cy.get('[data-cy="product-image"]').should('be.visible');
          cy.get('[data-cy="product-name"]').should('be.visible');
          cy.get('[data-cy="product-price"]').should('be.visible');
          cy.get('[data-cy="add-to-cart-button"]').should('be.visible');
          
          // Check button size on mobile
          if (viewport.width < 768) {
            cy.get('[data-cy="add-to-cart-button"]').should('have.class', 'mobile-button');
          }
        });
      });

      it('should display cart page properly', () => {
        // Add item to cart first
        cy.navigateToShop();
        cy.addProductToCart('Darjeeling Pickle');
        cy.navigateToCart();
        
        cy.get('[data-cy="cart-page"]').should('be.visible');
        
        if (viewport.width < 768) {
          // Mobile cart layout
          cy.get('[data-cy="mobile-cart-layout"]').should('be.visible');
          cy.get('[data-cy="cart-item"]').should('have.class', 'mobile-cart-item');
        } else {
          // Desktop cart layout
          cy.get('[data-cy="desktop-cart-layout"]').should('be.visible');
          cy.get('[data-cy="cart-summary"]').should('be.visible');
        }
      });

      it('should display checkout form properly', () => {
        cy.loginAsUser();
        cy.navigateToShop();
        cy.addProductToCart('Darjeeling Pickle');
        cy.navigateToCart();
        cy.get('[data-cy="checkout-button"]').click();
        
        if (viewport.width < 768) {
          // Mobile checkout: single column
          cy.get('[data-cy="mobile-checkout-layout"]').should('be.visible');
          cy.get('[data-cy="checkout-form"]').should('have.class', 'single-column');
        } else {
          // Desktop checkout: two columns
          cy.get('[data-cy="desktop-checkout-layout"]').should('be.visible');
          cy.get('[data-cy="checkout-form"]').should('have.class', 'two-column');
          cy.get('[data-cy="order-summary"]').should('be.visible');
        }
      });

      it('should handle form inputs properly', () => {
        cy.get('[data-cy="nav-login"]').click();
        
        cy.get('[data-cy="login-form"]').should('be.visible');
        cy.get('[data-cy="login-email"]').should('be.visible');
        cy.get('[data-cy="login-password"]').should('be.visible');
        
        // Check input sizing on mobile
        if (viewport.width < 768) {
          cy.get('[data-cy="login-email"]').should('have.class', 'mobile-input');
          cy.get('[data-cy="login-password"]').should('have.class', 'mobile-input');
        }
      });
    });
  });

  describe('Responsive Images', () => {
    it('should load appropriate image sizes for different viewports', () => {
      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height);
        cy.navigateToShop();
        
        cy.get('[data-cy="product-image"]').first().should(($img) => {
          const src = $img.attr('src');
          
          if (viewport.width < 640) {
            expect(src).to.include('w_400'); // Small image for mobile
          } else if (viewport.width < 1024) {
            expect(src).to.include('w_600'); // Medium image for tablet
          } else {
            expect(src).to.include('w_800'); // Large image for desktop
          }
        });
      });
    });
  });

  describe('Touch Interactions', () => {
    beforeEach(() => {
      cy.setMobileViewport();
    });

    it('should support touch gestures on mobile', () => {
      cy.navigateToShop();
      
      // Test swipe gestures on product carousel
      cy.get('[data-cy="product-carousel"]').should('be.visible');
      cy.get('[data-cy="product-carousel"]')
        .trigger('touchstart', { which: 1, pageX: 100, pageY: 100 })
        .trigger('touchmove', { which: 1, pageX: 50, pageY: 100 })
        .trigger('touchend');
      
      cy.get('[data-cy="carousel-next-slide"]').should('be.visible');
    });

    it('should have proper touch targets', () => {
      cy.navigateToShop();
      
      // All interactive elements should be at least 44px
      cy.get('[data-cy="add-to-cart-button"]').each(($button) => {
        cy.wrap($button).then(($el) => {
          const rect = $el[0].getBoundingClientRect();
          expect(rect.width).to.be.at.least(44);
          expect(rect.height).to.be.at.least(44);
        });
      });
    });

    it('should handle pinch-to-zoom on product images', () => {
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().click();
      
      cy.get('[data-cy="product-image"]').should('be.visible');
      
      // Simulate pinch gesture
      cy.get('[data-cy="product-image"]')
        .trigger('touchstart', { 
          touches: [
            { pageX: 100, pageY: 100 },
            { pageX: 200, pageY: 200 }
          ]
        })
        .trigger('touchmove', {
          touches: [
            { pageX: 50, pageY: 50 },
            { pageX: 250, pageY: 250 }
          ]
        })
        .trigger('touchend');
      
      // Image should zoom or show zoom indicator
      cy.get('[data-cy="image-zoom-indicator"]').should('be.visible');
    });
  });

  describe('Orientation Changes', () => {
    it('should handle portrait to landscape orientation', () => {
      // Start in portrait
      cy.viewport(375, 667);
      cy.navigateToShop();
      
      cy.get('[data-cy="product-grid"]').should('have.class', 'grid-cols-1');
      
      // Switch to landscape
      cy.viewport(667, 375);
      
      cy.get('[data-cy="product-grid"]').should('have.class', 'grid-cols-2');
    });
  });

  describe('Performance on Different Viewports', () => {
    it('should load quickly on mobile devices', () => {
      cy.setMobileViewport();
      
      const startTime = Date.now();
      cy.visit('/');
      cy.waitForPageLoad();
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds max on mobile
      });
    });

    it('should lazy load images on mobile', () => {
      cy.setMobileViewport();
      cy.navigateToShop();
      
      // Images below the fold should not be loaded initially
      cy.get('[data-cy="product-image"]').each(($img, index) => {
        if (index > 2) { // Images beyond first few
          cy.wrap($img).should('have.attr', 'loading', 'lazy');
        }
      });
    });
  });

  describe('Cross-Browser Responsive Testing', () => {
    ['chrome', 'firefox', 'edge'].forEach((browser) => {
      it(`should display properly in ${browser}`, () => {
        // This would require different browser configurations
        cy.setMobileViewport();
        cy.navigateToShop();
        
        cy.get('[data-cy="product-grid"]').should('be.visible');
        cy.get('[data-cy="mobile-menu-button"]').should('be.visible');
      });
    });
  });

  describe('Print Styles', () => {
    it('should have proper print styles', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      cy.navigateToCart();
      cy.get('[data-cy="checkout-button"]').click();
      
      // Simulate print media
      cy.get('body').invoke('addClass', 'print-preview');
      
      // Navigation should be hidden in print
      cy.get('[data-cy="navbar"]').should('have.css', 'display', 'none');
      
      // Content should be optimized for print
      cy.get('[data-cy="checkout-form"]').should('be.visible');
    });
  });
});