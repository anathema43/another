describe('Product Browsing and Search', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Product Catalog', () => {
    it('should display products on shop page', () => {
      cy.navigateToShop();
      
      // Verify products are loaded
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0);
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="product-name"]').should('be.visible');
        cy.get('[data-cy="product-price"]').should('be.visible');
        cy.get('[data-cy="product-image"]').should('be.visible');
        cy.get('[data-cy="add-to-cart-button"]').should('be.visible');
      });
    });

    it('should show product details when clicked', () => {
      cy.navigateToShop();
      
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="product-name"]').invoke('text').as('productName');
        cy.get('[data-cy="view-details-link"]').click();
      });
      
      cy.url().should('include', '/products/');
      cy.get('[data-cy="product-detail-page"]').should('be.visible');
      cy.get('@productName').then((name) => {
        cy.get('[data-cy="product-title"]').should('contain', name);
      });
    });

    it('should handle out of stock products', () => {
      cy.navigateToShop();
      
      // Mock out of stock product
      cy.intercept('GET', '/api/products*', {
        fixture: 'products.json'
      }).as('getProducts');
      
      cy.get('[data-cy="product-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-cy="stock-status"]').then(($status) => {
            if ($status.text().includes('Out of Stock')) {
              cy.get('[data-cy="add-to-cart-button"]').should('be.disabled');
              cy.get('[data-cy="out-of-stock-badge"]').should('be.visible');
            }
          });
        });
      });
    });
  });

  describe('Product Search', () => {
    beforeEach(() => {
      cy.navigateToShop();
    });

    it('should search products with Algolia instant search', () => {
      const searchTerm = 'honey';
      
      cy.get('[data-cy="algolia-search-input"]').type(searchTerm);
      
      // Should show instant results
      cy.get('[data-cy="instant-search-results"]').should('be.visible');
      cy.get('[data-cy="search-result-item"]').each(($card) => {
        cy.wrap($card).should('contain.text', searchTerm);
      });
    });

    it('should provide autocomplete suggestions', () => {
      cy.get('[data-cy="algolia-search-input"]').type('him');
      
      // Should show autocomplete dropdown
      cy.get('[data-cy="autocomplete-dropdown"]').should('be.visible');
      cy.get('[data-cy="suggestion-item"]').should('contain', 'himalayan');
    });

    it('should handle typo tolerance', () => {
      cy.get('[data-cy="algolia-search-input"]').type('hony'); // Typo for "honey"
      
      // Should still find honey products
      cy.get('[data-cy="search-result-item"]').should('contain', 'honey');
    });

    it('should show no results message for invalid search', () => {
      cy.get('[data-cy="algolia-search-input"]').type('nonexistentproduct123');
      
      cy.get('[data-cy="no-results-message"]').should('be.visible');
      cy.get('[data-cy="no-results-message"]').should('contain', 'No products found');
      cy.get('[data-cy="search-suggestions"]').should('be.visible');
    });

    it('should clear search results', () => {
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      cy.get('[data-cy="clear-search-button"]').click();
      
      cy.get('[data-cy="algolia-search-input"]').should('have.value', '');
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 1);
    });

    it('should test Algolia search analytics', () => {
      cy.navigateToShop();
      
      // Perform search
      cy.get('[data-cy="algolia-search-input"]').type('honey');
      cy.get('[data-cy="search-result-item"]').first().click();
      
      // Should track search and click
      cy.window().then((win) => {
        const analytics = win.searchService?.getSearchAnalytics();
        if (analytics) {
          expect(analytics.queries.length).to.be.greaterThan(0);
          expect(analytics.clicks.length).to.be.greaterThan(0);
        }
      });
    });
  });

  describe('Product Filtering', () => {
    beforeEach(() => {
      cy.navigateToShop();
    });

    it('should filter products with Algolia faceted search', () => {
      cy.get('[data-cy="algolia-filters-button"]').click();
      cy.get('[data-cy="algolia-category-filter"]').within(() => {
        cy.get('[data-cy="filter-honey"]').check();
      });
      
      cy.get('[data-cy="search-result-item"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-cy="product-category"]').should('contain', 'honey');
        });
      });
    });

    it('should filter products by price range with Algolia', () => {
      cy.get('[data-cy="algolia-filters-button"]').click();
      cy.get('[data-cy="algolia-price-filter"]').within(() => {
        cy.get('[data-cy="price-range-slider"]').invoke('val', 500).trigger('input');
      });
      
      cy.get('[data-cy="search-result-item"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-cy="product-price"]').invoke('text').then((priceText) => {
            const price = parseInt(priceText.replace(/[^\d]/g, ''));
            expect(price).to.be.lessThan(500);
          });
        });
      });
    });

    it('should apply multiple filters simultaneously', () => {
      cy.get('[data-cy="algolia-filters-button"]').click();
      
      // Apply category filter
      cy.get('[data-cy="algolia-category-filter"]').within(() => {
        cy.get('[data-cy="filter-honey"]').check();
      });
      
      // Apply rating filter
      cy.get('[data-cy="algolia-rating-filter"]').within(() => {
        cy.get('[data-cy="rating-4-plus"]').click();
      });
      
      // Should show filtered results
      cy.get('[data-cy="search-result-item"]').should('be.visible');
    });
  });

  describe('Product Details Page', () => {
    beforeEach(() => {
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().click();
    });

    it('should display complete product information', () => {
      cy.get('[data-cy="product-title"]').should('be.visible');
      cy.get('[data-cy="product-description"]').should('be.visible');
      cy.get('[data-cy="product-price"]').should('be.visible');
      cy.get('[data-cy="product-rating"]').should('be.visible');
      cy.get('[data-cy="product-image"]').should('be.visible');
      cy.get('[data-cy="stock-info"]').should('be.visible');
    });

    it('should allow adding product to cart from detail page', () => {
      cy.get('[data-cy="add-to-cart-button"]').click();
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      cy.get('[data-cy="success-message"]').should('contain', 'Added to cart');
    });

    it('should allow adding product to wishlist', () => {
      cy.get('[data-cy="wishlist-button"]').click();
      cy.get('[data-cy="wishlist-count"]').should('be.visible');
      cy.get('[data-cy="success-message"]').should('contain', 'Added to wishlist');
    });

    it('should show related products', () => {
      cy.get('[data-cy="related-products"]').should('be.visible');
      cy.get('[data-cy="related-product-card"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Responsive Design', () => {
    it('should display properly on mobile devices', () => {
      cy.setMobileViewport();
      cy.navigateToShop();
      
      // Check mobile-specific elements
      cy.get('[data-cy="mobile-filter-button"]').should('be.visible');
      cy.get('[data-cy="product-grid"]').should('have.class', 'mobile-grid');
      
      // Test mobile navigation
      cy.get('[data-cy="mobile-menu-button"]').click();
      cy.get('[data-cy="mobile-menu"]').should('be.visible');
    });

    it('should display properly on tablet devices', () => {
      cy.setTabletViewport();
      cy.navigateToShop();
      
      cy.get('[data-cy="product-grid"]').should('have.class', 'tablet-grid');
      cy.get('[data-cy="sidebar-filters"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      cy.navigateToShop();
      cy.checkAccessibility();
      
      // Check specific accessibility features
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('img').should('have.attr', 'alt');
        cy.get('[data-cy="add-to-cart-button"]').should('have.attr', 'aria-label');
      });
    });

    it('should support keyboard navigation', () => {
      cy.navigateToShop();
      
      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'search-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'category-filter');
    });
  });
});