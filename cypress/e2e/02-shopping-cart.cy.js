describe('Shopping Cart Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Add to Cart', () => {
    it('should add products to cart from shop page', () => {
      cy.navigateToShop();
      
      // Add first product to cart
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="product-name"]').invoke('text').as('productName');
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Verify cart count updated
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      
      // Verify product in cart
      cy.navigateToCart();
      cy.get('@productName').then((name) => {
        cy.get('[data-cy="cart-item"]').should('contain', name);
      });
    });

    it('should add products to cart from product detail page', () => {
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().click();
      
      cy.get('[data-cy="product-title"]').invoke('text').as('productName');
      cy.get('[data-cy="add-to-cart-button"]').click();
      
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      cy.navigateToCart();
      
      cy.get('@productName').then((name) => {
        cy.get('[data-cy="cart-item"]').should('contain', name);
      });
    });

    it('should update quantity when adding same product multiple times', () => {
      cy.navigateToShop();
      
      // Add same product twice
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
        cy.wait(500);
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      cy.get('[data-cy="cart-count"]').should('contain', '2');
      
      cy.navigateToCart();
      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="quantity-display"]').should('contain', '2');
      });
    });

    it('should prevent adding out of stock products', () => {
      // Mock out of stock product
      cy.intercept('GET', '/api/products*', {
        body: [{
          id: '1',
          name: 'Out of Stock Product',
          quantityAvailable: 0,
          price: 299
        }]
      }).as('getProducts');
      
      cy.navigateToShop();
      cy.wait('@getProducts');
      
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').should('be.disabled');
        cy.get('[data-cy="out-of-stock-badge"]').should('be.visible');
      });
    });
  });

  describe('Cart Management', () => {
    beforeEach(() => {
      // Add some products to cart
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      cy.addProductToCart('Himalayan Wild Honey');
    });

    it('should display cart items correctly', () => {
      cy.navigateToCart();
      
      cy.get('[data-cy="cart-item"]').should('have.length', 2);
      cy.get('[data-cy="cart-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-cy="item-name"]').should('be.visible');
          cy.get('[data-cy="item-price"]').should('be.visible');
          cy.get('[data-cy="item-quantity"]').should('be.visible');
          cy.get('[data-cy="item-total"]').should('be.visible');
        });
      });
    });

    it('should update item quantities', () => {
      cy.navigateToCart();
      
      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="quantity-increase"]').click();
        cy.get('[data-cy="quantity-display"]').should('contain', '2');
        
        cy.get('[data-cy="quantity-decrease"]').click();
        cy.get('[data-cy="quantity-display"]').should('contain', '1');
      });
      
      // Verify total updates
      cy.get('[data-cy="cart-total"]').should('be.visible');
    });

    it('should remove items from cart', () => {
      cy.navigateToCart();
      
      cy.get('[data-cy="cart-item"]').first().within(() => {
        cy.get('[data-cy="item-name"]').invoke('text').as('removedItem');
        cy.get('[data-cy="remove-item-button"]').click();
      });
      
      // Confirm removal
      cy.get('[data-cy="confirm-remove-button"]').click();
      
      cy.get('@removedItem').then((itemName) => {
        cy.get('[data-cy="cart-item"]').should('not.contain', itemName);
      });
      
      cy.get('[data-cy="cart-count"]').should('contain', '1');
    });

    it('should clear entire cart', () => {
      cy.navigateToCart();
      
      cy.get('[data-cy="clear-cart-button"]').click();
      cy.get('[data-cy="confirm-clear-button"]').click();
      
      cy.get('[data-cy="empty-cart-message"]').should('be.visible');
      cy.get('[data-cy="cart-count"]').should('not.exist');
    });

    it('should calculate totals correctly', () => {
      cy.navigateToCart();
      
      // Get individual item totals and verify sum
      cy.get('[data-cy="item-total"]').then(($totals) => {
        let expectedTotal = 0;
        $totals.each((index, element) => {
          const itemTotal = parseInt(element.textContent.replace(/[^\d]/g, ''));
          expectedTotal += itemTotal;
        });
        
        cy.get('[data-cy="subtotal"]').invoke('text').then((subtotalText) => {
          const subtotal = parseInt(subtotalText.replace(/[^\d]/g, ''));
          expect(subtotal).to.equal(expectedTotal);
        });
      });
      
      // Verify tax calculation
      cy.get('[data-cy="tax-amount"]').should('be.visible');
      cy.get('[data-cy="shipping-cost"]').should('be.visible');
      cy.get('[data-cy="grand-total"]').should('be.visible');
    });
  });

  describe('Cart Persistence', () => {
    it('should persist cart across browser sessions', () => {
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      
      // Reload page
      cy.reload();
      cy.waitForPageLoad();
      
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      cy.navigateToCart();
      cy.get('[data-cy="cart-item"]').should('contain', 'Darjeeling Pickle');
    });

    it('should sync cart when user logs in', () => {
      // Add items as guest
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      
      // Login
      cy.loginAsUser();
      
      // Verify cart is maintained
      cy.get('[data-cy="cart-count"]').should('contain', '1');
    });
  });

  describe('Cart Validation', () => {
    it('should validate quantity limits', () => {
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      cy.navigateToCart();
      
      // Try to exceed available quantity
      cy.get('[data-cy="cart-item"]').first().within(() => {
        // Click increase button multiple times
        for (let i = 0; i < 15; i++) {
          cy.get('[data-cy="quantity-increase"]').click();
        }
        
        // Should not exceed available stock
        cy.get('[data-cy="quantity-display"]').invoke('text').then((qty) => {
          expect(parseInt(qty)).to.be.at.most(10); // Assuming max stock is 10
        });
      });
      
      cy.get('[data-cy="stock-warning"]').should('be.visible');
    });

    it('should handle inventory changes while in cart', () => {
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
      
      // Mock inventory update
      cy.intercept('GET', '/api/cart/validate', {
        body: {
          valid: false,
          issues: [{
            productId: '1',
            issue: 'quantity_reduced',
            availableQuantity: 2
          }]
        }
      }).as('validateCart');
      
      cy.navigateToCart();
      cy.wait('@validateCart');
      
      cy.get('[data-cy="inventory-warning"]').should('be.visible');
      cy.get('[data-cy="update-cart-button"]').should('be.visible');
    });
  });

  describe('Mobile Cart Experience', () => {
    beforeEach(() => {
      cy.setMobileViewport();
      cy.navigateToShop();
      cy.addProductToCart('Darjeeling Pickle');
    });

    it('should display cart properly on mobile', () => {
      cy.navigateToCart();
      
      cy.get('[data-cy="mobile-cart-layout"]').should('be.visible');
      cy.get('[data-cy="cart-item"]').should('have.class', 'mobile-cart-item');
      
      // Test swipe to remove functionality
      cy.get('[data-cy="cart-item"]').first()
        .trigger('touchstart', { which: 1, pageX: 100, pageY: 100 })
        .trigger('touchmove', { which: 1, pageX: 50, pageY: 100 })
        .trigger('touchend');
      
      cy.get('[data-cy="swipe-actions"]').should('be.visible');
    });

    it('should show mobile-optimized checkout button', () => {
      cy.navigateToCart();
      
      cy.get('[data-cy="mobile-checkout-button"]').should('be.visible');
      cy.get('[data-cy="mobile-checkout-button"]').should('be.fixed');
    });
  });

  describe('Cart Error Handling', () => {
    it('should handle network errors gracefully', () => {
      cy.intercept('POST', '/api/cart/add', { forceNetworkError: true }).as('addToCartError');
      
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      cy.wait('@addToCartError');
      cy.get('[data-cy="error-message"]').should('contain', 'network error');
      cy.get('[data-cy="retry-button"]').should('be.visible');
    });

    it('should handle server errors', () => {
      cy.intercept('POST', '/api/cart/add', { statusCode: 500 }).as('serverError');
      
      cy.navigateToShop();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      cy.wait('@serverError');
      cy.get('[data-cy="error-message"]').should('contain', 'server error');
    });
  });
});