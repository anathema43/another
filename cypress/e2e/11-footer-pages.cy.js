describe('Footer Pages Testing', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('Shipping Policy Page', () => {
    beforeEach(() => {
      cy.visit('/shipping-policy');
    });

    it('should display shipping policy content', () => {
      cy.url().should('include', '/shipping-policy');
      cy.contains('Shipping Policy').should('be.visible');
      cy.contains('deliver across India').should('be.visible');
      cy.contains('2 business days').should('be.visible');
    });

    it('should be accessible and well-structured', () => {
      cy.checkAccessibility();
      cy.get('h1').should('exist');
      cy.get('h1').should('contain', 'Shipping Policy');
    });
  });

  describe('Return Policy Page', () => {
    beforeEach(() => {
      cy.visit('/return-policy');
    });

    it('should display return policy content', () => {
      cy.url().should('include', '/return-policy');
      cy.contains('Return Policy').should('be.visible');
      cy.contains('7-day returns').should('be.visible');
      cy.contains('support@ramro.com').should('be.visible');
    });

    it('should have proper contact information', () => {
      cy.get('a[href="mailto:support@ramro.com"]').should('be.visible');
      cy.get('a[href="mailto:support@ramro.com"]').should('have.attr', 'href', 'mailto:support@ramro.com');
    });
  });

  describe('FAQ Page', () => {
    beforeEach(() => {
      cy.visit('/faq');
    });

    it('should display FAQ content', () => {
      cy.url().should('include', '/faq');
      cy.contains('Frequently Asked Questions').should('be.visible');
      cy.contains('How does delivery work?').should('be.visible');
      cy.contains('Can I return items?').should('be.visible');
      cy.contains('How do I contact support?').should('be.visible');
    });

    it('should have interactive FAQ accordion', () => {
      // Test FAQ accordion functionality
      cy.contains('How does delivery work?').click();
      cy.contains('shipped from the Himalayas').should('be.visible');
      
      // Click another FAQ
      cy.contains('Can I return items?').click();
      cy.contains('7-day returns').should('be.visible');
      
      // Previous FAQ should close (if accordion behavior)
      cy.contains('How does delivery work?').click();
    });

    it('should have working internal links', () => {
      // Test link to contact page
      cy.get('a[href="/contact"]').should('be.visible');
      cy.get('a[href="/contact"]').click();
      cy.url().should('include', '/contact');
      
      // Go back to FAQ
      cy.go('back');
      cy.url().should('include', '/faq');
    });

    it('should have working email links', () => {
      cy.get('a[href="mailto:support@ramro.com"]').should('be.visible');
      cy.get('a[href="mailto:support@ramro.com"]').should('have.attr', 'href', 'mailto:support@ramro.com');
    });
  });

  describe('Footer Navigation', () => {
    it('should navigate to all footer pages from homepage', () => {
      cy.visit('/');
      
      // Test navigation to each footer page
      const footerPages = [
        { path: '/about', text: 'About' },
        { path: '/contact', text: 'Contact' },
        { path: '/shipping-policy', text: 'Shipping Policy' },
        { path: '/return-policy', text: 'Return Policy' },
        { path: '/faq', text: 'FAQ' }
      ];
      
      footerPages.forEach((page) => {
        cy.visit('/');
        
        // Find and click footer link
        cy.get('footer').within(() => {
          cy.get(`a[href="${page.path}"]`).click();
        });
        
        cy.url().should('include', page.path);
        cy.contains(page.text).should('be.visible');
      });
    });

    it('should have consistent footer across all pages', () => {
      const pages = ['/', '/about', '/contact', '/shop', '/shipping-policy', '/return-policy', '/faq'];
      
      pages.forEach((page) => {
        cy.visit(page);
        
        // Check footer exists and has consistent content
        cy.get('footer').should('be.visible');
        cy.get('footer').should('contain', 'Ramro');
        
        // Check footer links are present
        cy.get('footer a[href="/about"]').should('exist');
        cy.get('footer a[href="/contact"]').should('exist');
        cy.get('footer a[href="/shipping-policy"]').should('exist');
        cy.get('footer a[href="/return-policy"]').should('exist');
        cy.get('footer a[href="/faq"]').should('exist');
      });
    });
  });

  describe('Page Content Quality', () => {
    it('should have no broken links on static pages', () => {
      const pages = ['/about', '/contact', '/shipping-policy', '/return-policy', '/faq'];
      
      pages.forEach((page) => {
        cy.visit(page);
        
        // Check all links on the page
        cy.get('a[href]').each(($link) => {
          const href = $link.attr('href');
          
          // Skip external links and mailto links
          if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
            cy.request(href).its('status').should('eq', 200);
          }
        });
      });
    });

    it('should have proper spelling and grammar', () => {
      const pages = ['/about', '/contact', '/shipping-policy', '/return-policy', '/faq'];
      
      pages.forEach((page) => {
        cy.visit(page);
        
        // Check for common spelling mistakes
        cy.get('body').should('not.contain', 'teh');
        cy.get('body').should('not.contain', 'recieve');
        cy.get('body').should('not.contain', 'seperate');
        cy.get('body').should('not.contain', 'occured');
      });
    });
  });

  describe('Mobile Experience', () => {
    beforeEach(() => {
      cy.setMobileViewport();
    });

    it('should display About page properly on mobile', () => {
      cy.visit('/about');
      
      cy.get('[data-cy="about-hero"]').should('be.visible');
      cy.contains('Our Story').should('be.visible');
      
      // Check mobile layout
      cy.get('.grid').should('be.visible');
    });

    it('should display Contact form properly on mobile', () => {
      cy.visit('/contact');
      
      cy.get('[data-cy="contact-form"]').should('be.visible');
      
      // Test form interaction on mobile
      cy.get('[data-cy="contact-name"]').type('Mobile User');
      cy.get('[data-cy="contact-email"]').type('mobile@test.com');
      cy.get('[data-cy="contact-subject"]').type('Mobile Test');
      cy.get('[data-cy="contact-message"]').type('Testing on mobile device');
      
      // Form should be usable
      cy.get('[data-cy="contact-submit"]').should('be.visible');
      cy.get('[data-cy="contact-submit"]').click();
    });

    it('should have readable text on all static pages', () => {
      const pages = ['/about', '/contact', '/shipping-policy', '/return-policy', '/faq'];
      
      pages.forEach((page) => {
        cy.visit(page);
        
        // Check text is readable (not too small)
        cy.get('p').should('have.css', 'font-size').and('match', /^(1[4-9]|[2-9]\d)px$/);
        
        // Check headings are appropriately sized
        cy.get('h1').should('have.css', 'font-size').and('match', /^([2-9]\d)px$/);
      });
    });
  });

  describe('Search Engine Optimization', () => {
    it('should have proper meta tags on all static pages', () => {
      const pages = [
        { path: '/about', title: 'About', keywords: 'himalayan, organic, story' },
        { path: '/contact', title: 'Contact', keywords: 'contact, support, help' },
        { path: '/shipping-policy', title: 'Shipping', keywords: 'shipping, delivery, policy' },
        { path: '/return-policy', title: 'Returns', keywords: 'returns, refund, policy' },
        { path: '/faq', title: 'FAQ', keywords: 'questions, help, support' }
      ];
      
      pages.forEach((page) => {
        cy.visit(page.path);
        
        // Check title
        cy.title().should('contain', page.title);
        
        // Check meta description exists
        cy.get('meta[name="description"]').should('exist');
        
        // Check canonical URL
        cy.get('link[rel="canonical"]').should('have.attr', 'href').and('include', page.path);
      });
    });

    it('should have proper heading structure', () => {
      const pages = ['/about', '/contact', '/shipping-policy', '/return-policy', '/faq'];
      
      pages.forEach((page) => {
        cy.visit(page);
        
        // Should have exactly one H1
        cy.get('h1').should('have.length', 1);
        
        // Check heading hierarchy
        cy.get('h1, h2, h3, h4, h5, h6').then(($headings) => {
          const levels = [...$headings].map(h => parseInt(h.tagName.charAt(1)));
          
          // First heading should be H1
          expect(levels[0]).to.equal(1);
          
          // No heading should skip more than one level
          for (let i = 1; i < levels.length; i++) {
            expect(levels[i] - levels[i-1]).to.be.at.most(1);
          }
        });
      });
    });
  });
});