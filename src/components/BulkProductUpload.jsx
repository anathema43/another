import React, { useState } from 'react';
import { DocumentArrowUpIcon, DocumentTextIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function BulkProductUpload({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState([]);

  // CSV template for download
  const csvTemplate = `name,description,price,category,quantityAvailable,sku,weight,origin,artisan
"Darjeeling Pickle","Authentic spicy pickle from the hills of Darjeeling",299,"pickle",10,"DJP001","250g","Darjeeling, West Bengal","Deepak Sharma"
"Himalayan Wild Honey","Pure organic honey from high-altitude forests",499,"honey",7,"HWH001","500g","Manali, Himachal Pradesh","Laxmi Devi"
"Organic Red Rice","Nutrient-rich red rice from Himalayan valleys",450,"grains",15,"ORR001","1kg","Uttarakhand Hills","Ashok Singh"`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ramro-products-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    const products = [];
    const parseErrors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        if (values.length !== headers.length) {
          parseErrors.push(`Line ${i + 1}: Column count mismatch`);
          continue;
        }

        const product = {};
        headers.forEach((header, index) => {
          let value = values[index]?.trim();
          
          // Handle special fields
          if (header === 'price' || header === 'quantityAvailable') {
            value = parseFloat(value);
            if (isNaN(value)) {
              throw new Error(`Invalid ${header}: ${values[index]}`);
            }
          }
          
          product[header] = value;
        });

        // Validate required fields
        const requiredFields = ['name', 'description', 'price', 'category', 'quantityAvailable'];
        for (const field of requiredFields) {
          if (!product[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        // Add metadata
        product.createdAt = new Date().toISOString();
        product.updatedAt = new Date().toISOString();
        product.featured = false;
        product.rating = 0;
        product.reviewCount = 0;
        product.active = true;

        // Default image if not provided
        if (!product.image) {
          product.image = 'https://via.placeholder.com/400x400?text=No+Image';
        }

        products.push(product);
      } catch (error) {
        parseErrors.push(`Line ${i + 1}: ${error.message}`);
      }
    }

    return { products, errors: parseErrors };
  };

  const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current);
    return values.map(v => v.replace(/^"|"$/g, ''));
  };

  const uploadProducts = async (products) => {
    setUploading(true);
    setProgress(0);
    setErrors([]);

    const batch = writeBatch(db);
    const uploadErrors = [];
    let successCount = 0;

    try {
      for (let i = 0; i < products.length; i++) {
        try {
          const productRef = doc(collection(db, 'products'));
          batch.set(productRef, products[i]);
          successCount++;
        } catch (error) {
          uploadErrors.push(`Product ${i + 1} (${products[i].name}): ${error.message}`);
        }
        
        setProgress(Math.round(((i + 1) / products.length) * 100));
      }

      // Commit batch
      await batch.commit();

      setResults({
        total: products.length,
        successful: successCount,
        failed: uploadErrors.length
      });

      if (onUploadComplete) {
        onUploadComplete({ successCount, errors: uploadErrors });
      }

    } catch (error) {
      uploadErrors.push(`Batch upload failed: ${error.message}`);
    }

    setErrors(uploadErrors);
    setUploading(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrors(['Please upload a CSV file']);
      return;
    }

    try {
      const text = await file.text();
      const { products, errors: parseErrors } = parseCSV(text);

      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        return;
      }

      if (products.length === 0) {
        setErrors(['No valid products found in CSV file']);
        return;
      }

      // Confirm upload
      const confirmed = window.confirm(
        `Found ${products.length} products to upload. Continue?`
      );

      if (confirmed) {
        await uploadProducts(products);
      }

    } catch (error) {
      setErrors([`Failed to read CSV file: ${error.message}`]);
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg" data-cy="bulk-upload-section">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-organic-text">
          Bulk Product Upload
        </h3>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 text-organic-primary hover:text-organic-text transition-colors"
          data-cy="csv-template-download"
        >
          <DocumentTextIcon className="w-5 h-5" />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-organic-primary transition-colors" data-cy="csv-upload-dropzone">
        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <div className="space-y-2">
          <label htmlFor="csv-upload" className="cursor-pointer">
            <span className="text-lg font-medium text-gray-900">
              Upload CSV File
            </span>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="sr-only"
              disabled={uploading}
            />
          </label>
          <p className="text-sm text-gray-500">
            Select a CSV file with product data
          </p>
        </div>
      </div>

      {/* Progress */}
      {uploading && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4" data-cy="csv-upload-progress">
          <div className="flex items-center mb-2">
            <DocumentArrowUpIcon className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-blue-800 font-medium" data-cy="upload-status">Uploading Products...</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-blue-600 mt-1">{progress}% complete</div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4" data-cy="upload-success">
          <div className="flex items-center mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Upload Complete</span>
          </div>
          <div className="text-sm text-green-700" data-cy="upload-results">
            <p>Total products: {results.total}</p>
            <p>Successfully uploaded: {results.successful}</p>
            {results.failed > 0 && <p>Failed: {results.failed}</p>}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4" data-cy="csv-validation-errors">
          <div className="flex items-center mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Upload Errors</span>
          </div>
          <div className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto" data-cy="error-list">
            {errors.map((error, index) => (
              <p key={index}>• {error}</p>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4" data-cy="upload-instructions">
        <h4 className="font-medium text-gray-900 mb-2">CSV Format Instructions:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Download the template to see the correct format</li>
          <li>• Required fields: name, description, price, category, quantityAvailable</li>
          <li>• Use quotes around text that contains commas</li>
          <li>• Price should be a number (e.g., 299, not "₹299")</li>
          <li>• Categories: pickle, honey, grains, spices, dairy</li>
          <li>• Maximum 1000 products per upload</li>
        </ul>
      </div>
    </div>
  );
}