// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Import third-party commands
import 'cypress-axe'
import '@cypress/code-coverage/support'

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // that are expected in the application
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});

// Before each test
beforeEach(() => {
  // Clear local storage and cookies
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Set up interceptors for common API calls
  cy.intercept('GET', '/api/products*', { fixture: 'products.json' }).as('getProducts');
  cy.intercept('POST', '/api/orders*', { fixture: 'order-success.json' }).as('createOrder');
  cy.intercept('POST', '/api/auth/login*', { fixture: 'auth-success.json' }).as('login');
});

// After each test
afterEach(() => {
  // Clean up test data if needed
  cy.window().then((win) => {
    if (win.localStorage.getItem('test-mode')) {
      cy.cleanupTestData();
    }
  });
});