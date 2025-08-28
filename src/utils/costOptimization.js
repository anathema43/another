// Cost Optimization Utilities for Ramro E-commerce
// Implements immediate cost-saving measures

// 1. Firebase Query Optimization
const optimizedQueries = {
  // Cache products locally to reduce Firestore reads
  getProductsWithCache: async () => {
    const CACHE_KEY = 'ramro_products_cache';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    const cached = localStorage.getItem(CACHE_KEY);
    const cacheTime = localStorage.getItem(`${CACHE_KEY}_time`);
    
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < CACHE_DURATION) {
      return JSON.parse(cached);
    }
    
    // Fetch from Firebase with optimized query
    const { collection, getDocs, query, where, orderBy, limit } = await import('firebase/firestore');
    const { db } = await import('../firebase/firebase');
    
    if (!db) return [];
    
    const products = await getDocs(query(
      collection(db, "products"),
      orderBy("featured", "desc"),
      limit(50) // Limit initial load
    ));
    
    const productData = products.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Cache the results
    localStorage.setItem(CACHE_KEY, JSON.stringify(productData));
    localStorage.setItem(`${CACHE_KEY}_time`, Date.now().toString());
    
    return productData;
  },

  // Batch write operations to reduce costs
  batchUpdateInventory: async (updates) => {
    const { writeBatch, doc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('../firebase/firebase');
    
    if (!db) return;
    
    const batch = writeBatch(db);
    
    updates.forEach(({ productId, quantity }) => {
      const productRef = doc(db, "products", productId);
      batch.update(productRef, { 
        quantityAvailable: quantity,
        lastUpdated: serverTimestamp()
      });
    });
    
    await batch.commit();
  }
};

// 2. Image Optimization
const imageOptimization = {
  // Compress images before upload
  compressImage: (file, quality = 0.7, maxWidth = 800) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  },

  // Lazy load images
  setupLazyLoading: () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
};

// 3. Bundle Optimization
const bundleOptimization = {
  // Code splitting for admin routes
  loadAdminModule: () => import('../pages/Admin'),
  loadOrdersModule: () => import('../pages/Orders'),
  
  // Preload critical resources
  preloadCriticalResources: () => {
    const criticalResources = [
      // Only preload resources that actually exist
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.includes('/api/') ? 'fetch' : 
               resource.includes('/images/') ? 'image' : 'font';
      document.head.appendChild(link);
    });
  }
};

// 4. Error Tracking (Free Alternative to Sentry)
const freeErrorTracking = {
  logError: (error, context = {}) => {
    const errorData = {
      message: error?.message || 'Unknown error message',
      stack: error?.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context
    };
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorData);
    }
    
    // Send to Firebase Analytics (free)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: error?.message || 'Unknown error',
        fatal: false,
        custom_map: { context: JSON.stringify(context) }
      });
    }
    
    // Store locally for batch sending
    const errors = JSON.parse(localStorage.getItem('error_log') || '[]');
    errors.push(errorData);
    
    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.splice(0, errors.length - 50);
    }
    
    localStorage.setItem('error_log', JSON.stringify(errors));
  },

  // Send error batch to server
  sendErrorBatch: async () => {
    const errors = JSON.parse(localStorage.getItem('error_log') || '[]');
    if (errors.length === 0) return;
    
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors })
      });
      
      // Clear sent errors
      localStorage.removeItem('error_log');
    } catch (err) {
      console.error('Failed to send error batch:', err);
    }
  }
};

// 5. Performance Monitoring
const performanceMonitoring = {
  // Track Core Web Vitals
  trackWebVitals: () => {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
      
      // Send to analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'web_vital', {
          name: 'LCP',
          value: Math.round(lastEntry.startTime),
          event_category: 'Performance'
        });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        console.log('FID:', fid);
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'web_vital', {
            name: 'FID',
            value: Math.round(fid),
            event_category: 'Performance'
          });
        }
      });
    }).observe({ entryTypes: ['first-input'] });
  },

  // Monitor Firebase costs
  trackFirebaseCosts: () => {
    let readCount = 0;
    let writeCount = 0;
    
    // Track monthly usage
    const usage = JSON.parse(localStorage.getItem('firebase_usage') || '{}');
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    if (!usage[currentMonth]) {
      usage[currentMonth] = { reads: 0, writes: 0 };
    }
    
    usage[currentMonth].reads += readCount;
    localStorage.setItem('firebase_usage', JSON.stringify(usage));
  }
};

// Initialize cost optimization on app start
export const initializeCostOptimization = () => {
  // Set up lazy loading
  imageOptimization.setupLazyLoading();
  
  // Preload critical resources
  bundleOptimization.preloadCriticalResources();
  
  // Start performance monitoring
  performanceMonitoring.trackWebVitals();
  performanceMonitoring.trackFirebaseCosts();
  
  // Set up error tracking
  window.addEventListener('error', (event) => {
    const errorObj = event.error || new Error(event.message || 'Unknown error');
    freeErrorTracking.logError(errorObj, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  // Send error batches every 5 minutes
  setInterval(() => {
    freeErrorTracking.sendErrorBatch();
  }, 5 * 60 * 1000);
  
  console.log('🎯 Cost optimization initialized - targeting 65% cost reduction');
};