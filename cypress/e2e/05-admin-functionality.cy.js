describe('Admin Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
    cy.loginAsAdmin();
  });

  describe('Admin Dashboard Access', () => {
    it('should allow admin access to dashboard', () => {
      cy.navigateToAdmin();
      
      cy.get('[data-cy="admin-dashboard"]').should('be.visible');
      cy.get('[data-cy="dashboard-stats"]').should('be.visible');
      cy.get('[data-cy="recent-orders"]').should('be.visible');
      cy.get('[data-cy="low-stock-alerts"]').should('be.visible');
    });

    it('should display admin navigation menu', () => {
      cy.navigateToAdmin();
      
      cy.get('[data-cy="admin-nav-products"]').should('be.visible');
      cy.get('[data-cy="admin-nav-orders"]').should('be.visible');
      cy.get('[data-cy="admin-nav-users"]').should('be.visible');
      cy.get('[data-cy="admin-nav-analytics"]').should('be.visible');
    });

    it('should show dashboard statistics', () => {
      cy.navigateToAdmin();
      
      cy.get('[data-cy="total-products-stat"]').should('be.visible');
      cy.get('[data-cy="total-orders-stat"]').should('be.visible');
      cy.get('[data-cy="total-revenue-stat"]').should('be.visible');
      cy.get('[data-cy="active-users-stat"]').should('be.visible');
    });
  });

  describe('Product Management', () => {
    beforeEach(() => {
      cy.navigateToAdmin();
      cy.get('[data-cy="admin-nav-products"]').click();
    });

    it('should display products list', () => {
      cy.get('[data-cy="products-table"]').should('be.visible');
      cy.get('[data-cy="product-row"]').should('have.length.greaterThan', 0);
      
      cy.get('[data-cy="product-row"]').first().within(() => {
        cy.get('[data-cy="product-name"]').should('be.visible');
        cy.get('[data-cy="product-price"]').should('be.visible');
        cy.get('[data-cy="product-stock"]').should('be.visible');
        cy.get('[data-cy="product-actions"]').should('be.visible');
      });
    });

    it('should create new product', () => {
      const newProduct = {
        name: 'Test Himalayan Product',
        description: 'A test product for automation',
        price: '399',
        category: 'spices',
        image: 'https://example.com/test-product.jpg',
        quantity: '25'
      };
      
      cy.createProduct(newProduct);
      
      cy.get('[data-cy="success-message"]').should('contain', 'Product created successfully');
      cy.get('[data-cy="products-table"]').should('contain', newProduct.name);
    });

    it('should edit existing product', () => {
      cy.get('[data-cy="product-row"]').first().within(() => {
        cy.get('[data-cy="edit-product-button"]').click();
      });
      
      cy.get('[data-cy="product-form"]').should('be.visible');
      cy.get('[data-cy="product-name"]').clear().type('Updated Product Name');
      cy.get('[data-cy="save-product-button"]').click();
      
      cy.get('[data-cy="success-message"]').should('contain', 'Product updated successfully');
      cy.get('[data-cy="products-table"]').should('contain', 'Updated Product Name');
    });

    it('should delete product', () => {
      cy.get('[data-cy="product-row"]').first().within(() => {
        cy.get('[data-cy="product-name"]').invoke('text').as('productName');
        cy.get('[data-cy="delete-product-button"]').click();
      });
      
      cy.get('[data-cy="confirm-delete-modal"]').should('be.visible');
      cy.get('[data-cy="confirm-delete-button"]').click();
      
      cy.get('[data-cy="success-message"]').should('contain', 'Product deleted successfully');
      
      cy.get('@productName').then((name) => {
        cy.get('[data-cy="products-table"]').should('not.contain', name);
      });
    });

    it('should manage product inventory', () => {
      cy.get('[data-cy="product-row"]').first().within(() => {
        cy.get('[data-cy="manage-stock-button"]').click();
      });
      
      cy.get('[data-cy="stock-management-modal"]').should('be.visible');
      cy.get('[data-cy="current-stock"]').should('be.visible');
      cy.get('[data-cy="stock-adjustment"]').type('10');
      cy.get('[data-cy="adjustment-reason"]').select('restock');
      cy.get('[data-cy="update-stock-button"]').click();
      
      cy.get('[data-cy="success-message"]').should('contain', 'Stock updated successfully');
    });

    it('should filter and search products', () => {
      cy.get('[data-cy="product-search"]').type('honey');
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="product-row"]').each(($row) => {
        cy.wrap($row).should('contain.text', 'honey');
      });
      
      // Test category filter
      cy.get('[data-cy="category-filter"]').select('honey');
      cy.get('[data-cy="product-row"]').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-cy="product-category"]').should('contain', 'honey');
        });
      });
    });
  });

  describe('Order Management', () => {
    beforeEach(() => {
      cy.navigateToAdmin();
      cy.get('[data-cy="admin-nav-orders"]').click();
    });

    it('should display orders list', () => {
      cy.get('[data-cy="orders-table"]').should('be.visible');
      cy.get('[data-cy="order-row"]').should('have.length.greaterThan', 0);
      
      cy.get('[data-cy="order-row"]').first().within(() => {
        cy.get('[data-cy="order-id"]').should('be.visible');
        cy.get('[data-cy="customer-email"]').should('be.visible');
        cy.get('[data-cy="order-total"]').should('be.visible');
        cy.get('[data-cy="order-status"]').should('be.visible');
        cy.get('[data-cy="order-date"]').should('be.visible');
      });
    });

    it('should update order status', () => {
      cy.get('[data-cy="order-row"]').first().within(() => {
        cy.get('[data-cy="order-id"]').invoke('text').as('orderId');
        cy.get('[data-cy="order-status-select"]').select('shipped');
        cy.get('[data-cy="update-status-button"]').click();
      });
      
      cy.get('[data-cy="success-message"]').should('contain', 'Order status updated');
      
      cy.get('@orderId').then((orderId) => {
        cy.get(`[data-cy="order-${orderId}"]`).within(() => {
          cy.get('[data-cy="order-status"]').should('contain', 'shipped');
        });
      });
    });

    it('should view order details', () => {
      cy.get('[data-cy="order-row"]').first().within(() => {
        cy.get('[data-cy="view-order-button"]').click();
      });
      
      cy.get('[data-cy="order-detail-modal"]').should('be.visible');
      cy.get('[data-cy="order-items-list"]').should('be.visible');
      cy.get('[data-cy="shipping-information"]').should('be.visible');
      cy.get('[data-cy="payment-information"]').should('be.visible');
    });

    it('should filter orders by status', () => {
      cy.get('[data-cy="order-status-filter"]').select('processing');
      
      cy.get('[data-cy="order-row"]').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-cy="order-status"]').should('contain', 'processing');
        });
      });
    });

    it('should search orders by customer email', () => {
      const searchEmail = 'test@ramro.com';
      
      cy.get('[data-cy="order-search"]').type(searchEmail);
      cy.get('[data-cy="search-orders-button"]').click();
      
      cy.get('[data-cy="order-row"]').each(($row) => {
        cy.wrap($row).within(() => {
          cy.get('[data-cy="customer-email"]').should('contain', searchEmail);
        });
      });
    });

    it('should process refunds', () => {
      cy.get('[data-cy="order-row"]').first().within(() => {
        cy.get('[data-cy="refund-button"]').click();
      });
      
      cy.get('[data-cy="refund-modal"]').should('be.visible');
      cy.get('[data-cy="refund-amount"]').should('be.visible');
      cy.get('[data-cy="refund-reason"]').select('customer_request');
      cy.get('[data-cy="process-refund-button"]').click();
      
      cy.get('[data-cy="success-message"]').should('contain', 'Refund processed successfully');
    });
  });

  describe('User Management', () => {
    beforeEach(() => {
      cy.navigateToAdmin();
      cy.get('[data-cy="admin-nav-users"]').click();
    });

    it('should display users list', () => {
      cy.get('[data-cy="users-table"]').should('be.visible');
      cy.get('[data-cy="user-row"]').should('have.length.greaterThan', 0);
      
      cy.get('[data-cy="user-row"]').first().within(() => {
        cy.get('[data-cy="user-name"]').should('be.visible');
        cy.get('[data-cy="user-email"]').should('be.visible');
        cy.get('[data-cy="user-role"]').should('be.visible');
        cy.get('[data-cy="user-status"]').should('be.visible');
      });
    });

    it('should update user roles', () => {
      cy.get('[data-cy="user-row"]').first().within(() => {
        cy.get('[data-cy="user-role-select"]').select('admin');
        cy.get('[data-cy="update-role-button"]').click();
      });
      
      cy.get('[data-cy="confirm-role-change"]').click();
      cy.get('[data-cy="success-message"]').should('contain', 'User role updated');
    });

    it('should view user details and order history', () => {
      cy.get('[data-cy="user-row"]').first().within(() => {
        cy.get('[data-cy="view-user-button"]').click();
      });
      
      cy.get('[data-cy="user-detail-modal"]').should('be.visible');
      cy.get('[data-cy="user-profile-info"]').should('be.visible');
      cy.get('[data-cy="user-order-history"]').should('be.visible');
      cy.get('[data-cy="user-statistics"]').should('be.visible');
    });

    it('should suspend/activate user accounts', () => {
      cy.get('[data-cy="user-row"]').first().within(() => {
        cy.get('[data-cy="user-status"]').invoke('text').as('currentStatus');
        cy.get('[data-cy="toggle-status-button"]').click();
      });
      
      cy.get('[data-cy="confirm-status-change"]').click();
      cy.get('[data-cy="success-message"]').should('contain', 'User status updated');
    });
  });

  describe('Analytics and Reporting', () => {
    beforeEach(() => {
      cy.navigateToAdmin();
      cy.get('[data-cy="admin-nav-analytics"]').click();
    });

    it('should display sales analytics', () => {
      cy.get('[data-cy="analytics-dashboard"]').should('be.visible');
      cy.get('[data-cy="sales-chart"]').should('be.visible');
      cy.get('[data-cy="revenue-metrics"]').should('be.visible');
      cy.get('[data-cy="top-products"]').should('be.visible');
    });

    it('should filter analytics by date range', () => {
      cy.get('[data-cy="date-range-picker"]').click();
      cy.get('[data-cy="last-30-days"]').click();
      
      cy.get('[data-cy="analytics-loading"]').should('be.visible');
      cy.get('[data-cy="analytics-loading"]').should('not.exist');
      cy.get('[data-cy="updated-metrics"]').should('be.visible');
    });

    it('should export analytics reports', () => {
      cy.get('[data-cy="export-report-button"]').click();
      cy.get('[data-cy="export-format-select"]').select('csv');
      cy.get('[data-cy="confirm-export-button"]').click();
      
      cy.get('[data-cy="export-success-message"]').should('be.visible');
    });
  });

  describe('System Settings', () => {
    beforeEach(() => {
      cy.navigateToAdmin();
      cy.get('[data-cy="admin-nav-settings"]').click();
    });

    it('should update site settings', () => {
      cy.get('[data-cy="site-name"]').clear().type('Updated Ramro Store');
      cy.get('[data-cy="site-description"]').clear().type('Updated description');
      cy.get('[data-cy="save-settings-button"]').click();
      
      cy.get('[data-cy="success-message"]').should('contain', 'Settings updated successfully');
    });

    it('should manage payment gateway settings', () => {
      cy.get('[data-cy="payment-settings-tab"]').click();
      
      cy.get('[data-cy="razorpay-enabled"]').should('be.checked');
      cy.get('[data-cy="cod-enabled"]').check();
      cy.get('[data-cy="save-payment-settings"]').click();
      
      cy.get('[data-cy="success-message"]').should('contain', 'Payment settings updated');
    });

    it('should configure email templates', () => {
      cy.get('[data-cy="email-settings-tab"]').click();
      
      cy.get('[data-cy="order-confirmation-template"]').should('be.visible');
      cy.get('[data-cy="edit-template-button"]').click();
      
      cy.get('[data-cy="template-editor"]').should('be.visible');
      cy.get('[data-cy="template-subject"]').clear().type('Updated Order Confirmation');
      cy.get('[data-cy="save-template-button"]').click();
      
      cy.get('[data-cy="success-message"]').should('contain', 'Template updated successfully');
    });
  });

  describe('Admin Security', () => {
    it('should prevent non-admin access', () => {
      cy.logout();
      cy.loginAsUser();
      
      cy.visit('/admin');
      cy.url().should('not.include', '/admin');
      cy.get('[data-cy="access-denied-message"]').should('be.visible');
    });

    it('should log admin activities', () => {
      cy.navigateToAdmin();
      cy.get('[data-cy="admin-nav-products"]').click();
      
      // Perform an admin action
      cy.get('[data-cy="product-row"]').first().within(() => {
        cy.get('[data-cy="edit-product-button"]').click();
      });
      
      cy.get('[data-cy="product-name"]').clear().type('Modified Product');
      cy.get('[data-cy="save-product-button"]').click();
      
      // Check activity log
      cy.get('[data-cy="admin-nav-logs"]').click();
      cy.get('[data-cy="activity-log"]').should('contain', 'Product updated');
    });
  });

  describe('Mobile Admin Experience', () => {
    beforeEach(() => {
      cy.setMobileViewport();
    });

    it('should display mobile admin dashboard', () => {
      cy.navigateToAdmin();
      
      cy.get('[data-cy="mobile-admin-layout"]').should('be.visible');
      cy.get('[data-cy="mobile-admin-menu"]').should('be.visible');
      cy.get('[data-cy="admin-quick-stats"]').should('be.visible');
    });

    it('should handle mobile order management', () => {
      cy.navigateToAdmin();
      cy.get('[data-cy="mobile-orders-button"]').click();
      
      cy.get('[data-cy="mobile-orders-list"]').should('be.visible');
      cy.get('[data-cy="order-card"]').first().click();
      
      cy.get('[data-cy="mobile-order-detail"]').should('be.visible');
      cy.get('[data-cy="mobile-status-update"]').should('be.visible');
    });
  });
});