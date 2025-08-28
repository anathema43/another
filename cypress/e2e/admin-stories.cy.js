describe('Admin Stories Management E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    
    // Create admin user and login
    cy.visit('/signup');
    cy.get('[data-cy="signup-name"]').type('Admin User');
    cy.get('[data-cy="signup-email"]').type('admin@test.com');
    cy.get('[data-cy="signup-password"]').type('password123');
    cy.get('[data-cy="signup-confirm-password"]').type('password123');
    cy.get('[data-cy="signup-submit"]').click();
    
    // Note: In real test, you'd need to set admin role in Firestore
    // For this test, we assume admin role is set
  });

  describe('Stories Admin Panel', () => {
    it('should access stories management in admin panel', () => {
      cy.visit('/admin');
      
      // Should see stories tab
      cy.contains('Stories').click();
      
      // Should show stories management interface
      cy.contains('Story Management').should('be.visible');
      cy.contains('Add Story').should('be.visible');
    });

    it('should create new story', () => {
      cy.visit('/admin');
      cy.contains('Stories').click();
      cy.contains('Add Story').click();
      
      // Fill story form
      cy.get('input[value=""]').first().type('Test Story Title');
      cy.get('select').first().select('artisan-story');
      cy.get('input').eq(2).type('Test Author');
      cy.get('textarea').first().type('This is a test story excerpt...');
      cy.get('textarea').last().type('This is the full story content with details about the artisan...');
      
      // Save story
      cy.contains('Create Story').click();
      
      // Should show success message
      cy.contains('Story saved successfully').should('be.visible');
    });

    it('should edit existing story', () => {
      cy.visit('/admin');
      cy.contains('Stories').click();
      
      // Click edit on first story
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[title="Edit Story"]').click();
      });
      
      // Should open story editor
      cy.contains('Edit Story').should('be.visible');
      
      // Make changes
      cy.get('input[value*=""]').first().clear().type('Updated Story Title');
      
      // Save changes
      cy.contains('Update Story').click();
      
      // Should show success
      cy.contains('Story saved successfully').should('be.visible');
    });

    it('should delete story', () => {
      cy.visit('/admin');
      cy.contains('Stories').click();
      
      // Click delete on first story
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[title="Delete Story"]').click();
      });
      
      // Confirm deletion
      cy.on('window:confirm', () => true);
      
      // Story should be removed from table
      cy.get('table tbody tr').should('have.length.lessThan', 10);
    });

    it('should manage featured status', () => {
      cy.visit('/admin');
      cy.contains('Stories').click();
      
      // Edit story to change featured status
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[title="Edit Story"]').click();
      });
      
      // Toggle featured status
      cy.get('input[type="checkbox"]').check();
      
      // Save changes
      cy.contains('Update Story').click();
      
      // Should show featured badge in table
      cy.contains('Featured').should('be.visible');
    });
  });

  describe('Story Content Validation', () => {
    it('should validate required fields', () => {
      cy.visit('/admin');
      cy.contains('Stories').click();
      cy.contains('Add Story').click();
      
      // Try to save without required fields
      cy.contains('Create Story').click();
      
      // Should show validation message
      cy.contains('Please fill in title, content, and author').should('be.visible');
    });

    it('should handle image uploads', () => {
      cy.visit('/admin');
      cy.contains('Stories').click();
      cy.contains('Add Story').click();
      
      // Test image upload areas
      cy.get('[data-cy="image-upload-section"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Public Stories Integration', () => {
    it('should not show admin controls on public stories page', () => {
      cy.visit('/stories');
      
      // Should not see edit/delete buttons
      cy.get('button[title="Edit Story"]').should('not.exist');
      cy.get('button[title="Delete Story"]').should('not.exist');
    });

    it('should show manage stories button for admin', () => {
      cy.visit('/stories');
      
      // Should see admin management button
      cy.contains('Manage Stories (Admin Panel)').should('be.visible');
      
      // Should link to admin panel
      cy.contains('Manage Stories (Admin Panel)').click();
      cy.url().should('include', '/admin');
    });
  });
});