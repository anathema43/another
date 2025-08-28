describe('Shopping Cart Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Adding Products to Cart', () => {
    it('should add a product to cart from shop page', () => {
      // Navigate to shop
      cy.get('a[href="#/shop"]').click();
      cy.url().should('include', '/shop');
      
      // Wait for products to load
      cy.get('.bg-white.rounded-lg.shadow-lg').should('have.length.greaterThan', 0);
      
      // Add first product to cart
      cy.get('.bg-white.rounded-lg.shadow-lg').first().within(() => {
        cy.get('h2').invoke('text').as('productName');
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Verify cart count updated
      cy.get('span.bg-red-600').should('contain', '1');
    });

    it('should increase quantity when adding same product again', () => {
      cy.get('a[href="#/shop"]').click();
      
      // Add same product twice
      cy.get('.bg-white.rounded-lg.shadow-lg').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
        cy.wait(500); // Wait for state update
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Verify cart count shows 2
      cy.get('span.bg-red-600').should('contain', '2');
    });
  });

  describe('Cart Page Management', () => {
    beforeEach(() => {
      // Add a product to cart first
      cy.get('a[href="#/shop"]').click();
      cy.get('.bg-white.rounded-lg.shadow-lg').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
    });

    it('should navigate to cart page and verify contents', () => {
      // Navigate to cart
      cy.get('a[href="#/cart"]').click();
      cy.url().should('include', '/cart');
      
      // Verify cart contents
      cy.get('.bg-organic-white').should('be.visible');
      cy.contains('Shopping Cart').should('be.visible');
      cy.get('.flex.items-center.gap-6').should('have.length.greaterThan', 0);
    });

    it('should change item quantities on cart page', () => {
      cy.get('a[href="#/cart"]').click();
      
      // Find quantity controls and increase quantity
      cy.get('.flex.items-center.gap-2').first().within(() => {
        cy.get('button').contains('+').click();
      });
      
      // Verify quantity increased
      cy.get('span.min-w-\\[2rem\\]').should('contain', '2');
    });

    it('should successfully remove an item from cart', () => {
      cy.get('a[href="#/cart"]').click();
      
      // Click remove button
      cy.get('button[title="Remove item"]').first().click();
      
      // Verify item removed (cart should be empty or show empty message)
      cy.get('body').should('satisfy', ($body) => {
        return $body.text().includes('Your Cart is Empty') || 
               $body.find('.flex.items-center.gap-6').length === 0;
      });
    });
  });

  describe('Cart Persistence', () => {
    it('should maintain cart contents across page refreshes', () => {
      // Add product to cart
      cy.get('a[href="#/shop"]').click();
      cy.get('.bg-white.rounded-lg.shadow-lg').first().within(() => {
        cy.get('button').contains('Add to Cart').click();
      });
      
      // Refresh page
      cy.reload();
      
      // Verify cart count persists
      cy.get('span.bg-red-600').should('contain', '1');
    });
  });
});