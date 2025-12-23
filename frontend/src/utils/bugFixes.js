// Bug fixes and patches for common issues

// Fix for React 18 StrictMode double rendering
export const fixStrictModeIssues = () => {
  // Track component mounts to prevent double API calls
  const mountedComponents = new Set();
  
  return {
    trackMount: (componentId) => {
      if (mountedComponents.has(componentId)) {
        return false; // Already mounted, skip initialization
      }
      mountedComponents.add(componentId);
      return true; // First mount, proceed with initialization
    },
    
    trackUnmount: (componentId) => {
      mountedComponents.delete(componentId);
    }
  };
};

// Fix for memory leaks in event listeners
export const createCleanupManager = () => {
  const cleanupFunctions = [];
  
  return {
    addCleanup: (cleanupFn) => {
      cleanupFunctions.push(cleanupFn);
    },
    
    cleanup: () => {
      cleanupFunctions.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.warn('Cleanup function failed:', error);
        }
      });
      cleanupFunctions.length = 0;
    }
  };
};

// Fix for iOS Safari viewport height issues
export const fixIOSViewportHeight = () => {
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setViewportHeight();
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
  });
  
  return () => {
    window.removeEventListener('resize', setViewportHeight);
    window.removeEventListener('orientationchange', setViewportHeight);
  };
};

// Fix for form validation edge cases
export const fixFormValidation = () => {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Fix for autofill detection
      const checkAutofill = () => {
        if (input.matches(':-webkit-autofill')) {
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };
      
      // Check periodically for autofill
      const autofillInterval = setInterval(checkAutofill, 100);
      
      // Clear interval when input is focused or form is submitted
      input.addEventListener('focus', () => clearInterval(autofillInterval));
      form.addEventListener('submit', () => clearInterval(autofillInterval));
      
      // Fix for iOS Safari date input issues
      if (input.type === 'date' && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
        input.addEventListener('blur', () => {
          if (input.value) {
            input.setAttribute('data-has-value', 'true');
          } else {
            input.removeAttribute('data-has-value');
          }
        });
      }
      
      // Fix for number input spinner issues on mobile
      if (input.type === 'number') {
        input.addEventListener('wheel', (e) => {
          e.preventDefault();
        }, { passive: false });
      }
    });
  });
};

// Fix for scroll restoration issues
export const fixScrollRestoration = () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  const scrollPositions = new Map();
  
  const saveScrollPosition = (key) => {
    scrollPositions.set(key, {
      x: window.scrollX,
      y: window.scrollY
    });
  };
  
  const restoreScrollPosition = (key) => {
    const position = scrollPositions.get(key);
    if (position) {
      window.scrollTo(position.x, position.y);
    }
  };
  
  return { saveScrollPosition, restoreScrollPosition };
};

// Fix for touch event conflicts
export const fixTouchEventConflicts = () => {
  let touchStartY = 0;
  let touchEndY = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener('touchmove', (e) => {
    touchEndY = e.touches[0].clientY;
    
    // Prevent pull-to-refresh on iOS Safari
    if (touchStartY <= touchEndY && window.scrollY === 0) {
      e.preventDefault();
    }
  }, { passive: false });
};

// Fix for focus management issues
export const fixFocusManagement = () => {
  let lastFocusedElement = null;
  
  // Track last focused element
  document.addEventListener('focusin', (e) => {
    lastFocusedElement = e.target;
  });
  
  // Fix for modal focus trapping
  const trapFocus = (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    };
  };
  
  return { trapFocus };
};

// Fix for API request race conditions
export const createRequestManager = () => {
  const pendingRequests = new Map();
  
  const makeRequest = async (key, requestFn) => {
    // Cancel previous request with same key
    if (pendingRequests.has(key)) {
      pendingRequests.get(key).abort();
    }
    
    const controller = new AbortController();
    pendingRequests.set(key, controller);
    
    try {
      const result = await requestFn(controller.signal);
      pendingRequests.delete(key);
      return result;
    } catch (error) {
      pendingRequests.delete(key);
      if (error.name !== 'AbortError') {
        throw error;
      }
    }
  };
  
  const cancelRequest = (key) => {
    if (pendingRequests.has(key)) {
      pendingRequests.get(key).abort();
      pendingRequests.delete(key);
    }
  };
  
  const cancelAllRequests = () => {
    pendingRequests.forEach(controller => controller.abort());
    pendingRequests.clear();
  };
  
  return { makeRequest, cancelRequest, cancelAllRequests };
};

// Fix for date/time handling across timezones
export const fixDateTimeHandling = () => {
  const formatDateForInput = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    // Format as YYYY-MM-DD for date inputs
    return d.toISOString().split('T')[0];
  };
  
  const formatTimeForInput = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    // Format as HH:MM for time inputs
    return d.toTimeString().slice(0, 5);
  };
  
  const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    
    // Parse date as local time, not UTC
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  const formatDisplayDate = (date, options = {}) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    });
  };
  
  return {
    formatDateForInput,
    formatTimeForInput,
    parseLocalDate,
    formatDisplayDate
  };
};

// Fix for image loading issues
export const fixImageLoading = () => {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Add error handling
    img.addEventListener('error', () => {
      img.src = '/placeholder-image.png'; // Fallback image
      img.alt = 'Image not available';
    });
    
    // Add loading state
    img.addEventListener('load', () => {
      img.classList.add('loaded');
    });
    
    // Lazy loading for images not in viewport
    if ('loading' in HTMLImageElement.prototype) {
      img.loading = 'lazy';
    } else {
      // Fallback for browsers without native lazy loading
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const image = entry.target;
            if (image.dataset.src) {
              image.src = image.dataset.src;
              image.removeAttribute('data-src');
            }
            imageObserver.unobserve(image);
          }
        });
      });
      
      if (img.dataset.src) {
        imageObserver.observe(img);
      }
    }
  });
};

// Fix for localStorage quota exceeded errors
export const fixLocalStorageQuota = () => {
  const safeSetItem = (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // Clear old items to make space
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          const v = localStorage.getItem(k);
          items.push({ key: k, value: v, size: v.length });
        }
        
        // Sort by size and remove largest items
        items.sort((a, b) => b.size - a.size);
        
        for (let i = 0; i < Math.min(5, items.length); i++) {
          localStorage.removeItem(items[i].key);
        }
        
        // Try again
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.warn('Failed to store data even after cleanup:', retryError);
          return false;
        }
      } else {
        console.warn('localStorage error:', error);
        return false;
      }
    }
  };
  
  const safeGetItem = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to retrieve from localStorage:', error);
      return null;
    }
  };
  
  return { safeSetItem, safeGetItem };
};

// Initialize all bug fixes
export const initializeBugFixes = () => {
  // Apply all fixes
  fixIOSViewportHeight();
  fixFormValidation();
  fixTouchEventConflicts();
  fixImageLoading();
  
  // Add CSS fixes
  const style = document.createElement('style');
  style.textContent = `
    /* Fix for iOS Safari 100vh issue */
    .full-height {
      height: 100vh;
      height: calc(var(--vh, 1vh) * 100);
    }
    
    /* Fix for autofill styling */
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px white inset !important;
      -webkit-text-fill-color: inherit !important;
    }
    
    /* Fix for number input spinners on mobile */
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    input[type="number"] {
      -moz-appearance: textfield;
    }
    
    /* Fix for iOS Safari date input */
    input[type="date"]:not([data-has-value])::-webkit-datetime-edit {
      color: transparent;
    }
    
    input[type="date"]:not([data-has-value]):before {
      content: attr(placeholder);
      color: #999;
    }
    
    /* Fix for touch targets */
    button, a, input, select, textarea, [role="button"] {
      min-height: 48px;
      min-width: 48px;
    }
    
    /* Fix for focus indicators */
    *:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    
    /* Fix for image loading */
    img {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    img.loaded {
      opacity: 1;
    }
    
    /* Fix for scroll behavior */
    html {
      scroll-behavior: smooth;
    }
    
    @media (prefers-reduced-motion: reduce) {
      html {
        scroll-behavior: auto;
      }
      
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  document.head.appendChild(style);
  
  console.log('Bug fixes initialized');
};

// Export utilities for use in components
export const bugFixUtils = {
  strictMode: fixStrictModeIssues(),
  cleanup: createCleanupManager(),
  scroll: fixScrollRestoration(),
  focus: fixFocusManagement(),
  requests: createRequestManager(),
  dateTime: fixDateTimeHandling(),
  storage: fixLocalStorageQuota()
};