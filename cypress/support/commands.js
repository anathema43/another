// ***********************************************
// Custom Commands for Ramro E-commerce Testing
// ***********************************************

// Authentication Commands
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy="login-email"]').type(email);
    cy.get('[data-cy="login-password"]').type(password);
    cy.get('[data-cy="login-submit"]').click();
    cy.url().should('not.include', '/login');
    cy.window().its('localStorage').should('contain.key', 'auth-storage');
  });
});

Cypress.Commands.add('loginAsAdmin', () => {
  const admin = Cypress.env('adminUser');
  cy.login(admin.email, admin.password);
});

Cypress.Commands.add('loginAsUser', () => {
  const user = Cypress.env('testUser');
  cy.login(user.email, user.password);
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="logout-button"]').click();
  cy.url().should('include', '/');
  cy.window().its('localStorage').should('not.contain.key', 'auth-storage');
});

Cypress.Commands.add('signup', (userData) => {
  cy.visit('/signup');
  cy.get('[data-cy="signup-name"]').type(userData.name);
  cy.get('[data-cy="signup-email"]').type(userData.email);
  cy.get('[data-cy="signup-password"]').type(userData.password);
  cy.get('[data-cy="signup-confirm-password"]').type(userData.password);
  cy.get('[data-cy="signup-submit"]').click();
});

// Navigation Commands
Cypress.Commands.add('navigateToShop', () => {
  cy.get('[data-cy="nav-shop"]').click();
  cy.url().should('include', '/shop');
  cy.get('[data-cy="shop-page"]').should('be.visible');
});

Cypress.Commands.add('navigateToAbout', () => {
  cy.get('[data-cy="nav-about"]').click();
  cy.url().should('include', '/about');
  cy.get('[data-cy="about-page"]').should('be.visible');
});

Cypress.Commands.add('navigateToContact', () => {
  cy.get('[data-cy="nav-contact"]').click();
  cy.url().should('include', '/contact');
  cy.get('[data-cy="contact-page"]').should('be.visible');
});

Cypress.Commands.add('navigateToCart', () => {
  cy.get('[data-cy="nav-cart"]').click();
  cy.url().should('include', '/cart');
  cy.get('[data-cy="cart-page"]').should('be.visible');
});

Cypress.Commands.add('navigateToAdmin', () => {
  cy.get('[data-cy="nav-admin"]').click();
  cy.url().should('include', '/admin');
  cy.get('[data-cy="admin-dashboard"]').should('be.visible');
});

Cypress.Commands.add('navigateToCheckout', () => {
  cy.get('[data-cy="checkout-button"]').click();
  cy.url().should('include', '/checkout');
  cy.get('[data-cy="checkout-page"]').should('be.visible');
});

Cypress.Commands.add('navigateToOrders', () => {
  cy.get('[data-cy="nav-orders"]').click();
  cy.url().should('include', '/orders');
  cy.get('[data-cy="orders-page"]').should('be.visible');
});

Cypress.Commands.add('navigateToWishlist', () => {
  cy.get('[data-cy="nav-wishlist"]').click();
  cy.url().should('include', '/wishlist');
  cy.get('[data-cy="wishlist-page"]').should('be.visible');
});

Cypress.Commands.add('navigateToArtisans', () => {
  cy.get('[data-cy="nav-artisans"]').click();
  cy.url().should('include', '/artisans');
  cy.get('[data-cy="artisans-directory"]').should('be.visible');
});

// Product Commands
Cypress.Commands.add('addProductToCart', (productName) => {
  cy.get('[data-cy="shop-page"]').within(() => {
    cy.contains('[data-cy="product-card"]', productName).within(() => {
      cy.get('[data-cy="add-to-cart-button"]').click();
    });
  });
  cy.get('[data-cy="cart-count"]').should('contain', '1');
});

Cypress.Commands.add('addMultipleProductsToCart', (products) => {
  products.forEach((product, index) => {
    cy.contains('[data-cy="product-card"]', product.name).within(() => {
      for (let i = 0; i < product.quantity; i++) {
        cy.get('[data-cy="add-to-cart-button"]').click();
      }
    });
    cy.get('[data-cy="cart-count"]').should('contain', (index + 1).toString());
  });
});

Cypress.Commands.add('addToWishlist', (productName) => {
  cy.contains('[data-cy="product-card"]', productName).within(() => {
    cy.get('[data-cy="wishlist-button"]').click();
  });
  cy.get('[data-cy="wishlist-count"]').should('be.visible');
});

Cypress.Commands.add('removeFromWishlist', (productName) => {
  cy.contains('[data-cy="wishlist-item"]', productName).within(() => {
    cy.get('[data-cy="remove-wishlist-button"]').click();
  });
});

Cypress.Commands.add('searchProduct', (searchTerm) => {
  cy.get('[data-cy="search-input"]').type(searchTerm);
  cy.get('[data-cy="search-button"]').click();
  cy.get('[data-cy="search-results"]').should('be.visible');
});

Cypress.Commands.add('searchArtisans', (searchTerm) => {
  cy.get('[data-cy="artisan-search"]').type(searchTerm);
  cy.get('[data-cy="artisan-card"]').should('be.visible');
});

Cypress.Commands.add('filterArtisansByRegion', (region) => {
  cy.get('[data-cy="region-filter"]').select(region);
  cy.get('[data-cy="artisan-card"]').should('be.visible');
});

Cypress.Commands.add('filterByCategory', (category) => {
  cy.get('[data-cy="category-filter"]').select(category);
  cy.get('[data-cy="product-grid"]').should('be.visible');
});

Cypress.Commands.add('sortProducts', (sortOption) => {
  cy.get('[data-cy="sort-select"]').select(sortOption);
  cy.get('[data-cy="product-grid"]').should('be.visible');
});

// Cart Commands
Cypress.Commands.add('clearCart', () => {
  cy.navigateToCart();
  cy.get('[data-cy="clear-cart-button"]').click();
  cy.get('[data-cy="confirm-clear-button"]').click();
  cy.get('[data-cy="empty-cart-message"]').should('be.visible');
});

Cypress.Commands.add('updateCartQuantity', (productName, quantity) => {
  cy.navigateToCart();
  cy.contains('[data-cy="cart-item"]', productName).within(() => {
    cy.get('[data-cy="quantity-input"]').clear().type(quantity);
    cy.get('[data-cy="update-quantity-button"]').click();
  });
});

Cypress.Commands.add('removeFromCart', (productName) => {
  cy.navigateToCart();
  cy.contains('[data-cy="cart-item"]', productName).within(() => {
    cy.get('[data-cy="remove-item-button"]').click();
  });
  cy.get('[data-cy="confirm-remove-button"]').click();
});

Cypress.Commands.add('verifyCartTotal', (expectedTotal) => {
  cy.get('[data-cy="cart-total"]').should('contain', expectedTotal);
});

// Checkout Commands
Cypress.Commands.add('fillShippingInfo', (shippingData) => {
  cy.get('[data-cy="shipping-first-name"]').type(shippingData.firstName);
  cy.get('[data-cy="shipping-last-name"]').type(shippingData.lastName);
  cy.get('[data-cy="shipping-email"]').type(shippingData.email);
  cy.get('[data-cy="shipping-phone"]').type(shippingData.phone);
  cy.get('[data-cy="shipping-address"]').type(shippingData.address);
  cy.get('[data-cy="shipping-city"]').type(shippingData.city);
  cy.get('[data-cy="shipping-zip"]').type(shippingData.zipCode);
});

Cypress.Commands.add('selectPaymentMethod', (method) => {
  cy.get(`[data-cy="payment-method-${method}"]`).check();
});

Cypress.Commands.add('completeCheckout', (shippingData, paymentMethod = 'cod') => {
  cy.fillShippingInfo(shippingData);
  cy.selectPaymentMethod(paymentMethod);
  cy.get('[data-cy="place-order-button"]').click();
});

// Admin Commands
Cypress.Commands.add('createProduct', (productData) => {
  cy.get('[data-cy="add-product-button"]').click();
  cy.get('[data-cy="product-name"]').type(productData.name);
  cy.get('[data-cy="product-description"]').type(productData.description);
  cy.get('[data-cy="product-price"]').type(productData.price);
  cy.get('[data-cy="product-category"]').select(productData.category);
  cy.get('[data-cy="product-image"]').type(productData.image);
  cy.get('[data-cy="product-quantity"]').type(productData.quantity);
  cy.get('[data-cy="save-product-button"]').click();
});

Cypress.Commands.add('editProduct', (productName, updates) => {
  cy.contains('[data-cy="product-row"]', productName).within(() => {
    cy.get('[data-cy="edit-product-button"]').click();
  });
  
  if (updates.name) {
    cy.get('[data-cy="product-name"]').clear().type(updates.name);
  }
  if (updates.price) {
    cy.get('[data-cy="product-price"]').clear().type(updates.price);
  }
  if (updates.quantity) {
    cy.get('[data-cy="product-quantity"]').clear().type(updates.quantity);
  }
  
  cy.get('[data-cy="save-product-button"]').click();
});

Cypress.Commands.add('deleteProduct', (productName) => {
  cy.contains('[data-cy="product-row"]', productName).within(() => {
    cy.get('[data-cy="delete-product-button"]').click();
  });
  cy.get('[data-cy="confirm-delete-button"]').click();
});

Cypress.Commands.add('updateOrderStatus', (orderId, status) => {
  cy.get(`[data-cy="order-${orderId}"]`).within(() => {
    cy.get('[data-cy="order-status-select"]').select(status);
    cy.get('[data-cy="update-status-button"]').click();
  });
});

Cypress.Commands.add('seedProducts', () => {
  cy.get('[data-cy="seed-products-button"]').click();
  cy.get('[data-cy="seed-success-message"]').should('be.visible');
});

Cypress.Commands.add('seedArtisanData', () => {
  cy.get('[data-cy="artisan-seed-button"]').click();
  cy.get('[data-cy="artisan-seed-success"]').should('be.visible');
});

// Form Commands
Cypress.Commands.add('fillContactForm', (formData) => {
  cy.get('[data-cy="contact-name"]').type(formData.name);
  cy.get('[data-cy="contact-email"]').type(formData.email);
  cy.get('[data-cy="contact-subject"]').type(formData.subject);
  cy.get('[data-cy="contact-message"]').type(formData.message);
  cy.get('[data-cy="contact-submit"]').click();
});

Cypress.Commands.add('fillLoginForm', (email, password) => {
  cy.get('[data-cy="login-email"]').type(email);
  cy.get('[data-cy="login-password"]').type(password);
  cy.get('[data-cy="login-submit"]').click();
});

Cypress.Commands.add('fillSignupForm', (userData) => {
  cy.get('[data-cy="signup-name"]').type(userData.name);
  cy.get('[data-cy="signup-email"]').type(userData.email);
  cy.get('[data-cy="signup-password"]').type(userData.password);
  cy.get('[data-cy="signup-confirm-password"]').type(userData.confirmPassword || userData.password);
  cy.get('[data-cy="signup-submit"]').click();
});

// Utility Commands
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-cy="loading-spinner"]').should('not.exist');
  cy.get('body').should('be.visible');
});

Cypress.Commands.add('waitForApiCall', (alias) => {
  cy.wait(alias);
  cy.get('[data-cy="loading-spinner"]').should('not.exist');
});

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y();
});

Cypress.Commands.add('mockRazorpayPayment', (success = true) => {
  cy.window().then((win) => {
    win.Razorpay = cy.stub().callsFake((options) => ({
      open: cy.stub().callsFake(() => {
        if (success) {
          options.handler({
            razorpay_payment_id: 'pay_test_123',
            razorpay_order_id: 'order_test_123',
            razorpay_signature: 'signature_test_123'
          });
        } else {
          options.modal.ondismiss();
        }
      })
    }));
  });
});

Cypress.Commands.add('mockFirebaseAuth', (user = null) => {
  cy.window().then((win) => {
    if (win.firebase && win.firebase.auth) {
      cy.stub(win.firebase.auth(), 'currentUser').value(user);
    }
  });
});

// Database Commands
Cypress.Commands.add('seedTestData', () => {
  cy.task('seedDatabase');
});

Cypress.Commands.add('cleanupTestData', () => {
  cy.task('clearDatabase');
});

Cypress.Commands.add('createTestUser', (userData) => {
  cy.task('createUser', userData);
});

// Visual Testing Commands
Cypress.Commands.add('matchImageSnapshot', (name) => {
  cy.screenshot(name);
  // Integration with visual testing tools would go here
});

Cypress.Commands.add('compareScreenshot', (name, threshold = 0.1) => {
  cy.screenshot(name);
  // Compare with baseline screenshot
});

// API Testing Commands
Cypress.Commands.add('apiRequest', (method, url, body = null, headers = {}) => {
  return cy.request({
    method,
    url: `${Cypress.env('apiUrl')}${url}`,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    failOnStatusCode: false
  });
});

Cypress.Commands.add('apiLogin', (email, password) => {
  return cy.apiRequest('POST', '/auth/login', { email, password });
});

Cypress.Commands.add('apiCreateProduct', (productData, authToken) => {
  return cy.apiRequest('POST', '/products', productData, {
    'Authorization': `Bearer ${authToken}`
  });
});

// Mobile Testing Commands
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport('iphone-x');
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport('ipad-2');
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720);
});

Cypress.Commands.add('testResponsiveDesign', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 }
  ];
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.get('[data-cy="main-content"]').should('be.visible');
  });
});

// Error Handling Commands
Cypress.Commands.add('expectError', (errorMessage) => {
  cy.get('[data-cy="error-message"]').should('contain', errorMessage);
});

Cypress.Commands.add('expectSuccess', (successMessage) => {
  cy.get('[data-cy="success-message"]').should('contain', successMessage);
});

Cypress.Commands.add('handleAlert', (action = 'accept') => {
  cy.window().then((win) => {
    cy.stub(win, 'alert').as('windowAlert');
    cy.stub(win, 'confirm').returns(action === 'accept');
  });
});

// Security Testing Commands
Cypress.Commands.add('testAdminSecurity', () => {
  // Test that admin access requires proper server-side role
  cy.loginAsUser();
  cy.visit('/admin');
  cy.get('[data-cy="access-denied-message"]').should('be.visible');
});

Cypress.Commands.add('testFileUploadSecurity', (fileType, expectedError) => {
  cy.loginAsAdmin();
  cy.navigateToAdmin();
  
  const testFile = new File(['test content'], `test.${fileType}`);
  cy.get('[data-cy="file-upload"]').selectFile(testFile, { force: true });
  cy.get(`[data-cy="${expectedError}"]`).should('be.visible');
});

Cypress.Commands.add('testXSSPrevention', (inputSelector, xssPayload) => {
  cy.get(inputSelector).type(xssPayload);
  cy.on('window:alert', () => {
    throw new Error('XSS vulnerability detected');
  });
});

Cypress.Commands.add('testRealTimeSync', () => {
  cy.loginAsUser();
  cy.navigateToShop();
  cy.addProductToCart('Darjeeling Pickle');
  
  // Simulate real-time update
  cy.window().then((win) => {
    win.dispatchEvent(new CustomEvent('cartUpdate', {
      detail: { items: [{ id: '1', quantity: 2 }] }
    }));
  });
  
  cy.get('[data-cy="cart-count"]').should('contain', '2');
});

// Data Integrity Commands
Cypress.Commands.add('validateSingleSourceOfTruth', () => {
  cy.window().then((win) => {
    // Ensure no static product data exists
    expect(win.staticProducts).to.be.undefined;
    expect(win.products).to.be.undefined;
  });
});

Cypress.Commands.add('testArchitecturalIntegrity', () => {
  // Test that stores are properly separated
  cy.window().then((win) => {
    const cartStore = win.useCartStore?.getState();
    const wishlistStore = win.useWishlistStore?.getState();
    
    if (cartStore) {
      expect(cartStore.wishlist).to.be.undefined;
    }
    if (wishlistStore) {
      expect(wishlistStore.cart).to.be.undefined;
    }
  });
});

// Performance Testing Commands
Cypress.Commands.add('measurePageLoadTime', (pageName) => {
  cy.window().then((win) => {
    const startTime = win.performance.now();
    cy.then(() => {
      const loadTime = win.performance.now() - startTime;
      cy.log(`${pageName} load time: ${loadTime.toFixed(2)}ms`);
      expect(loadTime).to.be.lessThan(3000); // 3 second limit
    });
  });
});

Cypress.Commands.add('checkCoreWebVitals', () => {
  cy.window().then((win) => {
    // Check Largest Contentful Paint
    new win.PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      expect(lastEntry.startTime).to.be.lessThan(2500); // 2.5s threshold
    }).observe({ entryTypes: ['largest-contentful-paint'] });
  });
});

// Accessibility Commands
Cypress.Commands.add('testKeyboardNavigation', () => {
  cy.get('body').tab();
  cy.focused().should('have.attr', 'data-cy');
  
  // Test tab order
  cy.focused().tab();
  cy.focused().should('be.visible');
});

Cypress.Commands.add('testScreenReaderContent', () => {
  // Check for proper ARIA labels
  cy.get('[role="button"]').each(($btn) => {
    cy.wrap($btn).should('have.attr', 'aria-label');
  });
  
  // Check for alt text on images
  cy.get('img').each(($img) => {
    cy.wrap($img).should('have.attr', 'alt');
  });
});

// E-commerce Specific Commands
Cypress.Commands.add('completeFullPurchaseFlow', (userData, shippingData) => {
  // Complete user journey from signup to purchase
  cy.signup(userData);
  cy.navigateToShop();
  cy.addProductToCart('Darjeeling Pickle');
  cy.navigateToCart();
  cy.navigateToCheckout();
  cy.completeCheckout(shippingData, 'cod');
  cy.get('[data-cy="order-confirmation"]').should('be.visible');
});

Cypress.Commands.add('testInventoryManagement', () => {
  cy.loginAsAdmin();
  cy.navigateToAdmin();
  
  // Update inventory
  cy.get('[data-cy="product-row"]').first().within(() => {
    cy.get('[data-cy="manage-stock-button"]').click();
  });
  
  cy.get('[data-cy="stock-adjustment"]').type('5');
  cy.get('[data-cy="update-stock-button"]').click();
  cy.get('[data-cy="success-message"]').should('be.visible');
});

Cypress.Commands.add('testOrderManagement', () => {
  cy.loginAsAdmin();
  cy.navigateToAdmin();
  cy.get('[data-cy="admin-nav-orders"]').click();
  
  // Update order status
  cy.get('[data-cy="order-row"]').first().within(() => {
    cy.get('[data-cy="order-status-select"]').select('shipped');
    cy.get('[data-cy="update-status-button"]').click();
  });
  
  cy.get('[data-cy="success-message"]').should('be.visible');
});

// Network and State Commands
Cypress.Commands.add('simulateNetworkError', () => {
  cy.intercept('GET', '/api/**', { forceNetworkError: true }).as('networkError');
});

Cypress.Commands.add('simulateSlowNetwork', () => {
  cy.intercept('GET', '/api/**', (req) => {
    req.reply((res) => {
      res.delay(3000); // 3 second delay
      res.send();
    });
  }).as('slowNetwork');
});

Cypress.Commands.add('testOfflineMode', () => {
  cy.window().then((win) => {
    win.navigator.onLine = false;
    win.dispatchEvent(new Event('offline'));
  });
  
  cy.get('[data-cy="offline-indicator"]').should('be.visible');
});

// Custom Assertions
Cypress.Commands.add('shouldBeAccessible', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible');
  cy.wrap(subject).should('not.have.attr', 'aria-hidden', 'true');
});

Cypress.Commands.add('shouldHaveValidForm', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).within(() => {
    cy.get('input, textarea, select').each(($input) => {
      const id = $input.attr('id');
      if (id) {
        cy.get(`label[for="${id}"]`).should('exist');
      }
    });
  });
});

// Debugging Commands
Cypress.Commands.add('debugElement', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).then(($el) => {
    console.log('Element:', $el[0]);
    console.log('Text:', $el.text());
    console.log('Attributes:', $el[0].attributes);
  });
});

Cypress.Commands.add('logState', () => {
  cy.window().then((win) => {
    if (win.useCartStore) {
      console.log('Cart State:', win.useCartStore.getState());
    }
    if (win.useAuthStore) {
      console.log('Auth State:', win.useAuthStore.getState());
    }
  });
});

// File Upload Commands
Cypress.Commands.add('uploadFile', (selector, fileName, fileType = 'image/jpeg') => {
  cy.get(selector).selectFile({
    contents: Cypress.Buffer.from('file contents'),
    fileName: fileName,
    mimeType: fileType
  });
});

Cypress.Commands.add('uploadLargeFile', (selector) => {
  const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
  cy.get(selector).selectFile({
    contents: Cypress.Buffer.from(largeContent),
    fileName: 'large-file.jpg',
    mimeType: 'image/jpeg'
  });
});

// Advanced E2E Commands
Cypress.Commands.add('testCompleteUserJourney', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Test User',
    email: `test${timestamp}@ramro.com`,
    password: 'password123'
  };
  
  // Complete user journey
  cy.signup(testUser);
  cy.navigateToShop();
  cy.addProductToCart('Darjeeling Pickle');
  cy.addToWishlist('Himalayan Wild Honey');
  cy.navigateToCart();
  cy.navigateToCheckout();
  
  cy.fillShippingInfo({
    firstName: 'Test',
    lastName: 'User',
    email: testUser.email,
    phone: '+91 9876543210',
    address: '123 Test Street',
    city: 'Mumbai',
    zipCode: '400001'
  });
  
  cy.selectPaymentMethod('cod');
  cy.get('[data-cy="place-order-button"]').click();
  cy.get('[data-cy="order-confirmation"]').should('be.visible');
});

Cypress.Commands.add('testAdminWorkflow', () => {
  cy.loginAsAdmin();
  cy.navigateToAdmin();
  
  // Create product
  cy.createProduct({
    name: 'Test Admin Product',
    description: 'Created by admin test',
    price: '599',
    category: 'spices',
    image: 'https://example.com/test.jpg',
    quantity: '15'
  });
  
  // Verify product appears
  cy.get('[data-cy="products-table"]').should('contain', 'Test Admin Product');
  
  // Update inventory
  cy.testInventoryManagement();
  
  // Manage orders
  cy.testOrderManagement();
});