import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    experimentalStudio: true,
    experimentalWebKitSupport: true,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      apiUrl: 'http://localhost:5173/api',
      testUser: {
        email: 'test@ramro.com',
        password: 'testpassword123',
        name: 'Test User'
      },
      adminUser: {
        email: 'admin@ramro.com',
        password: 'adminpassword123',
        name: 'Admin User'
      }
    },
    setupNodeEvents(on, config) {
      // Task for database cleanup
      on('task', {
        clearDatabase() {
          // Implementation for clearing test data
          return null;
        },
        seedDatabase() {
          // Implementation for seeding test data
          return null;
        }
      });

      // Plugin for accessibility testing
      on('file:preprocessor', require('@cypress/code-coverage/use-babelrc'));
      
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  }
});
