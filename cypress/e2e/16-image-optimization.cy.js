describe('Image Optimization Testing', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('ResponsiveImage Component', () => {
    it('should load responsive images with srcset and sizes', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="product-image"]').first().should(($img) => {
        expect($img).to.have.attr('srcset');
        expect($img).to.have.attr('sizes');
        expect($img.attr('srcset')).to.include('400w');
        expect($img.attr('srcset')).to.include('800w');
      });
    });

    it('should implement lazy loading for non-critical images', () => {
      cy.navigateToShop();
      
      // Images below the fold should have lazy loading
      cy.get('[data-cy="product-image"]').each(($img, index) => {
        if (index > 2) { // Images beyond first few
          cy.wrap($img).should('have.attr', 'loading', 'lazy');
        }
      });
    });

    it('should prioritize critical images', () => {
      cy.visit('/');
      
      // Hero images should load eagerly
      cy.get('[data-cy="hero-image"]').should('have.attr', 'loading', 'eager');
    });

    it('should handle image loading errors gracefully', () => {
      // Mock broken image
      cy.intercept('GET', '**/*.jpg', { statusCode: 404 }).as('brokenImage');
      
      cy.navigateToShop();
      
      // Should show fallback or error state
      cy.get('[data-cy="product-image"]').first().should('be.visible');
      cy.get('[data-cy="image-error-fallback"]').should('be.visible');
    });

    it('should show loading placeholders', () => {
      // Simulate slow image loading
      cy.intercept('GET', '**/*.jpg', (req) => {
        req.reply((res) => {
          res.delay(2000);
          res.send();
        });
      }).as('slowImage');
      
      cy.navigateToShop();
      
      // Should show loading placeholder
      cy.get('[data-cy="image-loading-placeholder"]').should('be.visible');
      cy.get('.animate-pulse').should('be.visible');
    });
  });

  describe('Image Performance', () => {
    it('should load appropriate image sizes for different viewports', () => {
      const viewports = [
        { width: 375, height: 667, expectedSize: '400' },
        { width: 768, height: 1024, expectedSize: '800' },
        { width: 1280, height: 720, expectedSize: '1200' }
      ];

      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height);
        cy.navigateToShop();
        
        cy.get('[data-cy="product-image"]').first().should(($img) => {
          const src = $img.attr('src');
          expect(src).to.include(viewport.expectedSize);
        });
      });
    });

    it('should optimize images for mobile devices', () => {
      cy.viewport('iphone-6');
      cy.navigateToShop();
      
      cy.get('[data-cy="product-image"]').first().should(($img) => {
        const src = $img.attr('src');
        // Should load smaller image for mobile
        expect(src).to.include('w=400');
      });
    });

    it('should measure image loading performance', () => {
      cy.navigateToShop();
      
      cy.window().then((win) => {
        const images = Array.from(win.document.images);
        const loadTimes = [];
        
        images.forEach((img) => {
          if (img.complete) {
            const loadTime = win.performance.getEntriesByName(img.src)[0];
            if (loadTime) {
              loadTimes.push(loadTime.duration);
            }
          }
        });
        
        // Average load time should be reasonable
        const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
        expect(avgLoadTime).to.be.lessThan(1000); // Less than 1 second
      });
    });
  });

  describe('Image Accessibility', () => {
    it('should have proper alt text for all images', () => {
      cy.navigateToShop();
      
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
        cy.wrap($img).invoke('attr', 'alt').should('not.be.empty');
      });
    });

    it('should provide descriptive alt text for product images', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="product-image"]').each(($img) => {
        cy.wrap($img).invoke('attr', 'alt').should('contain', 'Himalayan');
      });
    });
  });

  describe('Cross-browser Image Support', () => {
    it('should work with different image formats', () => {
      cy.navigateToShop();
      
      // Should handle various image formats
      cy.get('[data-cy="product-image"]').each(($img) => {
        const src = $img.attr('src');
        expect(src).to.match(/\.(jpg|jpeg|png|webp)(\?|$)/i);
      });
    });

    it('should provide fallbacks for unsupported formats', () => {
      // Test WebP fallback to JPEG
      cy.window().then((win) => {
        const supportsWebP = win.document.createElement('canvas')
          .toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        if (!supportsWebP) {
          cy.get('[data-cy="product-image"]').first().should(($img) => {
            const src = $img.attr('src');
            expect(src).to.include('jpg');
          });
        }
      });
    });
  });
});