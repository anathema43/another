#!/usr/bin/env node

/**
 * Parallel Cypress Test Runner
 * Runs tests in parallel for faster execution
 */

const { spawn } = require('child_process');
const path = require('path');

const testGroups = [
  {
    name: 'Authentication & User Management',
    specs: [
      'cypress/e2e/01-authentication.cy.js'
    ]
  },
  {
    name: 'Product & Shopping',
    specs: [
      'cypress/e2e/02-product-browsing.cy.js',
      'cypress/e2e/03-shopping-cart.cy.js'
    ]
  },
  {
    name: 'Checkout & Payments',
    specs: [
      'cypress/e2e/04-checkout-process.cy.js'
    ]
  },
  {
    name: 'Admin Functionality',
    specs: [
      'cypress/e2e/05-admin-functionality.cy.js'
    ]
  },
  {
    name: 'API & Technical',
    specs: [
      'cypress/e2e/06-api-testing.cy.js',
      'cypress/e2e/09-error-handling.cy.js'
    ]
  },
  {
    name: 'Accessibility & Responsive',
    specs: [
      'cypress/e2e/07-accessibility-testing.cy.js',
      'cypress/e2e/08-responsive-design.cy.js'
    ]
  }
];

function runTestGroup(group, index) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting Group ${index + 1}: ${group.name}`);
    
    const specList = group.specs.join(',');
    const command = 'npx';
    const args = [
      'cypress', 'run',
      '--headless',
      '--browser', 'chrome',
      '--spec', specList,
      '--reporter', 'json',
      '--reporter-options', `output=cypress/results/group-${index + 1}-results.json`
    ];
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Group ${index + 1} completed successfully`);
        resolve({ group: group.name, status: 'success', code });
      } else {
        console.log(`❌ Group ${index + 1} failed with code ${code}`);
        resolve({ group: group.name, status: 'failed', code });
      }
    });
    
    child.on('error', (error) => {
      console.error(`❌ Group ${index + 1} error:`, error);
      reject({ group: group.name, status: 'error', error });
    });
  });
}

async function runParallelTests() {
  console.log('🏃‍♂️ Running Cypress Tests in Parallel');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  
  try {
    // Run all groups in parallel
    const promises = testGroups.map((group, index) => runTestGroup(group, index));
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n📊 PARALLEL EXECUTION SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Total Duration: ${duration.toFixed(1)} seconds`);
    console.log(`Groups Executed: ${results.length}`);
    
    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    console.log(`Successful: ${successful} ✅`);
    console.log(`Failed: ${failed} ❌`);
    
    results.forEach((result, index) => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.group}`);
    });
    
    if (failed > 0) {
      console.log('\n⚠️ Some test groups failed. Check individual results for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 All test groups passed successfully!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Parallel execution failed:', error);
    process.exit(1);
  }
}

runParallelTests();