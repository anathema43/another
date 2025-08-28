// Image utility functions for responsive images
export const IMAGE_SIZES = {
  small: 400,    // Mobile phones
  medium: 800,   // Tablets
  large: 1200,   // Desktop
  xlarge: 1600   // Large screens
};

export const BREAKPOINTS = {
  mobile: '(max-width: 768px)',
  tablet: '(max-width: 1024px)', 
  desktop: '(max-width: 1440px)',
  large: '(min-width: 1441px)'
};

/**
 * Generate responsive image URLs for different sizes
 * Works with Cloudinary, Pexels, and other image services
 */
export const generateResponsiveUrls = (originalUrl) => {
  if (!originalUrl) return null;

  // Handle Cloudinary URLs
  if (originalUrl.includes('cloudinary.com')) {
    return {
      small: originalUrl.replace('/upload/', `/upload/w_${IMAGE_SIZES.small},h_${IMAGE_SIZES.small},c_fill,f_auto,q_auto/`),
      medium: originalUrl.replace('/upload/', `/upload/w_${IMAGE_SIZES.medium},h_${IMAGE_SIZES.medium},c_fill,f_auto,q_auto/`),
      large: originalUrl.replace('/upload/', `/upload/w_${IMAGE_SIZES.large},h_${IMAGE_SIZES.large},c_fill,f_auto,q_auto/`),
      xlarge: originalUrl.replace('/upload/', `/upload/w_${IMAGE_SIZES.xlarge},h_${IMAGE_SIZES.xlarge},c_fill,f_auto,q_auto/`)
    };
  }

  // Handle Pexels URLs (add size parameters)
  if (originalUrl.includes('pexels.com')) {
    const baseUrl = originalUrl.split('?')[0];
    return {
      small: `${baseUrl}?auto=compress&cs=tinysrgb&w=${IMAGE_SIZES.small}`,
      medium: `${baseUrl}?auto=compress&cs=tinysrgb&w=${IMAGE_SIZES.medium}`,
      large: `${baseUrl}?auto=compress&cs=tinysrgb&w=${IMAGE_SIZES.large}`,
      xlarge: `${baseUrl}?auto=compress&cs=tinysrgb&w=${IMAGE_SIZES.xlarge}`
    };
  }

  // Handle Firebase Storage URLs (if using resize extension)
  if (originalUrl.includes('firebasestorage.googleapis.com')) {
    return {
      small: `${originalUrl}_${IMAGE_SIZES.small}x${IMAGE_SIZES.small}`,
      medium: `${originalUrl}_${IMAGE_SIZES.medium}x${IMAGE_SIZES.medium}`,
      large: `${originalUrl}_${IMAGE_SIZES.large}x${IMAGE_SIZES.large}`,
      xlarge: `${originalUrl}_${IMAGE_SIZES.xlarge}x${IMAGE_SIZES.xlarge}`
    };
  }

  // Fallback: return original URL for all sizes
  return {
    small: originalUrl,
    medium: originalUrl,
    large: originalUrl,
    xlarge: originalUrl
  };
};

/**
 * Generate srcSet string for responsive images
 */
export const generateSrcSet = (imageUrls) => {
  if (!imageUrls) return '';
  
  return [
    `${imageUrls.small} ${IMAGE_SIZES.small}w`,
    `${imageUrls.medium} ${IMAGE_SIZES.medium}w`, 
    `${imageUrls.large} ${IMAGE_SIZES.large}w`,
    `${imageUrls.xlarge} ${IMAGE_SIZES.xlarge}w`
  ].join(', ');
};

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizes = (customSizes = null) => {
  if (customSizes) return customSizes;
  
  return [
    `${BREAKPOINTS.mobile} ${IMAGE_SIZES.small}px`,
    `${BREAKPOINTS.tablet} ${IMAGE_SIZES.medium}px`,
    `${BREAKPOINTS.desktop} ${IMAGE_SIZES.large}px`,
    `${IMAGE_SIZES.xlarge}px`
  ].join(', ');
};

/**
 * Get optimal image size based on container width
 */
export const getOptimalSize = (containerWidth) => {
  if (containerWidth <= 400) return 'small';
  if (containerWidth <= 800) return 'medium';
  if (containerWidth <= 1200) return 'large';
  return 'xlarge';
};

/**
 * Preload critical images for better performance
 */
export const preloadImage = (imageUrl, sizes = 'medium') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = typeof imageUrl === 'string' ? imageUrl : imageUrl[sizes];
  document.head.appendChild(link);
};

/**
 * Lazy load images with Intersection Observer
 */
export const setupLazyLoading = () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.srcset = img.dataset.srcset;
        img.classList.remove('lazy');
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px' // Start loading 50px before image comes into view
  });

  images.forEach(img => imageObserver.observe(img));
};

/**
 * Handle image loading errors with fallback
 */
export const handleImageError = (event, fallbackUrl = '/images/placeholder.jpg') => {
  const img = event.target;
  if (img.src !== fallbackUrl) {
    img.src = fallbackUrl;
    img.alt = 'Image not available';
  }
};