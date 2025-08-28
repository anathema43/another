describe('Stories Content Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Story Categories and Content', () => {
    beforeEach(() => {
      cy.visit('/stories');
    });

    it('should display diverse story categories', () => {
      cy.url().should('include', '/stories');
      cy.contains('Darjeeling Stories & News').should('be.visible');
      
      // Check category filters
      cy.contains('Events & Festivals').should('be.visible');
      cy.contains('People & Profiles').should('be.visible');
      cy.contains('Places & Destinations').should('be.visible');
      cy.contains('Traditions & Culture').should('be.visible');
      cy.contains('Artisan Stories').should('be.visible');
      cy.contains('Food & Recipes').should('be.visible');
      cy.contains('Community Impact').should('be.visible');
      cy.contains('Environment').should('be.visible');
    });

    it('should have featured event story', () => {
      // Check for featured story section
      cy.contains('Featured Story').should('be.visible');
      cy.get('.bg-organic-primary').contains('Featured Story').should('be.visible');
      
      // Should have event story as featured
      cy.contains('Darjeeling Winter Festival 2024').should('be.visible');
      cy.contains('magical celebration').should('be.visible');
    });

    it('should filter stories by events category', () => {
      cy.contains('Events & Festivals').click();
      
      // Should show only event stories
      cy.get('article').should('be.visible');
      cy.get('article').should('contain', 'Festival');
    });

    it('should filter stories by places category', () => {
      cy.contains('Places & Destinations').click();
      
      // Should show place-related stories
      cy.get('article').should('contain', 'Sacred Groves');
    });

    it('should filter stories by traditions category', () => {
      cy.contains('Traditions & Culture').click();
      
      // Should show tradition stories
      cy.get('article').should('contain', 'Losar');
    });

    it('should display story with proper metadata', () => {
      cy.get('article').first().within(() => {
        // Should have author info
        cy.get('img[alt*="author"]').should('be.visible');
        cy.get('[data-cy="story-author"]').should('be.visible');
        cy.get('[data-cy="story-date"]').should('be.visible');
        cy.get('[data-cy="read-time"]').should('be.visible');
        
        // Should have category badge
        cy.get('.bg-organic-highlight').should('be.visible');
      });
    });
  });

  describe('Story Detail Page', () => {
    it('should navigate to story detail correctly', () => {
      cy.visit('/stories');
      
      cy.get('article').first().within(() => {
        cy.contains('Read Story').click();
      });
      
      cy.url().should('include', '/stories/');
      cy.get('article').should('be.visible');
      cy.get('h1').should('be.visible');
    });

    it('should display complete story content', () => {
      cy.visit('/stories');
      cy.get('article').first().within(() => {
        cy.contains('Read Story').click();
      });
      
      // Should have story elements
      cy.get('h1').should('be.visible'); // Story title
      cy.get('img').should('be.visible'); // Featured image
      cy.get('[data-cy="story-author"]').should('be.visible');
      cy.get('[data-cy="story-content"]').should('be.visible');
      cy.get('[data-cy="story-tags"]').should('be.visible');
    });

    it('should have working back navigation', () => {
      cy.visit('/stories');
      cy.get('article').first().within(() => {
        cy.contains('Read Story').click();
      });
      
      cy.contains('Back to Stories').click();
      cy.url().should('include', '/stories');
    });

    it('should handle story sharing', () => {
      cy.visit('/stories');
      cy.get('article').first().within(() => {
        cy.contains('Read Story').click();
      });
      
      cy.get('button').contains('Share').should('be.visible');
    });
  });

  describe('Story Lifecycle Management', () => {
    beforeEach(() => {
      cy.loginAsAdmin();
      cy.visit('/admin');
    });

    it('should display story management dashboard', () => {
      cy.contains('Story Management').should('be.visible');
      cy.get('[data-cy="story-stats"]').should('be.visible');
      
      // Should show story statistics
      cy.contains('Total Stories').should('be.visible');
      cy.contains('Featured').should('be.visible');
      cy.contains('Events').should('be.visible');
      cy.contains('Traditions').should('be.visible');
    });

    it('should create new story', () => {
      cy.get('[data-cy="create-story-button"]').click();
      
      cy.get('[data-cy="story-editor"]').should('be.visible');
      
      // Fill story form
      cy.get('[data-cy="story-title"]').type('Test Event Story');
      cy.get('[data-cy="story-category"]').select('events');
      cy.get('[data-cy="story-author"]').type('Test Author');
      cy.get('[data-cy="story-excerpt"]').type('This is a test event story excerpt.');
      cy.get('[data-cy="story-content"]').type('This is the full content of the test event story.');
      
      cy.get('[data-cy="save-story"]').click();
      
      cy.contains('Story saved successfully').should('be.visible');
    });

    it('should edit existing story', () => {
      cy.get('[data-cy="story-list"]').within(() => {
        cy.get('[data-cy="edit-story-button"]').first().click();
      });
      
      cy.get('[data-cy="story-editor"]').should('be.visible');
      cy.get('[data-cy="story-title"]').should('not.be.empty');
      
      // Make changes
      cy.get('[data-cy="story-title"]').clear().type('Updated Story Title');
      cy.get('[data-cy="save-story"]').click();
      
      cy.contains('Story updated successfully').should('be.visible');
    });

    it('should delete story', () => {
      cy.get('[data-cy="story-list"]').within(() => {
        cy.get('[data-cy="delete-story-button"]').first().click();
      });
      
      cy.get('[data-cy="confirm-delete"]').click();
      
      cy.contains('Story deleted successfully').should('be.visible');
    });

    it('should manage featured stories', () => {
      cy.get('[data-cy="story-list"]').within(() => {
        cy.get('[data-cy="feature-story-button"]').first().click();
      });
      
      cy.contains('Story featured successfully').should('be.visible');
      
      // Should update featured count
      cy.get('[data-cy="featured-count"]').should('be.visible');
    });
  });

  describe('Story Content Quality', () => {
    it('should validate story content before publishing', () => {
      cy.loginAsAdmin();
      cy.visit('/admin');
      
      cy.get('[data-cy="create-story-button"]').click();
      
      // Try to save without required fields
      cy.get('[data-cy="save-story"]').click();
      
      cy.contains('Please fill in title').should('be.visible');
      cy.contains('Please fill in content').should('be.visible');
    });

    it('should handle story images properly', () => {
      cy.visit('/stories');
      
      cy.get('article').each(($story) => {
        cy.wrap($story).within(() => {
          cy.get('img').should('have.attr', 'alt');
          cy.get('img').should('have.attr', 'src');
        });
      });
    });

    it('should display story metadata correctly', () => {
      cy.visit('/stories');
      
      cy.get('article').first().within(() => {
        cy.get('[data-cy="story-author"]').should('be.visible');
        cy.get('[data-cy="story-date"]').should('be.visible');
        cy.get('[data-cy="read-time"]').should('be.visible');
        cy.get('[data-cy="story-category"]').should('be.visible');
      });
    });
  });

  describe('Story Performance and SEO', () => {
    it('should load stories quickly', () => {
      const startTime = Date.now();
      
      cy.visit('/stories');
      cy.get('article').should('have.length.greaterThan', 0);
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load in under 3 seconds
      });
    });

    it('should have proper meta tags for SEO', () => {
      cy.visit('/stories');
      
      cy.title().should('contain', 'Stories');
      cy.get('meta[name="description"]').should('have.attr', 'content');
    });

    it('should handle large numbers of stories efficiently', () => {
      cy.visit('/stories');
      
      // Should handle scrolling and filtering efficiently
      cy.get('article').should('be.visible');
      cy.scrollTo('bottom');
      cy.get('article').should('still.be.visible');
    });
  });
});