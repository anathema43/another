describe('Artisan Lifecycle Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Artisan Directory Navigation', () => {
    it('should navigate to artisan directory from main navigation', () => {
      cy.get('[data-cy="nav-artisans"]').click();
      cy.url().should('include', '/artisans');
      cy.get('[data-cy="artisans-directory"]').should('be.visible');
    });

    it('should display artisan cards with proper information', () => {
      cy.visit('/artisans');
      
      cy.get('[data-cy="artisan-card"]').should('have.length.greaterThan', 0);
      cy.get('[data-cy="artisan-card"]').first().within(() => {
        cy.get('img').should('be.visible');
        cy.get('h3').should('be.visible'); // Artisan name
        cy.get('[data-cy="artisan-location"]').should('be.visible');
        cy.get('[data-cy="artisan-experience"]').should('be.visible');
      });
    });

    it('should navigate to individual artisan profiles', () => {
      cy.visit('/artisans');
      
      cy.get('[data-cy="artisan-card"]').first().click();
      cy.url().should('include', '/artisans/');
      cy.get('[data-cy="artisan-profile"]').should('be.visible');
    });

    it('should handle artisan profile not found gracefully', () => {
      cy.visit('/artisans/non-existent-artisan');
      
      cy.contains('Artisan not found').should('be.visible');
      cy.get('[data-cy="back-to-artisans"]').should('be.visible');
      cy.get('[data-cy="back-to-artisans"]').click();
      cy.url().should('include', '/artisans');
    });
  });

  describe('Artisan Profile Content', () => {
    beforeEach(() => {
      cy.visit('/artisans');
      cy.get('[data-cy="artisan-card"]').first().click();
    });

    it('should display complete artisan information', () => {
      cy.get('[data-cy="artisan-name"]').should('be.visible');
      cy.get('[data-cy="artisan-title"]').should('be.visible');
      cy.get('[data-cy="artisan-location"]').should('be.visible');
      cy.get('[data-cy="artisan-experience"]').should('be.visible');
      cy.get('[data-cy="artisan-story"]').should('be.visible');
    });

    it('should show cultural heritage section', () => {
      cy.get('[data-cy="cultural-heritage"]').should('be.visible');
      cy.get('[data-cy="traditional-techniques"]').should('be.visible');
      cy.get('[data-cy="cultural-values"]').should('be.visible');
    });

    it('should display impact story', () => {
      cy.get('[data-cy="impact-story"]').should('be.visible');
      cy.get('[data-cy="family-support"]').should('be.visible');
      cy.get('[data-cy="cultural-preservation"]').should('be.visible');
    });
  });

  describe('Story Lifecycle Management', () => {
    it('should navigate to stories from main navigation', () => {
      cy.get('[data-cy="nav-stories"]').click();
      cy.url().should('include', '/stories');
      cy.contains('Darjeeling Stories').should('be.visible');
    });

    it('should display featured story prominently', () => {
      cy.visit('/stories');
      
      cy.get('[data-cy="featured-story"]').should('be.visible');
      cy.contains('Featured Story').should('be.visible');
      cy.contains('Winter Festival').should('be.visible');
    });

    it('should filter stories by category', () => {
      cy.visit('/stories');
      
      // Test events category
      cy.contains('Events & Festivals').click();
      cy.get('article').should('contain', 'Festival');
      
      // Test places category
      cy.contains('Places & Destinations').click();
      cy.get('article').should('contain', 'Sacred Groves');
      
      // Test artisan stories
      cy.contains('Artisan Stories').click();
      cy.get('article').should('contain', 'Pickle Making');
    });

    it('should navigate to story detail pages', () => {
      cy.visit('/stories');
      
      cy.get('article').first().within(() => {
        cy.contains('Read Story').click();
      });
      
      cy.url().should('include', '/stories/');
      cy.get('h1').should('be.visible');
      cy.get('[data-cy="story-content"]').should('be.visible');
    });

    it('should handle story not found gracefully', () => {
      cy.visit('/stories/non-existent-story');
      
      cy.contains('Story not found').should('be.visible');
      cy.get('[data-cy="back-to-stories"]').should('be.visible');
      cy.get('[data-cy="back-to-stories"]').click();
      cy.url().should('include', '/stories');
    });
  });

  describe('Admin Story Management', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.visit('/admin');
    });

    it('should display story management section', () => {
      cy.get('[data-cy="story-management"]').should('be.visible');
      cy.contains('Story Management').should('be.visible');
      cy.get('[data-cy="story-stats"]').should('be.visible');
    });

    it('should show story statistics', () => {
      cy.get('[data-cy="total-stories"]').should('be.visible');
      cy.get('[data-cy="featured-stories"]').should('be.visible');
      cy.get('[data-cy="category-breakdown"]').should('be.visible');
    });

    it('should allow creating new stories', () => {
      cy.get('[data-cy="create-story-button"]').click();
      
      cy.get('[data-cy="story-editor"]').should('be.visible');
      cy.get('[data-cy="story-title"]').type('Test Admin Story');
      cy.get('[data-cy="story-category"]').select('events');
      cy.get('[data-cy="story-author"]').type('Test Author');
      cy.get('[data-cy="story-excerpt"]').type('This is a test story excerpt.');
      cy.get('[data-cy="story-content"]').type('This is the full test story content.');
      
      cy.get('[data-cy="save-story"]').click();
      cy.contains('Story saved successfully').should('be.visible');
    });

    it('should manage story lifecycle states', () => {
      cy.get('[data-cy="story-list"]').should('be.visible');
      
      // Test featuring a story
      cy.get('[data-cy="story-item"]').first().within(() => {
        cy.get('[data-cy="feature-story"]').click();
      });
      
      cy.contains('Story featured successfully').should('be.visible');
    });
  });

  describe('Content Quality and Performance', () => {
    it('should load artisan directory quickly', () => {
      const startTime = Date.now();
      
      cy.visit('/artisans');
      cy.get('[data-cy="artisans-directory"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000);
      });
    });

    it('should load stories page quickly', () => {
      const startTime = Date.now();
      
      cy.visit('/stories');
      cy.get('article').should('have.length.greaterThan', 0);
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000);
      });
    });

    it('should handle large amounts of content efficiently', () => {
      cy.visit('/stories');
      
      // Should handle scrolling through stories
      cy.get('article').should('be.visible');
      cy.scrollTo('bottom');
      cy.get('article').should('still.be.visible');
    });
  });

  describe('Mobile Experience', () => {
    beforeEach(() => {
      cy.setMobileViewport();
    });

    it('should display artisan directory properly on mobile', () => {
      cy.visit('/artisans');
      
      cy.get('[data-cy="artisans-directory"]').should('be.visible');
      cy.get('[data-cy="artisan-card"]').should('be.visible');
    });

    it('should display stories properly on mobile', () => {
      cy.visit('/stories');
      
      cy.get('[data-cy="featured-story"]').should('be.visible');
      cy.get('article').should('be.visible');
      
      // Test category filtering on mobile
      cy.contains('Events & Festivals').click();
      cy.get('article').should('be.visible');
    });

    it('should handle mobile navigation between content', () => {
      cy.visit('/stories');
      cy.get('article').first().within(() => {
        cy.contains('Read Story').click();
      });
      
      cy.get('[data-cy="back-to-stories"]').should('be.visible');
      cy.get('[data-cy="back-to-stories"]').click();
      cy.url().should('include', '/stories');
    });
  });
});