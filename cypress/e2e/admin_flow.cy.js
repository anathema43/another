// cypress/e2e/admin_flow.cy.js

describe('Ramro Admin Flow', () => {
  const adminEmail = "admin@example.com";  // must exist with admin privileges
  const adminPassword = "adminpass";

  before(() => {
    cy.visit('/#/login');
    cy.get('input#email').type(adminEmail);
    cy.get('input#password').type(adminPassword);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/products');
    cy.visit('/#/admin');
  });

  it('should add a product', () => {
    cy.contains('button', 'Add Product').click();
    cy.get('input[placeholder="Product Name"]').type('Test Product');
    cy.get('textarea[placeholder="Description"]').type('This is a test product');
    cy.get('input[placeholder="Price"]').type('123');
    cy.get('input[placeholder="Image URL"]').type('https://via.placeholder.com/200');
    cy.get('input[placeholder="Quantity"]').type('5');
    cy.contains('button', 'Save').click();
    cy.contains('Test Product').should('exist');
  });

  it('should edit a product', () => {
    cy.contains('Test Product').parents('.product-row').find('button[aria-label="Edit"]').click();
    cy.get('input[placeholder="Product Name"]').clear().type('Updated Product');
    cy.contains('button', 'Save').click();
    cy.contains('Updated Product').should('exist');
  });

  it('should delete a product', () => {
    cy.contains('Updated Product').parents('.product-row').find('button[aria-label="Delete"]').click();
    cy.contains('Updated Product').should('not.exist');
  });

  it('should view and update order status', () => {
    cy.visit('/#/admin'); // Reload admin
    cy.contains('Orders').click();
    cy.get('.order-row').first().within(() => {
      cy.contains('button', 'Update Status').click();
      cy.get('select').select('Shipped');
      cy.contains('button', 'Save').click();
      cy.contains('Shipped').should('exist');
    });
  });
});
