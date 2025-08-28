// ***********************************************************
// Component Testing Support File
// ***********************************************************

import './commands'
import { mount } from 'cypress/react18'

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)

// Example command for mounting with providers
Cypress.Commands.add('mountWithProviders', (component, options = {}) => {
  const { providers = [], ...mountOptions } = options;
  
  const wrapped = providers.reduce((acc, Provider) => {
    return <Provider>{acc}</Provider>;
  }, component);
  
  return cy.mount(wrapped, mountOptions);
});