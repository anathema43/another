describe('Content Management Testing', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Stories System', () => {
    it('should display stories page correctly', () => {
      cy.get('a[href="#/stories"]').click();
      cy.url().should('include', '/stories');
      
      // Should see stories page elements
      cy.contains('Darjeeling Stories & News').should('be.visible');
      cy.get('article').should('have.length.greaterThan', 0);
      
      // Should see featured story
      cy.contains('Featured Story').should('be.visible');
    });

    it('should filter stories by category', () => {
      cy.get('a[href="#/stories"]').click();
      
      // Test category filtering
      cy.get('button').contains('Events & Festivals').click();
      
      // Should filter stories
      cy.get('article').should('be.visible');
    });

    it('should display story details', () => {
      cy.get('a[href="#/stories"]').click();
      
      // Click on first story
      cy.get('article').first().within(() => {
        cy.get('a').contains('Read Story').click();
      });
      
      // Should navigate to story detail
      cy.url().should('include', '/stories/');
      cy.get('article').should('be.visible');
      cy.get('h1').should('be.visible');
      
      // Should have back navigation
      cy.get('a').contains('Back to Stories').should('be.visible');
    });

    it('should handle story sharing', () => {
      cy.get('a[href="#/stories"]').click();
      cy.get('article').first().within(() => {
        cy.get('a').contains('Read Story').click();
      });
      
      // Test share functionality
      cy.get('button').contains('Share').should('be.visible');
    });

    it('should show artisan profile link only when artisan exists', () => {
      cy.visit('/stories');
      
      // Find artisan story and click it
      cy.contains('Pickle Making').parents('article').within(() => {
        cy.get('a').contains('Read Story').click();
      });
      
      // Should show artisan profile link for artisan stories
      cy.get('body').then(($body) => {
        if ($body.text().includes('View Artisan Profile')) {
          cy.get('a').contains('View Artisan Profile').should('be.visible');
          cy.get('a').contains('View Artisan Profile').click();
          cy.url().should('include', '/artisans/');
        }
      });
    });
  });

  describe('Artisans Directory', () => {
    it('should display artisans directory', () => {
      cy.get('a[href="#/artisans"]').click();
      cy.url().should('include', '/artisans');
      
      // Should see artisans page elements
      cy.contains('Meet Our Artisans').should('be.visible');
      cy.get('a').should('have.length.greaterThan', 0);
      
      // Should see featured artisans
      cy.contains('Featured Master Artisans').should('be.visible');
    });

    it('should filter artisans by region', () => {
      cy.get('a[href="#/artisans"]').click();
      
      // Test region filtering
      cy.get('select').select('West Bengal');
      
      // Should filter artisans
      cy.get('a').should('contain', 'West Bengal');
    });

    it('should search artisans', () => {
      cy.get('a[href="#/artisans"]').click();
      
      // Test search functionality
      cy.get('input[placeholder*="Search"]').type('pickle');
      
      // Should show relevant artisans
      cy.get('a').should('contain', 'pickle');
    });

    it('should display artisan profiles', () => {
      cy.get('a[href="#/artisans"]').click();
      
      // Click on first artisan
      cy.get('a').first().click();
      
      // Should navigate to artisan profile
      cy.url().should('include', '/artisans/');
      cy.get('h1').should('be.visible');
      cy.contains('The Story of').should('be.visible');
      
      // Should have back navigation
      cy.get('a').contains('Back to Artisans').should('be.visible');
    });
  });

  describe('Static Pages', () => {
    const staticPages = [
      { path: '/about', title: 'Our Story' },
      { path: '/contact', title: 'Get in Touch' },
      { path: '/shipping-policy', title: 'Shipping Policy' },
      { path: '/refund-policy', title: 'Refund & Return Policy' },
      { path: '/privacy-policy', title: 'Privacy Policy' },
      { path: '/terms-of-use', title: 'Terms of Use' }
    ];

    staticPages.forEach(page => {
      it(`should display ${page.path} page correctly`, () => {
        cy.visit(`/#${page.path}`);
        cy.url().should('include', page.path);
        cy.contains(page.title).should('be.visible');
      });
    });

    it('should handle contact form submission', () => {
      cy.visit('/#/contact');
      
      // Fill contact form
      cy.get('input[name="name"]').type('Test Contact');
      cy.get('input[name="email"]').type('contact@test.com');
      cy.get('input[name="subject"]').type('Test Subject');
      cy.get('textarea[name="message"]').type('This is a test message for the contact form.');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should show success message
      cy.contains('Message Sent!').should('be.visible');
    });
  });

  describe('Navigation and Routing', () => {
    it('should navigate between all pages', () => {
      const pages = [
        { link: 'a[href="#/shop"]', url: '/shop' },
        { link: 'a[href="#/artisans"]', url: '/artisans' },
        { link: 'a[href="#/stories"]', url: '/stories' },
        { link: 'a[href="#/about"]', url: '/about' },
        { link: 'a[href="#/contact"]', url: '/contact' }
      ];

      pages.forEach(page => {
        cy.get(page.link).click();
        cy.url().should('include', page.url);
        cy.get('body').should('be.visible');
      });
    });

    it('should handle mobile navigation', () => {
      cy.viewport('iphone-6');
      
      // Should see mobile menu button
      cy.get('[data-cy="mobile-menu-button"]').should('be.visible');
      cy.get('[data-cy="mobile-menu-button"]').click();
      
      // Should see mobile menu
      cy.get('[data-cy="mobile-menu"]').should('be.visible');
      
      // Test mobile navigation
      cy.get('[data-cy="mobile-nav-shop"]').click();
      cy.url().should('include', '/shop');
    });

    it('should redirect invalid routes to home', () => {
      cy.visit('/#/invalid-route');
      
      // Should redirect to home
      cy.url().should('not.include', '/invalid-route');
    });
  });
});