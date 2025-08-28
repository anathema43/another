import React, { useState, useRef } from 'react';
import { CloudArrowUpIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cloudinaryService } from '../services/cloudinaryService';

export default function ImageUpload({ 
  onImageUploaded, 
  onError, 
  currentImage = null,
  folder = 'products',
  className = '' 
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentImage);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size is 50MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    try {
      validateFile(file);
    } catch (error) {
      if (onError) {
        onError(error.message);
      }
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary or use direct URL
    if (cloudinaryService && typeof cloudinaryService.uploadImage === 'function') {
      uploadToCloudinary(file);
    } else {
      // Fallback: use the preview URL directly
      if (onImageUploaded) {
        onImageUploaded({
          publicId: `local_${Date.now()}`,
          secureUrl: URL.createObjectURL(file),
          optimizedUrl: URL.createObjectURL(file)
        });
      }
    }
  };

  const uploadToCloudinary = async (file) => {
    setUploading(true);
    setProgress(0);

    try {
      // Check if Cloudinary service is available
      if (!cloudinaryService || typeof cloudinaryService.uploadImage !== 'function') {
        throw new Error('Cloudinary service not configured. Using local upload instead.');
      }

      const result = await cloudinaryService.uploadImage(
        file,
        (progressPercent) => setProgress(progressPercent),
        { 
          folder,
          tags: ['ramro-product', 'admin-upload']
        }
      );

      // Call parent callback with upload result
      if (onImageUploaded) {
        onImageUploaded({
          publicId: result.publicId,
          secureUrl: result.secureUrl,
          optimizedUrl: cloudinaryService.getOptimizedUrl(result.publicId, {
            width: 800,
            height: 800,
            quality: 'auto'
          })
        });
      }

      setPreview(result.secureUrl);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Fallback to local file URL if Cloudinary fails
      const localUrl = URL.createObjectURL(file);
      if (onImageUploaded) {
        onImageUploaded({
          publicId: `local_${Date.now()}`,
          secureUrl: localUrl,
          optimizedUrl: localUrl
        });
      }
      
      setPreview(localUrl);
      
      if (onError) {
        onError(`Cloudinary upload failed, using local file: ${error.message}`);
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    setPreview(null);
    if (onImageUploaded) {
      onImageUploaded(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`} data-cy="image-upload-section">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragOver
            ? 'border-organic-primary bg-organic-primary bg-opacity-5'
            : 'border-gray-300 hover:border-organic-primary'
        } ${uploading ? 'pointer-events-none opacity-75' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        data-cy="image-upload-dropzone"
      >
        {preview ? (
          // Image Preview
          <div className="relative" data-cy="image-preview">
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-48 object-cover rounded-lg"
              data-cy="uploaded-image"
            />
            {!uploading && (
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="Remove image"
                data-cy="remove-image-button"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <div className="mb-2">Uploading...</div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-organic-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-sm mt-1" data-cy="upload-percentage">{progress}%</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Upload Prompt
          <div className="text-center">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Drop an image here, or{' '}
                  <span className="text-organic-primary hover:text-organic-primary-dark">
                    browse to upload
                  </span>
                </span>
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG, WebP up to 50MB
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-cy="upload-progress">
          <div className="flex items-center">
            <PhotoIcon className="w-5 h-5 text-blue-600 mr-2" />
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-blue-800">Uploading to Cloudinary...</span>
                <span className="text-blue-600">{progress}%</span>
              </div>
              <div className="mt-1 w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Images will be automatically optimized for web delivery</p>
        <p>• Multiple sizes will be generated for responsive design</p>
        <p>• Supported formats: JPEG, PNG, WebP</p>
      </div>
    </div>
  );
}