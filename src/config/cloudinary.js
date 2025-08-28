// Cloudinary configuration for professional image management
const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET, // Only for server-side
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ramro_products'
};

// Check if Cloudinary is configured
const isCloudinaryConfigured = cloudinaryConfig.cloudName && 
  cloudinaryConfig.uploadPreset &&
  !cloudinaryConfig.cloudName.includes('placeholder');

if (!isCloudinaryConfigured) {
  console.info('ℹ️ Cloudinary not configured yet. Image upload features will be available once VITE_CLOUDINARY_* variables are set.');
}

// Cloudinary transformation presets for different use cases
export const transformations = {
  productThumbnail: 'c_fill,w_300,h_300,q_auto,f_auto',
  productMedium: 'c_fill,w_600,h_600,q_auto,f_auto',
  productLarge: 'c_fill,w_1200,h_1200,q_auto,f_auto',
  productHero: 'c_fill,w_1600,h_900,q_auto,f_auto'
};

// Generate Cloudinary URLs with transformations
export const generateCloudinaryUrl = (publicId, transformation = 'productMedium') => {
  if (!publicId || !cloudinaryConfig.cloudName) return null;
  
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformation}/${publicId}`;
};

// Generate responsive image URLs for different screen sizes
export const generateResponsiveCloudinaryUrls = (publicId) => {
  if (!publicId) return null;
  
  return {
    thumbnail: generateCloudinaryUrl(publicId, transformations.productThumbnail),
    medium: generateCloudinaryUrl(publicId, transformations.productMedium),
    large: generateCloudinaryUrl(publicId, transformations.productLarge),
    hero: generateCloudinaryUrl(publicId, transformations.productHero)
  };
};

export { cloudinaryConfig, isCloudinaryConfigured };
export default cloudinaryConfig;