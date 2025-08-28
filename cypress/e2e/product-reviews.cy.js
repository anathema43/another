describe('Product Reviews & Ratings', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Review Submission', () => {
    it('should allow logged-in users to submit a review', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().click();
      
      // Should see review form for logged-in users
      cy.get('[data-cy="review-form"]').should('be.visible');
      
      // Fill out review form
      cy.get('[data-cy="review-rating"]').click(); // Click 5th star
      cy.get('[data-cy="review-text"]').type('Excellent product! Highly recommend.');
      cy.get('[data-cy="submit-review"]').click();
      
      // Should see success message
      cy.get('[data-cy="review-success"]').should('contain', 'Review submitted successfully');
      
      // Should see the new review in the list
      cy.get('[data-cy="review-list"]').should('contain', 'Excellent product');
    });

    it('should not show review form to non-logged-in users', () => {
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().click();
      
      // Should not see review form
      cy.get('[data-cy="review-form"]').should('not.exist');
      
      // Should see login prompt
      cy.get('[data-cy="login-to-review"]').should('be.visible');
      cy.get('[data-cy="login-to-review"]').should('contain', 'Please log in to write a review');
    });

    it('should validate review form inputs', () => {
      cy.loginAsUser();
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().click();
      
      // Try to submit without rating
      cy.get('[data-cy="review-text"]').type('Great product');
      cy.get('[data-cy="submit-review"]').click();
      
      cy.get('[data-cy="rating-error"]').should('contain', 'Please select a rating');
      
      // Try to submit without review text
      cy.get('[data-cy="review-rating"]').click();
      cy.get('[data-cy="review-text"]').clear();
      cy.get('[data-cy="submit-review"]').click();
      
      cy.get('[data-cy="review-text-error"]').should('contain', 'Please write a review');
    });
  });

  describe('Review Display', () => {
    it('should display existing reviews on product page', () => {
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().click();
      
      // Should see reviews section
      cy.get('[data-cy="reviews-section"]').should('be.visible');
      cy.get('[data-cy="reviews-title"]').should('contain', 'Customer Reviews');
      
      // Should see review list (even if empty)
      cy.get('[data-cy="review-list"]').should('be.visible');
    });

    it('should show average rating and review count', () => {
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().click();
      
      // Should see rating summary
      cy.get('[data-cy="rating-summary"]').should('be.visible');
      cy.get('[data-cy="average-rating"]').should('be.visible');
      cy.get('[data-cy="review-count"]').should('be.visible');
    });
  });
});