describe('Shopping Cart E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Cart Functionality', () => {
    it('should add products to cart', () => {
      cy.visit('/shop');
      cy.contains('All Products').click();
      
      // Add first product
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Verify cart count
      cy.get('[data-cy="cart-count"]').should('contain', '1');
      
      // Add second product
      cy.get('[data-cy="product-card"]').eq(1).within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      cy.get('[data-cy="cart-count"]').should('contain', '2');
    });

    it('should update product quantities in cart', () => {
      cy.visit('/shop');
      cy.contains('All Products').click();
      
      // Add product to cart
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Go to cart page
      cy.visit('/cart');
      
      // Increase quantity
      cy.get('[data-cy="quantity-increase"]').click();
      cy.get('[data-cy="quantity-display"]').should('contain', '2');
      
      // Decrease quantity
      cy.get('[data-cy="quantity-decrease"]').click();
      cy.get('[data-cy="quantity-display"]').should('contain', '1');
    });

    it('should remove products from cart', () => {
      cy.visit('/shop');
      cy.contains('All Products').click();
      
      // Add product
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Go to cart
      cy.visit('/cart');
      
      // Remove product
      cy.get('button[title="Remove item"]').click();
      
      // Should show empty cart
      cy.contains('Your Cart is Empty').should('be.visible');
    });

    it('should calculate totals correctly', () => {
      cy.visit('/shop');
      cy.contains('All Products').click();
      
      // Add products
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      cy.visit('/cart');
      
      // Should show calculation breakdown
      cy.contains('Subtotal:').should('be.visible');
      cy.contains('Tax:').should('be.visible');
      cy.contains('Shipping:').should('be.visible');
      cy.contains('Total:').should('be.visible');
    });

    it('should show free shipping message when applicable', () => {
      cy.visit('/cart');
      
      // Should show shipping info
      cy.contains('Free shipping on orders over ₹500').should('be.visible');
    });
  });

  describe('Cart Persistence', () => {
    it('should persist cart across page navigation', () => {
      cy.visit('/shop');
      cy.contains('All Products').click();
      
      // Add product
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Navigate away and back
      cy.visit('/about');
      cy.visit('/shop');
      
      // Cart should persist
      cy.get('[data-cy="cart-count"]').should('contain', '1');
    });

    it('should persist cart across browser refresh', () => {
      cy.visit('/shop');
      cy.contains('All Products').click();
      
      // Add product
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Refresh page
      cy.reload();
      
      // Cart should persist
      cy.get('[data-cy="cart-count"]').should('contain', '1');
    });
  });

  describe('Checkout Navigation', () => {
    it('should navigate to checkout when cart has items', () => {
      // Sign up first for checkout
      cy.visit('/signup');
      cy.get('[data-cy="signup-name"]').type('Checkout User');
      cy.get('[data-cy="signup-email"]').type('checkout@example.com');
      cy.get('[data-cy="signup-password"]').type('password123');
      cy.get('[data-cy="signup-confirm-password"]').type('password123');
      cy.get('[data-cy="signup-submit"]').click();
      
      // Add items to cart
      cy.visit('/shop');
      cy.contains('All Products').click();
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
      
      // Go to cart and checkout
      cy.visit('/cart');
      cy.get('[data-cy="checkout-button"]').click();
      
      cy.url().should('include', '/checkout');
    });

    it('should not show checkout button when cart is empty', () => {
      cy.visit('/cart');
      
      cy.get('[data-cy="checkout-button"]').should('not.exist');
      cy.contains('Your Cart is Empty').should('be.visible');
    });
  });
});