describe('Address Management E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    
    // Create and login user
    cy.visit('/signup');
    cy.get('[data-cy="signup-name"]').type('Address Test User');
    cy.get('[data-cy="signup-email"]').type('address@test.com');
    cy.get('[data-cy="signup-password"]').type('password123');
    cy.get('[data-cy="signup-confirm-password"]').type('password123');
    cy.get('[data-cy="signup-submit"]').click();
  });

  describe('Account Page Address Management', () => {
    it('should navigate to addresses section and show empty state', () => {
      cy.visit('/account');
      
      // Click on addresses tab
      cy.contains('My Addresses').click();
      
      // Should show empty state
      cy.contains('No addresses saved yet').should('be.visible');
      cy.get('[data-cy="add-address-button"]').should('be.visible');
    });

    it('should add a new address successfully', () => {
      cy.visit('/account');
      cy.contains('My Addresses').click();
      
      // Click add new address
      cy.get('[data-cy="add-address-button"]').click();
      
      // Fill address form
      cy.get('[data-cy="address-label-select"]').select('Home');
      cy.get('[data-cy="recipient-name-input"]').type('John Doe');
      cy.get('[data-cy="recipient-phone-input"]').type('+91 9876543210');
      cy.get('[data-cy="full-address-input"]').type('123 Test Street, Test City, Test State, 123456');
      cy.get('[data-cy="default-address-checkbox"]').check();
      
      // Save address
      cy.get('[data-cy="save-address-button"]').click();
      
      // Should show in address book
      cy.get('[data-cy="address-card"]').should('be.visible');
      cy.contains('John Doe').should('be.visible');
      cy.contains('Home').should('be.visible');
      cy.contains('Default').should('be.visible');
    });

    it('should edit an existing address', () => {
      // First add an address
      cy.visit('/account');
      cy.contains('My Addresses').click();
      cy.get('[data-cy="add-address-button"]').click();
      
      cy.get('[data-cy="recipient-name-input"]').type('Original Name');
      cy.get('[data-cy="recipient-phone-input"]').type('+91 9876543210');
      cy.get('[data-cy="full-address-input"]').type('Original Address');
      cy.get('[data-cy="save-address-button"]').click();
      
      // Edit the address
      cy.get('[data-cy="edit-address-button"]').click();
      cy.get('[data-cy="recipient-name-input"]').clear().type('Updated Name');
      cy.get('[data-cy="save-address-button"]').click();
      
      // Should show updated name
      cy.contains('Updated Name').should('be.visible');
    });

    it('should delete an address', () => {
      // First add an address
      cy.visit('/account');
      cy.contains('My Addresses').click();
      cy.get('[data-cy="add-address-button"]').click();
      
      cy.get('[data-cy="recipient-name-input"]').type('To Delete');
      cy.get('[data-cy="recipient-phone-input"]').type('+91 9876543210');
      cy.get('[data-cy="full-address-input"]').type('Delete This Address');
      cy.get('[data-cy="save-address-button"]').click();
      
      // Delete the address
      cy.get('[data-cy="delete-address-button"]').click();
      
      // Confirm deletion
      cy.on('window:confirm', () => true);
      
      // Should show empty state again
      cy.contains('No addresses saved yet').should('be.visible');
    });

    it('should handle custom label for "Other" address type', () => {
      cy.visit('/account');
      cy.contains('My Addresses').click();
      cy.get('[data-cy="add-address-button"]').click();
      
      // Select "Other" and add custom label
      cy.get('[data-cy="address-label-select"]').select('Other');
      cy.get('[data-cy="custom-label-input"]').type('Mom\'s House');
      cy.get('[data-cy="recipient-name-input"]').type('Jane Doe');
      cy.get('[data-cy="recipient-phone-input"]').type('+91 9876543210');
      cy.get('[data-cy="full-address-input"]').type('456 Custom Address');
      cy.get('[data-cy="save-address-button"]').click();
      
      // Should show custom label
      cy.contains('Mom\'s House').should('be.visible');
    });
  });

  describe('Checkout Address Selection', () => {
    beforeEach(() => {
      // Add items to cart first
      cy.visit('/shop');
      cy.get('[data-cy="product-card"]').first().within(() => {
        cy.get('[data-cy="add-to-cart-button"]').click();
      });
    });

    it('should show address selection in checkout', () => {
      cy.visit('/checkout');
      
      // Should show address book
      cy.get('[data-cy="address-book"]').should('be.visible');
      cy.contains('Delivery Address').should('be.visible');
    });

    it('should allow adding new address during checkout', () => {
      cy.visit('/checkout');
      
      // Click add new address
      cy.get('[data-cy="add-address-button"]').click();
      
      // Fill and save address
      cy.get('[data-cy="recipient-name-input"]').type('Checkout User');
      cy.get('[data-cy="recipient-phone-input"]').type('+91 9876543210');
      cy.get('[data-cy="full-address-input"]').type('Checkout Address, City, State, 123456');
      cy.get('[data-cy="save-address-button"]').click();
      
      // Should show selected address confirmation
      cy.contains('Delivery Address Selected').should('be.visible');
      cy.contains('Checkout User').should('be.visible');
    });

    it('should require address selection before proceeding to payment', () => {
      cy.visit('/checkout');
      
      // Try to proceed without selecting address
      cy.get('button[type="submit"]').click();
      
      // Should show error
      cy.contains('Please select a delivery address').should('be.visible');
    });

    it('should proceed to payment with selected address', () => {
      // First add an address
      cy.visit('/account');
      cy.contains('My Addresses').click();
      cy.get('[data-cy="add-address-button"]').click();
      
      cy.get('[data-cy="recipient-name-input"]').type('Test User');
      cy.get('[data-cy="recipient-phone-input"]').type('+91 9876543210');
      cy.get('[data-cy="full-address-input"]').type('Test Address, Test City, 123456');
      cy.get('[data-cy="default-address-checkbox"]').check();
      cy.get('[data-cy="save-address-button"]').click();
      
      // Go to checkout
      cy.visit('/checkout');
      
      // Should auto-select default address
      cy.contains('Delivery Address Selected').should('be.visible');
      
      // Should be able to proceed to payment
      cy.get('button[type="submit"]').click();
      cy.contains('Complete Payment').should('be.visible');
    });
  });

  describe('Address Validation', () => {
    it('should validate required fields', () => {
      cy.visit('/account');
      cy.contains('My Addresses').click();
      cy.get('[data-cy="add-address-button"]').click();
      
      // Try to save without required fields
      cy.get('[data-cy="save-address-button"]').click();
      
      // Should show validation errors
      cy.contains('Recipient name is required').should('be.visible');
    });

    it('should validate phone number format', () => {
      cy.visit('/account');
      cy.contains('My Addresses').click();
      cy.get('[data-cy="add-address-button"]').click();
      
      cy.get('[data-cy="recipient-name-input"]').type('Test User');
      cy.get('[data-cy="recipient-phone-input"]').type('invalid-phone');
      cy.get('[data-cy="full-address-input"]').type('Test Address');
      cy.get('[data-cy="save-address-button"]').click();
      
      // Should show phone validation error
      cy.contains('Please enter a valid phone number').should('be.visible');
    });

    it('should require custom label when "Other" is selected', () => {
      cy.visit('/account');
      cy.contains('My Addresses').click();
      cy.get('[data-cy="add-address-button"]').click();
      
      cy.get('[data-cy="address-label-select"]').select('Other');
      cy.get('[data-cy="recipient-name-input"]').type('Test User');
      cy.get('[data-cy="recipient-phone-input"]').type('+91 9876543210');
      cy.get('[data-cy="full-address-input"]').type('Test Address');
      cy.get('[data-cy="save-address-button"]').click();
      
      // Should show custom label validation error
      cy.contains('Custom label is required when "Other" is selected').should('be.visible');
    });
  });
});