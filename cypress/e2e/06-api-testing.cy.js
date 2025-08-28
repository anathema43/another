describe('API Testing', () => {
  const apiUrl = Cypress.env('apiUrl');

  describe('Authentication API', () => {
    it('should authenticate user with valid credentials', () => {
      const user = Cypress.env('testUser');
      
      cy.apiRequest('POST', '/auth/login', {
        email: user.email,
        password: user.password
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
        expect(response.body).to.have.property('user');
        expect(response.body.user.email).to.eq(user.email);
      });
    });

    it('should reject invalid credentials', () => {
      cy.apiRequest('POST', '/auth/login', {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error');
      });
    });

    it('should register new user', () => {
      const timestamp = Date.now();
      const newUser = {
        name: 'API Test User',
        email: `apitest${timestamp}@ramro.com`,
        password: 'testpassword123'
      };
      
      cy.apiRequest('POST', '/auth/register', newUser).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('user');
        expect(response.body.user.email).to.eq(newUser.email);
      });
    });

    it('should validate required fields for registration', () => {
      cy.apiRequest('POST', '/auth/register', {
        email: 'test@example.com'
        // Missing name and password
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('errors');
        expect(response.body.errors).to.include.members(['name', 'password']);
      });
    });
  });

  describe('Products API', () => {
    it('should fetch all products', () => {
      cy.apiRequest('GET', '/products').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0);
        
        // Validate product structure
        const product = response.body[0];
        expect(product).to.have.all.keys(
          'id', 'name', 'description', 'price', 'image', 
          'quantityAvailable', 'category', 'rating'
        );
      });
    });

    it('should fetch single product by ID', () => {
      cy.apiRequest('GET', '/products/1').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', '1');
        expect(response.body).to.have.property('name');
        expect(response.body).to.have.property('price');
      });
    });

    it('should return 404 for non-existent product', () => {
      cy.apiRequest('GET', '/products/999999').then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'Product not found');
      });
    });

    it('should filter products by category', () => {
      cy.apiRequest('GET', '/products?category=honey').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        response.body.forEach((product) => {
          expect(product.category).to.eq('honey');
        });
      });
    });

    it('should search products by name', () => {
      cy.apiRequest('GET', '/products?search=himalayan').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        response.body.forEach((product) => {
          expect(product.name.toLowerCase()).to.include('himalayan');
        });
      });
    });

    it('should sort products by price', () => {
      cy.apiRequest('GET', '/products?sort=price&order=asc').then((response) => {
        expect(response.status).to.eq(200);
        
        const prices = response.body.map(product => product.price);
        const sortedPrices = [...prices].sort((a, b) => a - b);
        expect(prices).to.deep.equal(sortedPrices);
      });
    });
  });

  describe('Cart API', () => {
    let authToken;

    beforeEach(() => {
      const user = Cypress.env('testUser');
      cy.apiRequest('POST', '/auth/login', {
        email: user.email,
        password: user.password
      }).then((response) => {
        authToken = response.body.token;
      });
    });

    it('should add product to cart', () => {
      cy.apiRequest('POST', '/cart/add', {
        productId: '1',
        quantity: 2
      }, {
        'Authorization': `Bearer ${authToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
        expect(response.body.cart).to.be.an('array');
      });
    });

    it('should get user cart', () => {
      cy.apiRequest('GET', '/cart', null, {
        'Authorization': `Bearer ${authToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('items');
        expect(response.body).to.have.property('total');
      });
    });

    it('should update cart item quantity', () => {
      cy.apiRequest('PUT', '/cart/update', {
        productId: '1',
        quantity: 3
      }, {
        'Authorization': `Bearer ${authToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
      });
    });

    it('should remove item from cart', () => {
      cy.apiRequest('DELETE', '/cart/remove/1', null, {
        'Authorization': `Bearer ${authToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
      });
    });

    it('should clear entire cart', () => {
      cy.apiRequest('DELETE', '/cart/clear', null, {
        'Authorization': `Bearer ${authToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
      });
    });
  });

  describe('Orders API', () => {
    let authToken;

    beforeEach(() => {
      const user = Cypress.env('testUser');
      cy.apiRequest('POST', '/auth/login', {
        email: user.email,
        password: user.password
      }).then((response) => {
        authToken = response.body.token;
      });
    });

    it('should create new order', () => {
      const orderData = {
        items: [
          { productId: '1', quantity: 2, price: 299 },
          { productId: '2', quantity: 1, price: 499 }
        ],
        shipping: {
          firstName: 'Test',
          lastName: 'User',
          address: '123 Test Street',
          city: 'Mumbai',
          zipCode: '400001',
          phone: '+91 9876543210'
        },
        payment: {
          method: 'cod'
        },
        total: 1097
      };
      
      cy.apiRequest('POST', '/orders', orderData, {
        'Authorization': `Bearer ${authToken}`
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('orderId');
        expect(response.body).to.have.property('orderNumber');
        expect(response.body.total).to.eq(orderData.total);
      });
    });

    it('should get user orders', () => {
      cy.apiRequest('GET', '/orders', null, {
        'Authorization': `Bearer ${authToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        if (response.body.length > 0) {
          const order = response.body[0];
          expect(order).to.have.property('id');
          expect(order).to.have.property('orderNumber');
          expect(order).to.have.property('status');
          expect(order).to.have.property('total');
        }
      });
    });

    it('should get specific order details', () => {
      // First create an order, then fetch it
      const orderData = {
        items: [{ productId: '1', quantity: 1, price: 299 }],
        shipping: {
          firstName: 'Test',
          lastName: 'User',
          address: '123 Test Street',
          city: 'Mumbai',
          zipCode: '400001'
        },
        total: 299
      };
      
      cy.apiRequest('POST', '/orders', orderData, {
        'Authorization': `Bearer ${authToken}`
      }).then((createResponse) => {
        const orderId = createResponse.body.orderId;
        
        cy.apiRequest('GET', `/orders/${orderId}`, null, {
          'Authorization': `Bearer ${authToken}`
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.id).to.eq(orderId);
          expect(response.body).to.have.property('items');
          expect(response.body).to.have.property('shipping');
        });
      });
    });
  });

  describe('Admin API', () => {
    let adminToken;

    beforeEach(() => {
      const admin = Cypress.env('adminUser');
      cy.apiRequest('POST', '/auth/login', {
        email: admin.email,
        password: admin.password
      }).then((response) => {
        adminToken = response.body.token;
      });
    });

    it('should create new product (admin only)', () => {
      const productData = {
        name: 'API Test Product',
        description: 'Product created via API test',
        price: 599,
        category: 'spices',
        image: 'https://example.com/test-product.jpg',
        quantityAvailable: 20
      };
      
      cy.apiRequest('POST', '/admin/products', productData, {
        'Authorization': `Bearer ${adminToken}`
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body.name).to.eq(productData.name);
      });
    });

    it('should update product (admin only)', () => {
      const updateData = {
        name: 'Updated API Product',
        price: 699
      };
      
      cy.apiRequest('PUT', '/admin/products/1', updateData, {
        'Authorization': `Bearer ${adminToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
      });
    });

    it('should delete product (admin only)', () => {
      cy.apiRequest('DELETE', '/admin/products/1', null, {
        'Authorization': `Bearer ${adminToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
      });
    });

    it('should get all orders (admin only)', () => {
      cy.apiRequest('GET', '/admin/orders', null, {
        'Authorization': `Bearer ${adminToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('should update order status (admin only)', () => {
      cy.apiRequest('PUT', '/admin/orders/1/status', {
        status: 'shipped',
        trackingNumber: 'TRK123456789'
      }, {
        'Authorization': `Bearer ${adminToken}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success', true);
      });
    });

    it('should prevent non-admin access to admin endpoints', () => {
      const user = Cypress.env('testUser');
      cy.apiRequest('POST', '/auth/login', {
        email: user.email,
        password: user.password
      }).then((loginResponse) => {
        const userToken = loginResponse.body.token;
        
        cy.apiRequest('GET', '/admin/orders', null, {
          'Authorization': `Bearer ${userToken}`
        }).then((response) => {
          expect(response.status).to.eq(403);
          expect(response.body).to.have.property('error', 'Insufficient permissions');
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON requests', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error');
      });
    });

    it('should handle missing authentication token', () => {
      cy.apiRequest('GET', '/cart').then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error', 'Authentication required');
      });
    });

    it('should handle invalid authentication token', () => {
      cy.apiRequest('GET', '/cart', null, {
        'Authorization': 'Bearer invalid-token'
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error', 'Invalid token');
      });
    });

    it('should handle rate limiting', () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array.from({ length: 100 }, () => 
        cy.apiRequest('GET', '/products')
      );
      
      Promise.all(requests).then((responses) => {
        const rateLimitedResponse = responses.find(r => r.status === 429);
        if (rateLimitedResponse) {
          expect(rateLimitedResponse.body).to.have.property('error', 'Rate limit exceeded');
        }
      });
    });
  });

  describe('Performance Testing', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.apiRequest('GET', '/products').then((response) => {
        const responseTime = Date.now() - startTime;
        
        expect(response.status).to.eq(200);
        expect(responseTime).to.be.lessThan(2000); // 2 seconds max
      });
    });

    it('should handle concurrent requests', () => {
      const concurrentRequests = Array.from({ length: 10 }, () => 
        cy.apiRequest('GET', '/products')
      );
      
      Promise.all(concurrentRequests).then((responses) => {
        responses.forEach((response) => {
          expect(response.status).to.eq(200);
        });
      });
    });
  });
});