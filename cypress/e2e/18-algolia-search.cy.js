describe('Algolia Search Integration', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Instant Search', () => {
    it('should provide instant search results as user types', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="algolia-search-input"]').type('hon');
      
      // Should show instant results without clicking search
      cy.get('[data-cy="instant-search-results"]').should('be.visible');
      cy.get('[data-cy="search-result-item"]').should('contain', 'honey');
    });

    it('should handle typo tolerance', () => {
      cy.navigateToShop();
      
      // Type with typo
      cy.get('[data-cy="algolia-search-input"]').type('hony');
      
      // Should still find honey products
      cy.get('[data-cy="search-result-item"]').should('contain', 'honey');
      cy.get('[data-cy="typo-correction"]').should('contain', 'Did you mean: honey');
    });

    it('should provide autocomplete suggestions', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="algolia-search-input"]').type('him');
      
      // Should show autocomplete dropdown
      cy.get('[data-cy="autocomplete-dropdown"]').should('be.visible');
      cy.get('[data-cy="suggestion-item"]').should('contain', 'himalayan');
      
      // Click suggestion
      cy.get('[data-cy="suggestion-item"]').first().click();
      cy.get('[data-cy="algolia-search-input"]').should('have.value', 'himalayan');
    });

    it('should clear search results', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      cy.get('[data-cy="instant-search-results"]').should('be.visible');
      
      cy.get('[data-cy="clear-search-button"]').click();
      cy.get('[data-cy="algolia-search-input"]').should('have.value', '');
      cy.get('[data-cy="instant-search-results"]').should('not.exist');
    });
  });

  describe('Faceted Search', () => {
    it('should apply multiple filters simultaneously', () => {
      cy.navigateToShop();
      
      // Apply category filter
      cy.get('[data-cy="algolia-category-filter"]').within(() => {
        cy.get('[data-cy="filter-honey"]').check();
      });
      
      // Apply price range filter
      cy.get('[data-cy="algolia-price-filter"]').within(() => {
        cy.get('[data-cy="price-range-slider"]').invoke('val', 500).trigger('input');
      });
      
      // Apply rating filter
      cy.get('[data-cy="algolia-rating-filter"]').within(() => {
        cy.get('[data-cy="rating-4-plus"]').check();
      });
      
      // Should show filtered results
      cy.get('[data-cy="search-result-item"]').each(($item) => {
        cy.wrap($item).should('contain', 'honey');
        cy.wrap($item).within(() => {
          cy.get('[data-cy="product-price"]').invoke('text').then((price) => {
            const numPrice = parseInt(price.replace(/[^\d]/g, ''));
            expect(numPrice).to.be.lessThan(500);
          });
        });
      });
    });

    it('should show filter counts', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="algolia-category-filter"]').within(() => {
        cy.get('[data-cy="filter-honey"]').should('contain', '(');
        cy.get('[data-cy="filter-pickle"]').should('contain', '(');
      });
    });

    it('should handle no results gracefully', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="algolia-search-input"]').type('nonexistentproduct123');
      
      cy.get('[data-cy="no-results-message"]').should('be.visible');
      cy.get('[data-cy="search-suggestions"]').should('be.visible');
      cy.contains('Try searching for').should('be.visible');
    });
  });

  describe('Search Analytics', () => {
    it('should track search queries', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="algolia-search-input"]').type('himalayan honey');
      cy.get('[data-cy="search-button"]').click();
      
      // Should track the search
      cy.window().then((win) => {
        expect(win.algoliaAnalytics).to.exist;
        expect(win.algoliaAnalytics.lastQuery).to.equal('himalayan honey');
      });
    });

    it('should track click-through rates', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      cy.get('[data-cy="search-result-item"]').first().click();
      
      // Should track the click
      cy.window().then((win) => {
        expect(win.algoliaAnalytics.clicks).to.be.greaterThan(0);
      });
    });
  });

  describe('Advanced Search Features', () => {
    it('should handle synonym matching', () => {
      cy.navigateToShop();
      
      // Search for synonym
      cy.get('[data-cy="algolia-search-input"]').type('natural');
      
      // Should find organic products
      cy.get('[data-cy="search-result-item"]').should('contain', 'organic');
    });

    it('should provide trending searches', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="algolia-search-input"]').focus();
      
      // Should show trending searches
      cy.get('[data-cy="trending-searches"]').should('be.visible');
      cy.get('[data-cy="trending-item"]').should('have.length.greaterThan', 0);
    });

    it('should handle search result ranking', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="algolia-search-input"]').type('himalayan');
      
      // Results should be ranked by relevance
      cy.get('[data-cy="search-result-item"]').first().should('contain', 'Himalayan');
    });
  });

  describe('Mobile Search Experience', () => {
    beforeEach(() => {
      cy.setMobileViewport();
    });

    it('should provide mobile-optimized search', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="mobile-search-button"]').click();
      cy.get('[data-cy="mobile-search-overlay"]').should('be.visible');
      
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      cy.get('[data-cy="mobile-search-results"]').should('be.visible');
    });

    it('should handle mobile autocomplete', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="mobile-search-button"]').click();
      cy.get('[data-cy="algolia-search-input"]').type('him');
      
      cy.get('[data-cy="mobile-autocomplete"]').should('be.visible');
      cy.get('[data-cy="suggestion-item"]').first().click();
    });
  });

  describe('Search Performance', () => {
    it('should provide fast search results', () => {
      cy.navigateToShop();
      
      const startTime = Date.now();
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      
      cy.get('[data-cy="search-result-item"]').should('be.visible');
      
      cy.then(() => {
        const searchTime = Date.now() - startTime;
        expect(searchTime).to.be.lessThan(500); // Sub-500ms search
      });
    });
  });
});