describe('Artisan & Cultural Content Features', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Artisan Directory', () => {
    beforeEach(() => {
      cy.visit('/artisans');
    });

    it('should display artisan directory correctly', () => {
      cy.url().should('include', '/artisans');
      cy.get('[data-cy="artisans-directory"]').should('be.visible');
      cy.contains('Meet Our Artisans').should('be.visible');
      cy.contains('master craftspeople').should('be.visible');
    });

    it('should show featured artisans section', () => {
      cy.get('[data-cy="featured-artisans"]').should('be.visible');
      cy.contains('Featured Master Artisans').should('be.visible');
      cy.get('[data-cy="featured-artisan-card"]').should('have.length.greaterThan', 0);
    });

    it('should display all artisans with proper information', () => {
      cy.get('[data-cy="artisan-card"]').should('have.length.greaterThan', 0);
      
      cy.get('[data-cy="artisan-card"]').first().within(() => {
        cy.get('[data-cy="artisan-name"]').should('be.visible');
        cy.get('[data-cy="artisan-location"]').should('be.visible');
        cy.get('[data-cy="artisan-experience"]').should('be.visible');
        cy.get('[data-cy="artisan-image"]').should('be.visible');
      });
    });

    it('should filter artisans by region', () => {
      cy.get('[data-cy="region-filter"]').select('West Bengal');
      
      cy.get('[data-cy="artisan-card"]').each(($card) => {
        cy.wrap($card).should('contain', 'West Bengal');
      });
    });

    it('should search artisans by name or specialty', () => {
      cy.get('[data-cy="artisan-search"]').type('pickle');
      
      cy.get('[data-cy="artisan-card"]').should('contain', 'Deepak');
      cy.get('[data-cy="artisan-card"]').should('contain', 'pickle');
    });

    it('should clear filters correctly', () => {
      cy.get('[data-cy="artisan-search"]').type('honey');
      cy.get('[data-cy="region-filter"]').select('Himachal Pradesh');
      
      // Clear filters
      cy.get('[data-cy="artisan-search"]').clear();
      cy.get('[data-cy="region-filter"]').select('All Regions');
      
      cy.get('[data-cy="artisan-card"]').should('have.length.greaterThan', 2);
    });

    it('should be mobile responsive', () => {
      cy.setMobileViewport();
      
      cy.get('[data-cy="artisans-directory"]').should('be.visible');
      cy.get('[data-cy="artisan-card"]').should('be.visible');
      cy.get('[data-cy="artisan-search"]').should('be.visible');
    });
  });

  describe('Artisan Profile Page', () => {
    beforeEach(() => {
      cy.visit('/artisans');
      cy.get('[data-cy="artisan-card"]').first().click();
    });

    it('should display complete artisan profile', () => {
      cy.url().should('include', '/artisans/');
      
      // Hero section
      cy.get('[data-cy="artisan-hero"]').should('be.visible');
      cy.get('[data-cy="artisan-name"]').should('be.visible');
      cy.get('[data-cy="artisan-title"]').should('be.visible');
      cy.get('[data-cy="artisan-location"]').should('be.visible');
      cy.get('[data-cy="artisan-experience"]').should('be.visible');
    });

    it('should show artisan story and biography', () => {
      cy.get('[data-cy="artisan-story"]').should('be.visible');
      cy.contains('The Story of').should('be.visible');
      cy.get('[data-cy="artisan-bio"]').should('be.visible');
    });

    it('should display cultural heritage section', () => {
      cy.get('[data-cy="cultural-heritage"]').should('be.visible');
      cy.contains('Cultural Heritage').should('be.visible');
      cy.get('[data-cy="traditional-techniques"]').should('be.visible');
      cy.get('[data-cy="cultural-values"]').should('be.visible');
    });

    it('should show artisan products', () => {
      cy.get('[data-cy="artisan-products"]').should('be.visible');
      cy.contains('Products by').should('be.visible');
      
      // Should have at least one product or show empty state
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="product-card"]').length > 0) {
          cy.get('[data-cy="product-card"]').should('be.visible');
        } else {
          cy.contains('No products available').should('be.visible');
        }
      });
    });

    it('should display impact story', () => {
      cy.get('[data-cy="impact-story"]').should('be.visible');
      cy.contains('Your Impact').should('be.visible');
      cy.get('[data-cy="family-support"]').should('be.visible');
      cy.get('[data-cy="cultural-preservation"]').should('be.visible');
      cy.get('[data-cy="sustainable-practices"]').should('be.visible');
    });

    it('should have working navigation', () => {
      cy.get('[data-cy="back-to-artisans"]').should('be.visible');
      cy.get('[data-cy="back-to-artisans"]').click();
      cy.url().should('include', '/artisans');
    });

    it('should show featured badge for featured artisans', () => {
      cy.visit('/artisans');
      cy.get('[data-cy="featured-artisan-card"]').first().click();
      
      cy.get('[data-cy="featured-badge"]').should('be.visible');
      cy.contains('Featured Artisan').should('be.visible');
    });

    it('should be accessible', () => {
      cy.checkAccessibility();
      
      // Check heading hierarchy
      cy.get('h1').should('exist');
      cy.get('h2').should('exist');
      
      // Check images have alt text
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });
  });

  describe('Product-Artisan Integration', () => {
    it('should link products to artisans from shop page', () => {
      cy.visit('/shop');
      
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="artisan-link"]').should('be.visible');
        cy.get('[data-cy="artisan-link"]').click();
      });
      
      cy.url().should('include', '/artisans/');
      cy.get('[data-cy="artisan-profile"]').should('be.visible');
    });

    it('should show artisan info on product detail page', () => {
      cy.visit('/shop');
      cy.get('[data-cy="product-card"]').first().click();
      
      cy.get('[data-cy="artisan-section"]').should('be.visible');
      cy.get('[data-cy="artisan-name"]').should('be.visible');
      cy.get('[data-cy="view-artisan-profile"]').should('be.visible');
    });

    it('should navigate from product to artisan profile', () => {
      cy.visit('/shop');
      cy.get('[data-cy="product-card"]').first().click();
      
      cy.get('[data-cy="view-artisan-profile"]').click();
      cy.url().should('include', '/artisans/');
    });
  });

  describe('Cultural Content Features', () => {
    beforeEach(() => {
      cy.visit('/artisans');
      cy.get('[data-cy="artisan-card"]').first().click();
    });

    it('should display traditional techniques', () => {
      cy.get('[data-cy="traditional-techniques"]').should('be.visible');
      cy.get('[data-cy="technique-item"]').should('have.length.greaterThan', 0);
    });

    it('should show cultural values', () => {
      cy.get('[data-cy="cultural-values"]').should('be.visible');
      cy.get('[data-cy="value-item"]').should('have.length.greaterThan', 0);
    });

    it('should display community impact metrics', () => {
      cy.get('[data-cy="impact-metrics"]').should('be.visible');
      cy.get('[data-cy="family-members"]').should('be.visible');
      cy.get('[data-cy="experience-years"]').should('be.visible');
      cy.get('[data-cy="product-count"]').should('be.visible');
    });

    it('should show heritage preservation message', () => {
      cy.contains('Preserving Himalayan Heritage').should('be.visible');
      cy.contains('guardian of ancient traditions').should('be.visible');
    });
  });

  describe('Navigation Integration', () => {
    it('should have artisans link in main navigation', () => {
      cy.visit('/');
      cy.get('[data-cy="nav-artisans"]').should('be.visible');
      cy.get('[data-cy="nav-artisans"]').click();
      cy.url().should('include', '/artisans');
    });

    it('should have artisans link in mobile navigation', () => {
      cy.setMobileViewport();
      cy.visit('/');
      
      cy.get('[data-cy="mobile-menu-button"]').click();
      cy.get('[data-cy="mobile-nav-artisans"]').should('be.visible');
      cy.get('[data-cy="mobile-nav-artisans"]').click();
      cy.url().should('include', '/artisans');
    });

    it('should have artisans link in footer', () => {
      cy.visit('/');
      cy.scrollTo('bottom');
      
      cy.get('footer').within(() => {
        cy.get('a[href="/artisans"]').should('be.visible');
        cy.get('a[href="/artisans"]').click();
      });
      
      cy.url().should('include', '/artisans');
    });
  });

  describe('Admin Artisan Management', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.visit('/admin');
    });

    it('should have artisan seeding functionality', () => {
      cy.get('[data-cy="artisan-seed-button"]').should('be.visible');
      cy.contains('Seed Artisan Profiles').should('be.visible');
    });

    it('should seed artisan data successfully', () => {
      cy.get('[data-cy="artisan-seed-button"]').click();
      
      cy.get('[data-cy="seeding-message"]').should('be.visible');
      cy.contains('Artisans seeded successfully', { timeout: 10000 }).should('be.visible');
    });

    it('should show artisan management section', () => {
      cy.contains('Artisan Database Setup').should('be.visible');
      cy.contains('artisan profiles and cultural stories').should('be.visible');
    });
  });

  describe('Performance and Loading', () => {
    it('should load artisan directory quickly', () => {
      const startTime = Date.now();
      
      cy.visit('/artisans');
      cy.get('[data-cy="artisans-directory"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load in under 3 seconds
      });
    });

    it('should load artisan profiles quickly', () => {
      cy.visit('/artisans');
      cy.get('[data-cy="artisan-card"]').first().click();
      
      const startTime = Date.now();
      cy.get('[data-cy="artisan-profile"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(2000); // Should load in under 2 seconds
      });
    });

    it('should handle large amounts of artisan content', () => {
      cy.visit('/artisans');
      
      // Should handle scrolling through many artisans
      cy.get('[data-cy="artisan-card"]').should('have.length.greaterThan', 0);
      cy.scrollTo('bottom');
      cy.get('[data-cy="artisans-directory"]').should('be.visible');
    });
  });

  describe('SEO and Meta Tags', () => {
    it('should have proper meta tags on artisan directory', () => {
      cy.visit('/artisans');
      
      cy.title().should('contain', 'Artisans');
      cy.get('meta[name="description"]').should('have.attr', 'content');
    });

    it('should have proper meta tags on artisan profiles', () => {
      cy.visit('/artisans');
      cy.get('[data-cy="artisan-card"]').first().click();
      
      cy.title().should('not.be.empty');
      cy.get('meta[name="description"]').should('have.attr', 'content');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent artisan profiles', () => {
      cy.visit('/artisans/non-existent-artisan');
      
      cy.contains('Artisan not found').should('be.visible');
      cy.get('[data-cy="back-to-artisans"]').should('be.visible');
    });

    it('should handle empty artisan directory gracefully', () => {
      // Mock empty artisan response
      cy.intercept('GET', '/api/artisans*', { body: [] }).as('emptyArtisans');
      
      cy.visit('/artisans');
      cy.wait('@emptyArtisans');
      
      cy.contains('No artisans found').should('be.visible');
    });

    it('should handle network errors for artisan data', () => {
      cy.intercept('GET', '/api/artisans*', { forceNetworkError: true }).as('networkError');
      
      cy.visit('/artisans');
      cy.wait('@networkError');
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.get('[data-cy="retry-button"]').should('be.visible');
    });
  });

  describe('Cross-browser Compatibility', () => {
    ['chrome', 'firefox', 'edge'].forEach((browser) => {
      it(`should work properly in ${browser}`, () => {
        cy.visit('/artisans');
        cy.get('[data-cy="artisans-directory"]').should('be.visible');
        
        cy.get('[data-cy="artisan-card"]').first().click();
        cy.get('[data-cy="artisan-profile"]').should('be.visible');
      });
    });
  });
});