#!/usr/bin/env node

/**
 * Comprehensive Cypress Test Runner
 * Runs all Cypress tests with detailed reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive Cypress Test Suite');
console.log('=' .repeat(60));

// Test configuration
const testConfig = {
  browsers: ['chrome', 'firefox', 'edge'],
  viewports: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 }
  ],
  specs: [
    'cypress/e2e/01-authentication.cy.js',
    'cypress/e2e/02-product-browsing.cy.js',
    'cypress/e2e/03-shopping-cart.cy.js',
    'cypress/e2e/04-checkout-process.cy.js',
    'cypress/e2e/05-admin-functionality.cy.js',
    'cypress/e2e/06-api-testing.cy.js',
    'cypress/e2e/07-accessibility-testing.cy.js',
    'cypress/e2e/08-responsive-design.cy.js',
    'cypress/e2e/09-error-handling.cy.js',
    'cypress/e2e/10-static-pages.cy.js',
    'cypress/e2e/11-footer-pages.cy.js'
  ]
};

// Results tracking
let results = {
  passed: 0,
  failed: 0,
  total: 0,
  duration: 0,
  details: []
};

function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`Command: ${command}`);
  
  const startTime = Date.now();
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${description} - Completed in ${duration}ms`);
    
    results.passed++;
    results.details.push({
      test: description,
      status: 'PASSED',
      duration: duration
    });
    
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${description} - Failed after ${duration}ms`);
    console.log(`Error: ${error.message}`);
    
    results.failed++;
    results.details.push({
      test: description,
      status: 'FAILED',
      duration: duration,
      error: error.message
    });
    
    return false;
  }
}

function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('='.repeat(60));
  
  results.total = results.passed + results.failed;
  results.duration = results.details.reduce((sum, test) => sum + test.duration, 0);
  
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log(`Total Duration: ${(results.duration / 1000).toFixed(1)} seconds`);
  
  console.log('\n📋 Detailed Results:');
  results.details.forEach((test, index) => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    const duration = (test.duration / 1000).toFixed(1);
    console.log(`${index + 1}. ${status} ${test.test} (${duration}s)`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
  
  // Save results to file
  const reportPath = path.join(__dirname, '../results/test-summary.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

// Main execution
async function runAllTests() {
  const overallStartTime = Date.now();
  
  console.log('🧪 Running Unit Tests First...');
  runCommand('npm run test', 'Unit Tests (Vitest)');
  
  console.log('\n🌐 Running E2E Tests...');
  
  // Run all E2E tests
  runCommand(
    'npx cypress run --headless --browser chrome --spec "cypress/e2e/**/*.cy.js"',
    'All E2E Tests (Chrome)'
  );
  
  // Run accessibility tests specifically
  runCommand(
    'npx cypress run --headless --browser chrome --spec "cypress/e2e/07-accessibility-testing.cy.js"',
    'Accessibility Tests'
  );
  
  // Run API tests
  runCommand(
    'npx cypress run --headless --browser chrome --spec "cypress/e2e/06-api-testing.cy.js"',
    'API Tests'
  );
  
  // Run responsive design tests
  runCommand(
    'npx cypress run --headless --browser chrome --spec "cypress/e2e/08-responsive-design.cy.js"',
    'Responsive Design Tests'
  );
  
  // Run critical user journey
  runCommand(
    'npx cypress run --headless --browser chrome --spec "cypress/e2e/01-authentication.cy.js,cypress/e2e/03-shopping-cart.cy.js,cypress/e2e/04-checkout-process.cy.js"',
    'Critical User Journey'
  );
  
  const overallDuration = Date.now() - overallStartTime;
  console.log(`\n⏱️ Total execution time: ${(overallDuration / 1000 / 60).toFixed(1)} minutes`);
  
  generateReport();
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️ Test execution interrupted');
  generateReport();
  process.exit(1);
});

// Run the tests
runAllTests().catch((error) => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});