describe('Complete User Journey - Ramro E-commerce', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/')
    
    // Wait for the page to load
    cy.get('body').should('be.visible')
  })

  it('should complete a full user journey from browsing to purchase', () => {
    // Step 1: Browse the home page
    cy.contains('Ramro').should('be.visible')
    cy.contains('Shop Now').should('be.visible')
    
    // Step 2: Navigate to shop
    cy.get('a[href*="/shop"]').first().click()
    cy.url().should('include', '/shop')
    cy.contains('Shop Ramro Products').should('be.visible')
    
    // Step 3: Browse products
    cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0)
    
    // Step 4: Add product to cart
    cy.get('[data-cy="product-card"]').first().within(() => {
      cy.contains('Add to Cart').click()
    })
    
    // Step 5: Verify cart count updated
    cy.get('[data-cy="cart-count"]').should('contain', '1')
    
    // Step 6: Go to cart
    cy.get('a[href*="/cart"]').click()
    cy.url().should('include', '/cart')
    cy.contains('Shopping Cart').should('be.visible')
    
    // Step 7: Verify product in cart
    cy.get('[data-cy="cart-item"]').should('have.length', 1)
    
    // Step 8: Proceed to checkout (requires login)
    cy.contains('Proceed to Checkout').click()
    
    // Should redirect to login if not authenticated
    cy.url().should('include', '/login')
    
    // Step 9: Sign up for new account
    cy.contains('Create an account').click()
    cy.url().should('include', '/signup')
    
    // Fill signup form
    const testEmail = `test${Date.now()}@example.com`
    cy.get('input[name="name"]').type('Test User')
    cy.get('input[name="email"]').type(testEmail)
    cy.get('input[name="password"]').type('password123')
    
    // Submit signup
    cy.get('button[type="submit"]').click()
    
    // Should redirect to home after successful signup
    cy.url().should('not.include', '/signup')
    
    // Step 10: Go back to cart and checkout
    cy.get('a[href*="/cart"]').click()
    cy.contains('Proceed to Checkout').click()
    
    // Should now go to checkout page
    cy.url().should('include', '/checkout')
    cy.contains('Checkout').should('be.visible')
    
    // Step 11: Fill shipping information
    cy.get('input[name="firstName"]').type('Test')
    cy.get('input[name="lastName"]').type('User')
    cy.get('input[name="phone"]').type('1234567890')
    cy.get('input[name="address"]').type('123 Test Street')
    cy.get('input[name="city"]').type('Test City')
    cy.get('input[name="zipCode"]').type('12345')
    
    // Step 12: Select Cash on Delivery
    cy.get('input[value="cod"]').check()
    
    // Step 13: Place order
    cy.contains('Place Order').click()
    
    // Step 14: Verify order success
    cy.url().should('include', '/orders')
    // Note: In a real test, you'd verify the order appears in the orders list
  })

  it('should handle product search and filtering', () => {
    // Navigate to shop
    cy.get('a[href*="/shop"]').first().click()
    
    // Test search functionality
    cy.get('input[placeholder*="Search"]').type('honey')
    cy.get('[data-cy="product-card"]').should('contain.text', 'Honey')
    
    // Test category filtering
    cy.get('select').first().select('honey')
    cy.get('[data-cy="product-card"]').each(($card) => {
      cy.wrap($card).should('contain.text', 'Honey')
    })
    
    // Test sorting
    cy.get('select').last().select('price-low')
    // Verify products are sorted by price (would need data attributes to verify)
  })

  it('should handle wishlist functionality', () => {
    // Navigate to shop
    cy.get('a[href*="/shop"]').first().click()
    
    // Add item to wishlist
    cy.get('[data-cy="wishlist-button"]').first().click()
    
    // Navigate to wishlist
    cy.get('a[href*="/wishlist"]').click()
    cy.url().should('include', '/wishlist')
    
    // Verify item in wishlist
    cy.get('[data-cy="wishlist-item"]').should('have.length', 1)
  })

  it('should handle responsive navigation', () => {
    // Test mobile menu on small screens
    cy.viewport('iphone-6')
    
    // Mobile menu should be visible
    cy.get('[data-cy="mobile-menu-button"]').should('be.visible')
    cy.get('[data-cy="mobile-menu-button"]').click()
    
    // Mobile menu items should be visible
    cy.get('[data-cy="mobile-menu"]').should('be.visible')
    cy.get('[data-cy="mobile-menu"]').within(() => {
      cy.contains('Home').should('be.visible')
      cy.contains('Shop').should('be.visible')
      cy.contains('Cart').should('be.visible')
    })
  })
})