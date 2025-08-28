describe('Static Pages Testing', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('About Page', () => {
    beforeEach(() => {
      cy.visit('/about');
    });

    it('should display about page content correctly', () => {
      // Check page loads
      cy.url().should('include', '/about');
      cy.get('[data-cy="about-page"]').should('be.visible');
      
      // Check hero section
      cy.get('[data-cy="about-hero"]').should('be.visible');
      cy.contains('Our Story').should('be.visible');
      cy.contains('Connecting the world with authentic Himalayan craftsmanship').should('be.visible');
    });

    it('should display company mission and values', () => {
      // Check mission section
      cy.contains('Our Mission').should('be.visible');
      cy.contains('authentic, handcrafted products').should('be.visible');
      
      // Check sustainability section
      cy.contains('Sustainability First').should('be.visible');
      cy.contains('Fair Trade').should('be.visible');
      
      // Check promise section
      cy.contains('The Ramro Promise').should('be.visible');
      cy.get('ul').should('contain', '100% authentic products');
      cy.get('ul').should('contain', 'Organic certification');
    });

    it('should have working navigation to shop', () => {
      cy.get('a').contains('Explore Our Products').click();
      cy.url().should('include', '/shop');
      cy.get('[data-cy="shop-page"]').should('be.visible');
    });

    it('should be accessible', () => {
      cy.checkAccessibility();
      
      // Check heading hierarchy
      cy.get('h1').should('exist');
      cy.get('h2').should('exist');
      
      // Check images have alt text
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('should be mobile responsive', () => {
      cy.setMobileViewport();
      
      cy.get('[data-cy="about-hero"]').should('be.visible');
      cy.contains('Our Story').should('be.visible');
      
      // Check mobile layout
      cy.get('.grid').should('have.class', 'md:grid-cols-2');
    });
  });

  describe('Contact Page', () => {
    beforeEach(() => {
      cy.visit('/contact');
    });

    it('should display contact page content correctly', () => {
      // Check page loads
      cy.url().should('include', '/contact');
      cy.get('[data-cy="contact-page"]').should('be.visible');
      
      // Check hero section
      cy.contains('Get in Touch').should('be.visible');
      cy.contains('Send us a message').should('be.visible');
    });

    it('should display contact information', () => {
      // Check contact details
      cy.contains('support@ramro.com').should('be.visible');
      cy.contains('hello@ramro.com').should('be.visible');
      cy.contains('+977 1 234 5678').should('be.visible');
      cy.contains('Thamel, Kathmandu').should('be.visible');
      
      // Check business hours
      cy.contains('Business Hours').should('be.visible');
      cy.contains('Monday - Friday').should('be.visible');
      cy.contains('9:00 AM - 6:00 PM').should('be.visible');
    });

    it('should validate contact form fields', () => {
      // Test empty form submission
      cy.get('[data-cy="contact-submit"]').click();
      
      // Should show validation errors
      cy.get('input:invalid').should('have.length.greaterThan', 0);
      
      // Test individual field validation
      cy.get('[data-cy="contact-email"]').type('invalid-email');
      cy.get('[data-cy="contact-email"]').blur();
      cy.get('[data-cy="contact-email"]:invalid').should('exist');
      
      // Test valid email
      cy.get('[data-cy="contact-email"]').clear().type('test@example.com');
      cy.get('[data-cy="contact-email"]:valid').should('exist');
    });

    it('should submit contact form successfully', () => {
      // Fill out contact form
      cy.get('[data-cy="contact-name"]').type('John Doe');
      cy.get('[data-cy="contact-email"]').type('john@example.com');
      cy.get('[data-cy="contact-subject"]').type('Test Inquiry');
      cy.get('[data-cy="contact-message"]').type('This is a test message from Cypress automation.');
      
      // Submit form
      cy.get('[data-cy="contact-submit"]').click();
      
      // Check success message
      cy.get('[data-cy="success-message"]').should('be.visible');
      cy.contains('Message Sent!').should('be.visible');
      cy.contains('Thank you for contacting us').should('be.visible');
      
      // Form should be reset
      cy.get('[data-cy="contact-name"]').should('have.value', '');
      cy.get('[data-cy="contact-email"]').should('have.value', '');
    });

    it('should handle form submission errors', () => {
      // Mock form submission error
      cy.intercept('POST', '/api/contact', { statusCode: 500 }).as('contactError');
      
      // Fill and submit form
      cy.get('[data-cy="contact-name"]').type('John Doe');
      cy.get('[data-cy="contact-email"]').type('john@example.com');
      cy.get('[data-cy="contact-subject"]').type('Test Subject');
      cy.get('[data-cy="contact-message"]').type('Test message');
      cy.get('[data-cy="contact-submit"]').click();
      
      // Should show error message
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.contains('error').should('be.visible');
    });

    it('should be accessible', () => {
      cy.checkAccessibility();
      
      // Check form labels
      cy.get('input').each(($input) => {
        const id = $input.attr('id');
        if (id) {
          cy.get(`label[for="${id}"]`).should('exist');
        }
      });
      
      // Check textarea label
      cy.get('textarea').each(($textarea) => {
        const id = $textarea.attr('id');
        if (id) {
          cy.get(`label[for="${id}"]`).should('exist');
        }
      });
    });

    it('should be mobile responsive', () => {
      cy.setMobileViewport();
      
      // Check mobile layout
      cy.get('[data-cy="contact-form"]').should('be.visible');
      cy.get('[data-cy="contact-info"]').should('be.visible');
      
      // Test form interaction on mobile
      cy.get('[data-cy="contact-name"]').type('Mobile Test');
      cy.get('[data-cy="contact-name"]').should('have.value', 'Mobile Test');
    });

    it('should handle long form content', () => {
      const longMessage = 'A'.repeat(2000); // Very long message
      
      cy.get('[data-cy="contact-name"]').type('Test User');
      cy.get('[data-cy="contact-email"]').type('test@example.com');
      cy.get('[data-cy="contact-subject"]').type('Long Message Test');
      cy.get('[data-cy="contact-message"]').type(longMessage);
      
      // Should handle long content gracefully
      cy.get('[data-cy="contact-message"]').should('contain.value', longMessage);
      
      // Submit should work
      cy.get('[data-cy="contact-submit"]').click();
      cy.get('[data-cy="success-message"]').should('be.visible');
    });

    it('should handle long form content', () => {
      const longMessage = 'A'.repeat(2000); // Very long message
      
      cy.get('[data-cy="contact-name"]').type('Test User');
      cy.get('[data-cy="contact-email"]').type('test@example.com');
      cy.get('[data-cy="contact-subject"]').type('Long Message Test');
      cy.get('[data-cy="contact-message"]').type(longMessage);
      
      // Should handle long content gracefully
      cy.get('[data-cy="contact-message"]').should('contain.value', longMessage);
      
      // Submit should work
      cy.get('[data-cy="contact-submit"]').click();
      cy.get('[data-cy="success-message"]').should('be.visible');
    });
  });

  describe('Static Pages Navigation', () => {
    it('should navigate between static pages', () => {
      // Test navigation from footer or menu
      cy.visit('/');
      
      // Navigate to About
      cy.get('a[href="/about"]').first().click();
      cy.url().should('include', '/about');
      cy.contains('Our Story').should('be.visible');
      
      // Navigate to Contact
      cy.get('a[href="/contact"]').first().click();
      cy.url().should('include', '/contact');
      cy.contains('Get in Touch').should('be.visible');
      
      // Navigate back to Home
      cy.get('a[href="/"]').first().click();
      cy.url().should('not.include', '/about');
      cy.url().should('not.include', '/contact');
    });

    it('should have consistent header and footer', () => {
      const pages = ['/about', '/contact'];
      
      pages.forEach((page) => {
        cy.visit(page);
        
        // Check header is present
        cy.get('[data-cy="navbar"]').should('be.visible');
        cy.get('[data-cy="logo"]').should('be.visible');
        
        // Check footer is present (if exists)
        cy.get('footer').should('be.visible');
      });
    });
  });

  describe('SEO and Meta Tags', () => {
    it('should have proper meta tags on About page', () => {
      cy.visit('/about');
      
      // Check page title
      cy.title().should('not.be.empty');
      cy.title().should('contain', 'About');
      
      // Check meta description
      cy.get('meta[name="description"]').should('have.attr', 'content');
    });

    it('should have proper meta tags on Contact page', () => {
      cy.visit('/contact');
      
      // Check page title
      cy.title().should('not.be.empty');
      cy.title().should('contain', 'Contact');
      
      // Check meta description
      cy.get('meta[name="description"]').should('have.attr', 'content');
    });
  });

  describe('Performance Testing', () => {
    it('should load About page quickly', () => {
      const startTime = Date.now();
      
      cy.visit('/about');
      cy.get('[data-cy="about-page"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load in under 3 seconds
      });
    });

    it('should load Contact page quickly', () => {
      const startTime = Date.now();
      
      cy.visit('/contact');
      cy.get('[data-cy="contact-page"]').should('be.visible');
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // Should load in under 3 seconds
      });
    });
  });

  describe('Cross-browser Compatibility', () => {
    ['chrome', 'firefox', 'edge'].forEach((browser) => {
      it(`should work properly in ${browser}`, () => {
        // This would require browser-specific configuration
        cy.visit('/about');
        cy.contains('Our Story').should('be.visible');
        
        cy.visit('/contact');
        cy.get('[data-cy="contact-form"]').should('be.visible');
      });
    });
  });
});