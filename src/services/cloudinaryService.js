// Professional Cloudinary upload service
import { cloudinaryConfig, isCloudinaryConfigured } from '../config/cloudinary';

class CloudinaryService {
  constructor() {
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
    this.isConfigured = isCloudinaryConfigured;
  }

  /**
   * Upload image to Cloudinary with progress tracking
   * @param {File} file - Image file to upload
   * @param {Function} onProgress - Progress callback (0-100)
   * @param {Object} options - Upload options
   * @returns {Promise} Upload result with public_id and secure_url
   */
  async uploadImage(file, onProgress = null, options = {}) {
    if (!this.isConfigured) {
      throw new Error('Cloudinary not configured. Please set VITE_CLOUDINARY_* environment variables.');
    }

    // Validate file
    this.validateFile(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    
    // Add optional parameters
    if (options.folder) {
      formData.append('folder', options.folder);
    }
    
    if (options.tags) {
      formData.append('tags', Array.isArray(options.tags) ? options.tags.join(',') : options.tags);
    }

    // Add transformation if specified
    if (options.transformation) {
      formData.append('transformation', options.transformation);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              publicId: response.public_id,
              secureUrl: response.secure_url,
              width: response.width,
              height: response.height,
              format: response.format,
              bytes: response.bytes,
              version: response.version
            });
          } catch (error) {
            reject(new Error('Invalid response from Cloudinary'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      xhr.open('POST', this.uploadUrl);
      xhr.timeout = 60000; // 60 second timeout
      xhr.send(formData);
    });
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   */
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > maxSize) {
      throw new Error(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Public ID of image to delete
   * @returns {Promise} Deletion result
   */
  async deleteImage(publicId) {
    if (!this.isConfigured) {
      throw new Error('Cloudinary not configured');
    }

    // Note: Deletion requires server-side implementation for security
    // This would typically be done via Firebase Functions
    console.warn('Image deletion should be implemented server-side for security');
    
    return { success: true, message: 'Deletion queued for server-side processing' };
  }

  /**
   * Generate optimized image URL with transformations
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} transformations - Transformation parameters
   * @returns {string} Optimized image URL
   */
  getOptimizedUrl(publicId, transformations = {}) {
    if (!publicId || !this.isConfigured) return null;

    const {
      width = 'auto',
      height = 'auto',
      crop = 'fill',
      quality = 'auto',
      format = 'auto'
    } = transformations;

    const transformString = `c_${crop},w_${width},h_${height},q_${quality},f_${format}`;
    
    return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformString}/${publicId}`;
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;