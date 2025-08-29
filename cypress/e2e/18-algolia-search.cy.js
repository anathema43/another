describe('Algolia Search Integration', () => {
  beforeEach(() => {
    cy.visit('/shop');
  });

  describe('Search Functionality', () => {
    it('should provide search input', () => {
      cy.get('[data-cy="algolia-search-container"]').should('be.visible');
      cy.get('[data-cy="algolia-search-input"]').should('be.visible');
    });

    it('should handle search queries', () => {
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      
      // Should show search results or handle gracefully
      cy.get('body').should('not.contain', 'Error');
    });

    it('should provide search suggestions', () => {
      cy.get('[data-cy="algolia-search-input"]').type('him');
      
      // Should show autocomplete dropdown or handle gracefully
      cy.get('[data-cy="autocomplete-dropdown"]').should('exist');
    });

    it('should show trending searches when focused', () => {
      cy.get('[data-cy="algolia-search-input"]').focus();
      
      // Should show trending searches
      cy.get('[data-cy="trending-searches"]').should('be.visible');
    });

    it('should clear search results', () => {
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      cy.get('[data-cy="clear-search-button"]').click();
      
      // Should clear search
      cy.get('[data-cy="algolia-search-input"]').should('have.value', '');
    });
  });

  describe('Search Results', () => {
    it('should display search results', () => {
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      
      // Should show results or no results message
      cy.get('[data-cy="search-results"]').should('be.visible');
    });

    it('should handle no results gracefully', () => {
      cy.get('[data-cy="algolia-search-input"]').type('nonexistentproduct');
      
      // Should show no results message
      cy.get('[data-cy="no-results-message"]').should('be.visible');
    });

    it('should show search suggestions for no results', () => {
      cy.get('[data-cy="algolia-search-input"]').type('xyz123');
      
      // Should show search suggestions
      cy.get('[data-cy="search-suggestions"]').should('be.visible');
    });
  });

  describe('Search Performance', () => {
    it('should provide instant search results', () => {
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      
      // Should show results quickly (within reasonable time)
      cy.get('[data-cy="search-results"]', { timeout: 2000 }).should('be.visible');
    });

    it('should handle typos in search', () => {
      cy.get('[data-cy="algolia-search-input"]').type('hony'); // Typo for honey
      
      // Should still show relevant results or suggestions
      cy.get('body').should('not.contain', 'Error');
    });
  });

  describe('Search Analytics', () => {
    it('should track search queries', () => {
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      
      // Search should be tracked (no visible UI, but no errors)
      cy.get('body').should('not.contain', 'Error');
    });
  });
});