// Utility functions for handling login/signup redirects

/**
 * Save the current path for redirect after login/signup
 * @param {string} path - The path to save for redirect
 */
export const saveRedirectPath = (path) => {
  // Don't save login/signup paths as redirect targets
  if (path === '/login' || path === '/signup') {
    return;
  }
  
  try {
    sessionStorage.setItem('redirectPath', path);
  } catch (error) {
    console.warn('Failed to save redirect path:', error);
  }
};

/**
 * Get the saved redirect path and clear it from storage
 * @returns {string|null} The saved redirect path or null
 */
export const getAndClearRedirectPath = () => {
  try {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      return redirectPath;
    }
  } catch (error) {
    console.warn('Failed to get redirect path:', error);
  }
  return null;
};

/**
 * Determine where to redirect user after successful authentication
 * @param {Object} userProfile - User profile object with role
 * @param {string} savedRedirectPath - Previously saved redirect path
 * @returns {string} The path to redirect to
 */
export const determineRedirectPath = (userProfile, savedRedirectPath) => {
  // Admin users always go to admin panel
  if (userProfile?.role === 'admin') {
    return '/admin';
  }
  
  // Regular users go to saved path or home
  return savedRedirectPath || '/';
};

/**
 * Check if a path is a valid redirect target
 * @param {string} path - The path to validate
 * @returns {boolean} Whether the path is valid for redirect
 */
export const isValidRedirectPath = (path) => {
  if (!path || typeof path !== 'string') {
    return false;
  }
  
  // Don't redirect to auth pages
  const invalidPaths = ['/login', '/signup', '/logout'];
  return !invalidPaths.includes(path);
};