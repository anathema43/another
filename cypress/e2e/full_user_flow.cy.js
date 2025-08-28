describe('Ramro E-Commerce: Full User Journey', () => {
  const user = {
    name: "Test User",
    email: `ramro_test_${Date.now()}@mail.com`,
    password: "passw0rd!"
  };

  it('Sign up, Login, Add to Cart, Checkout, Wishlist, Logout', () => {
    // --- SIGNUP ---
    cy.visit('/#/signup');
    cy.get('input#name').type(user.name);
    cy.get('input#email').type(user.email);
    cy.get('input#password').type(user.password);
    cy.get('button[type="submit"]').contains(/sign ?up/i).click();

    cy.url().should('include', '/');
    cy.contains(user.name);

    // --- LOGOUT ---
    cy.get('button').contains(/logout/i).click();
    cy.url().should('include', '/login');

    // --- LOGIN ---
    cy.get('input#email').type(user.email);
    cy.get('input#password').type(user.password);
    cy.get('button[type="submit"]').contains(/login/i).click();

    cy.url().should('include', '/');
    cy.contains(user.name);

    // --- ADD TO CART ---
    cy.visit('/#/products');
    cy.contains('Darjeeling Pickle').parents('.bg-white').find('button').contains(/add to cart/i).click();
    cy.get('a[href="#/cart"]').click();
    cy.contains('Darjeeling Pickle');
    cy.contains('Total');
    
    // --- CHECKOUT ---
    cy.get('button').contains(/checkout/i).click();
    cy.url().should('include', '/checkout');
    cy.get('input[placeholder="Shipping Address"]').type("Test Address, Kathmandu");
    cy.get('button').contains(/place order/i).click();
    cy.contains(/thank you/i);

    // --- WISHLIST ---
    cy.visit('/#/products');
    cy.contains('Himalayan Honey').parents('.bg-white').find('button').contains(/wishlist/i).click();
    cy.get('a[href="#/wishlist"]').click();
    cy.contains('Himalayan Honey');

    // --- ACCOUNT ---
    cy.get('a[href="#/account"]').click();
    cy.contains(user.name);
    cy.contains('My Orders');

    // --- LOGOUT ---
    cy.get('button').contains(/logout/i).click();
    cy.url().should('include', '/login');
  });

  it('Admin Panel: Add/Edit/Delete Product', () => {
    // --- ADMIN LOGIN (Assume admin credentials) ---
    const admin = { email: "admin@ramro.com", password: "adminpass" };
    cy.visit('/#/login');
    cy.get('input#email').type(admin.email);
    cy.get('input#password').type(admin.password);
    cy.get('button[type="submit"]').contains(/login/i).click();

    // --- NAVIGATE TO ADMIN PAGE ---
    cy.visit('/#/admin');
    cy.contains('Admin Panel');

    // --- ADD PRODUCT ---
    cy.get('button').contains(/add product/i).click();
    cy.get('input[placeholder="Product Name"]').type("Test Product");
    cy.get('input[placeholder="Price"]').type("123");
    cy.get('input[placeholder="Quantity"]').type("5");
    cy.get('input[placeholder="Image URL"]').type("https://placehold.co/300");
    cy.get('button').contains(/save/i).click();
    cy.contains('Test Product');

    // --- EDIT PRODUCT ---
    cy.contains('Test Product').parents('.bg-white').find('button').contains(/edit/i).click();
    cy.get('input[placeholder="Product Name"]').clear().type("Test Product Edited");
    cy.get('button').contains(/save/i).click();
    cy.contains('Test Product Edited');

    // --- DELETE PRODUCT ---
    cy.contains('Test Product Edited').parents('.bg-white').find('button').contains(/delete/i).click();
    cy.contains('Test Product Edited').should('not.exist');

    // --- LOGOUT ---
    cy.get('button').contains(/logout/i).click();
    cy.url().should('include', '/login');
  });
});
