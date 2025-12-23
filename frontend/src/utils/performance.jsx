// Performance monitoring and optimization utilities

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = {};
  }

  // Start timing an operation
  startTiming(name) {
    this.metrics[name] = {
      startTime: performance.now(),
      endTime: null,
      duration: null
    };
  }

  // End timing an operation
  endTiming(name) {
    if (this.metrics[name]) {
      this.metrics[name].endTime = performance.now();
      this.metrics[name].duration = this.metrics[name].endTime - this.metrics[name].startTime;
      
      // Log slow operations (> 1000ms)
      if (this.metrics[name].duration > 1000) {
        console.warn(`Slow operation detected: ${name} took ${this.metrics[name].duration.toFixed(2)}ms`);
      }
    }
  }

  // Get timing for an operation
  getTiming(name) {
    return this.metrics[name];
  }

  // Get all metrics
  getAllMetrics() {
    return this.metrics;
  }

  // Monitor Core Web Vitals
  observeWebVitals() {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Debounce utility for performance optimization
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle utility for performance optimization
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Image lazy loading utility
export const lazyLoadImage = (img, src) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = src;
        image.classList.remove('lazy');
        imageObserver.unobserve(image);
      }
    });
  });

  imageObserver.observe(img);
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = performance.memory;
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
  }
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if ('getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(resource => 
      resource.name.includes('.js') && resource.transferSize
    );
    
    const totalSize = jsResources.reduce((total, resource) => 
      total + resource.transferSize, 0
    );
    
    console.log('Bundle Analysis:', {
      totalJSSize: `${(totalSize / 1024).toFixed(2)} KB`,
      resourceCount: jsResources.length,
      resources: jsResources.map(r => ({
        name: r.name.split('/').pop(),
        size: `${(r.transferSize / 1024).toFixed(2)} KB`
      }))
    });
  }
};

// API call performance wrapper
export const withPerformanceTracking = (apiCall, name) => {
  return async (...args) => {
    performanceMonitor.startTiming(name);
    try {
      const result = await apiCall(...args);
      performanceMonitor.endTiming(name);
      return result;
    } catch (error) {
      performanceMonitor.endTiming(name);
      throw error;
    }
  };
};

// React component performance wrapper
export const withComponentPerformance = (Component, componentName) => {
  return (props) => {
    const renderStart = performance.now();
    
    React.useEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    });

    return <Component {...props} />;
  };
};