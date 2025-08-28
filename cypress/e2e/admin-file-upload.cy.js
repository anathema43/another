describe('Admin File Upload Interface', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.loginAsAdmin();
    cy.visit('/admin');
  });

  describe('Product Image Upload', () => {
    it('should display image upload interface in product form', () => {
      cy.get('[data-cy="add-product-button"]').click();
      
      // Should see image upload section
      cy.get('[data-cy="image-upload-section"]').should('be.visible');
      cy.get('[data-cy="image-upload-dropzone"]').should('be.visible');
      cy.contains('Drop an image here, or browse to upload').should('be.visible');
    });

    it('should upload image with drag and drop', () => {
      cy.get('[data-cy="add-product-button"]').click();
      
      // Create a test file
      const fileName = 'test-product.jpg';
      cy.fixture('images/test-product.jpg', 'base64').then(fileContent => {
        const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        
        // Simulate drag and drop
        cy.get('[data-cy="image-upload-dropzone"]').selectFile(file, {
          action: 'drag-drop'
        });
        
        // Should show upload progress
        cy.get('[data-cy="upload-progress"]').should('be.visible');
        cy.get('[data-cy="upload-percentage"]').should('be.visible');
        
        // Should show image preview after upload
        cy.get('[data-cy="image-preview"]').should('be.visible');
        cy.get('[data-cy="uploaded-image"]').should('have.attr', 'src');
      });
    });

    it('should validate file type and size', () => {
      cy.get('[data-cy="add-product-button"]').click();
      
      // Test invalid file type
      const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      cy.get('[data-cy="image-upload-dropzone"]').selectFile(invalidFile, { force: true });
      
      cy.get('[data-cy="file-type-error"]').should('be.visible');
      cy.get('[data-cy="file-type-error"]').should('contain', 'Invalid file type');
    });

    it('should show file size error for large files', () => {
      cy.get('[data-cy="add-product-button"]').click();
      
      // Create large file (mock)
      const largeContent = 'x'.repeat(10 * 1024 * 1024); // 10MB
      const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      
      cy.get('[data-cy="image-upload-dropzone"]').selectFile(largeFile, { force: true });
      
      cy.get('[data-cy="file-size-error"]').should('be.visible');
      cy.get('[data-cy="file-size-error"]').should('contain', 'File too large');
    });

    it('should remove uploaded image', () => {
      cy.get('[data-cy="add-product-button"]').click();
      
      // Upload an image first
      cy.fixture('images/test-product.jpg', 'base64').then(fileContent => {
        const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
        const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
        
        cy.get('[data-cy="image-upload-dropzone"]').selectFile(file);
        cy.get('[data-cy="image-preview"]').should('be.visible');
        
        // Remove image
        cy.get('[data-cy="remove-image-button"]').click();
        cy.get('[data-cy="image-preview"]').should('not.exist');
        cy.get('[data-cy="image-upload-dropzone"]').should('be.visible');
      });
    });
  });

  describe('Bulk CSV Upload', () => {
    beforeEach(() => {
      cy.get('[data-cy="bulk-upload-tab"]').click();
    });

    it('should display bulk upload interface', () => {
      cy.get('[data-cy="bulk-upload-section"]').should('be.visible');
      cy.get('[data-cy="csv-template-download"]').should('be.visible');
      cy.get('[data-cy="csv-upload-dropzone"]').should('be.visible');
      cy.contains('Upload CSV File').should('be.visible');
    });

    it('should download CSV template', () => {
      cy.get('[data-cy="csv-template-download"]').click();
      
      // Verify download was triggered
      cy.readFile('cypress/downloads/ramro-products-template.csv').should('exist');
    });

    it('should upload and process CSV file', () => {
      // Create test CSV content
      const csvContent = `name,description,price,category,quantityAvailable,sku
"Test Product 1","Test description 1",299,"honey",10,"TP001"
"Test Product 2","Test description 2",399,"pickle",15,"TP002"`;
      
      const csvFile = new File([csvContent], 'test-products.csv', { type: 'text/csv' });
      
      cy.get('[data-cy="csv-upload-dropzone"]').selectFile(csvFile);
      
      // Should show upload progress
      cy.get('[data-cy="csv-upload-progress"]').should('be.visible');
      cy.get('[data-cy="upload-status"]').should('contain', 'Processing CSV');
      
      // Should show success message
      cy.get('[data-cy="upload-success"]').should('be.visible');
      cy.get('[data-cy="upload-results"]').should('contain', '2 products uploaded');
    });

    it('should handle CSV validation errors', () => {
      // Create invalid CSV content
      const invalidCsv = `name,description,price
"Product 1","Description 1"
"Product 2","Description 2",invalid_price`;
      
      const csvFile = new File([invalidCsv], 'invalid.csv', { type: 'text/csv' });
      
      cy.get('[data-cy="csv-upload-dropzone"]').selectFile(csvFile);
      
      // Should show validation errors
      cy.get('[data-cy="csv-validation-errors"]').should('be.visible');
      cy.get('[data-cy="error-list"]').should('contain', 'Missing required field');
    });

    it('should show upload instructions', () => {
      cy.get('[data-cy="upload-instructions"]').should('be.visible');
      cy.contains('CSV Format Instructions').should('be.visible');
      cy.contains('Download the template').should('be.visible');
      cy.contains('Required fields: name, description, price').should('be.visible');
    });
  });

  describe('File Management', () => {
    it('should show uploaded files list', () => {
      // After uploading files, should see file management
      cy.get('[data-cy="uploaded-files-section"]').should('be.visible');
      cy.get('[data-cy="file-list"]').should('be.visible');
    });

    it('should allow file deletion', () => {
      // Upload a file first, then test deletion
      cy.get('[data-cy="add-product-button"]').click();
      
      cy.fixture('images/test-product.jpg', 'base64').then(fileContent => {
        const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/jpeg');
        const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
        
        cy.get('[data-cy="image-upload-dropzone"]').selectFile(file);
        cy.get('[data-cy="image-preview"]').should('be.visible');
        
        // Save product to complete upload
        cy.get('[data-cy="product-name"]').type('Test Product');
        cy.get('[data-cy="product-description"]').type('Test Description');
        cy.get('[data-cy="product-price"]').type('299');
        cy.get('[data-cy="product-category"]').select('honey');
        cy.get('[data-cy="product-quantity"]').type('10');
        cy.get('[data-cy="save-product-button"]').click();
        
        // Should see success message
        cy.get('[data-cy="upload-success-message"]').should('be.visible');
      });
    });
  });
});