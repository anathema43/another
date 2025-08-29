// Cypress E2E support file

import './commands';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // that are expected in demo mode
  if (err.message.includes('Firebase') || 
      err.message.includes('not configured') ||
      err.message.includes('Network Error')) {
    return false;
  }
  
  // Let other errors fail the test
  return true;
});

// Global before hook
beforeEach(() => {
  // Clear localStorage and sessionStorage before each test
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Set up viewport
  cy.viewport(1280, 720);
  
  // Intercept and handle Firebase calls gracefully
  cy.intercept('**firebase**', { statusCode: 200, body: {} }).as('firebaseCall');
  
  // Mock console.error to track errors
  cy.window().then((win) => {
    cy.stub(win.console, 'error').as('consoleError');
  });
});

// Global after hook
afterEach(() => {
  // Check for console errors (optional)
  cy.get('@consoleError').should('not.have.been.called');
});

// Custom assertions
Cypress.Commands.add('shouldNotHaveConsoleErrors', () => {
  cy.window().then((win) => {
    const errors = win.console.error.getCalls?.() || [];
    expect(errors.length).to.equal(0);
  });
});

// Performance testing utilities
Cypress.Commands.add('measurePageLoad', (pageName) => {
  cy.window().then((win) => {
    const navigation = win.performance.getEntriesByType('navigation')[0];
    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    
    cy.log(`${pageName} load time: ${loadTime}ms`);
    expect(loadTime).to.be.lessThan(5000); // 5 second budget
  });
});

// Accessibility testing utilities
Cypress.Commands.add('checkA11y', () => {
  // Basic accessibility checks
  cy.get('img').each($img => {
    expect($img).to.have.attr('alt');
  });
  
  cy.get('button').each($btn => {
    expect($btn).to.be.visible;
  });
});