// Mobile optimization utilities

// Touch gesture handling
export class TouchGestureHandler {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      swipeThreshold: 50,
      tapTimeout: 300,
      doubleTapTimeout: 300,
      ...options
    };
    
    this.touchStart = null;
    this.touchEnd = null;
    this.lastTap = 0;
    
    this.bindEvents();
  }
  
  bindEvents() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
  }
  
  handleTouchStart(e) {
    this.touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  }
  
  handleTouchMove(e) {
    if (!this.touchStart) return;
    
    this.touchEnd = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  }
  
  handleTouchEnd(e) {
    if (!this.touchStart) return;
    
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - this.touchStart.time;
    
    if (!this.touchEnd) {
      // Simple tap
      if (touchDuration < this.options.tapTimeout) {
        this.handleTap(e);
      }
    } else {
      // Swipe gesture
      const deltaX = this.touchEnd.x - this.touchStart.x;
      const deltaY = this.touchEnd.y - this.touchStart.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > this.options.swipeThreshold) {
        this.handleSwipe(deltaX, deltaY, e);
      }
    }
    
    this.touchStart = null;
    this.touchEnd = null;
  }
  
  handleTap(e) {
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTap;
    
    if (timeSinceLastTap < this.options.doubleTapTimeout) {
      this.onDoubleTap?.(e);
    } else {
      this.onTap?.(e);
    }
    
    this.lastTap = now;
  }
  
  handleSwipe(deltaX, deltaY, e) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.onSwipeRight?.(e);
      } else {
        this.onSwipeLeft?.(e);
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        this.onSwipeDown?.(e);
      } else {
        this.onSwipeUp?.(e);
      }
    }
  }
  
  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
  }
}

// Viewport utilities
export const getViewportInfo = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    devicePixelRatio: window.devicePixelRatio || 1,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024
  };
};

// Safe area handling for notched devices
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
  };
};

// Touch target optimization
export const optimizeTouchTargets = () => {
  const minTouchSize = 48; // 48px minimum as per WCAG guidelines
  
  const elements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
  
  elements.forEach(element => {
    const rect = element.getBoundingClientRect();
    
    if (rect.width < minTouchSize || rect.height < minTouchSize) {
      element.style.minWidth = `${minTouchSize}px`;
      element.style.minHeight = `${minTouchSize}px`;
      element.style.display = 'inline-flex';
      element.style.alignItems = 'center';
      element.style.justifyContent = 'center';
    }
  });
};

// Keyboard handling for mobile
export const handleVirtualKeyboard = () => {
  let initialViewportHeight = window.innerHeight;
  
  const handleResize = () => {
    const currentHeight = window.innerHeight;
    const heightDifference = initialViewportHeight - currentHeight;
    
    // If height decreased significantly, keyboard is likely open
    if (heightDifference > 150) {
      document.body.classList.add('keyboard-open');
      document.documentElement.style.setProperty('--keyboard-height', `${heightDifference}px`);
    } else {
      document.body.classList.remove('keyboard-open');
      document.documentElement.style.removeProperty('--keyboard-height');
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  // Handle input focus/blur
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  });
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
};

// Performance optimization for mobile
export const optimizeForMobile = () => {
  // Reduce animations on low-end devices
  if (navigator.hardwareConcurrency <= 2) {
    document.body.classList.add('reduced-motion');
  }
  
  // Optimize scroll performance
  const scrollElements = document.querySelectorAll('[data-scroll]');
  scrollElements.forEach(element => {
    element.style.willChange = 'transform';
    element.style.transform = 'translateZ(0)'; // Force hardware acceleration
  });
  
  // Lazy load images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
  
  // Optimize touch events
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('touchmove', () => {}, { passive: true });
};

// Network-aware loading
export const getNetworkInfo = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return { effectiveType: 'unknown', downlink: 0, rtt: 0 };
  }
  
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };
};

// Adaptive loading based on network
export const adaptiveLoad = (highQualityCallback, lowQualityCallback) => {
  const network = getNetworkInfo();
  
  if (network.saveData || network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
    lowQualityCallback();
  } else {
    highQualityCallback();
  }
};

// Mobile-specific form enhancements
export const enhanceMobileForms = () => {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Add appropriate input modes
      if (input.type === 'email') {
        input.setAttribute('inputmode', 'email');
      } else if (input.type === 'tel') {
        input.setAttribute('inputmode', 'tel');
      } else if (input.type === 'number') {
        input.setAttribute('inputmode', 'numeric');
      }
      
      // Add autocomplete attributes
      if (input.name === 'email') {
        input.setAttribute('autocomplete', 'email');
      } else if (input.name === 'phone') {
        input.setAttribute('autocomplete', 'tel');
      } else if (input.name === 'name') {
        input.setAttribute('autocomplete', 'name');
      }
      
      // Prevent zoom on focus for iOS
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        input.addEventListener('focus', () => {
          if (parseFloat(getComputedStyle(input).fontSize) < 16) {
            input.style.fontSize = '16px';
          }
        });
      }
    });
  });
};

// Haptic feedback (if supported)
export const triggerHapticFeedback = (type = 'light') => {
  if ('vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'heavy':
        navigator.vibrate(50);
        break;
      case 'success':
        navigator.vibrate([10, 50, 10]);
        break;
      case 'error':
        navigator.vibrate([50, 50, 50]);
        break;
    }
  }
};

// Mobile navigation helpers
export const createMobileNavigation = (menuButton, menu) => {
  let isOpen = false;
  
  const toggleMenu = () => {
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    menuButton.setAttribute('aria-expanded', isOpen);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      triggerHapticFeedback('light');
    } else {
      document.body.style.overflow = '';
    }
  };
  
  const closeMenu = () => {
    if (isOpen) {
      isOpen = false;
      menu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  };
  
  menuButton.addEventListener('click', toggleMenu);
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (isOpen && !menu.contains(e.target) && !menuButton.contains(e.target)) {
      closeMenu();
    }
  });
  
  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
    }
  });
  
  return { toggleMenu, closeMenu };
};

// Initialize all mobile optimizations
export const initializeMobileOptimizations = () => {
  // Set viewport meta tag if not present
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewport);
  }
  
  // Add CSS custom properties for safe areas
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --safe-area-inset-top: env(safe-area-inset-top);
      --safe-area-inset-right: env(safe-area-inset-right);
      --safe-area-inset-bottom: env(safe-area-inset-bottom);
      --safe-area-inset-left: env(safe-area-inset-left);
    }
    
    .keyboard-open {
      height: calc(100vh - var(--keyboard-height, 0px));
    }
    
    .reduced-motion * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  `;
  document.head.appendChild(style);
  
  // Initialize optimizations
  optimizeTouchTargets();
  optimizeForMobile();
  enhanceMobileForms();
  handleVirtualKeyboard();
  
  console.log('Mobile optimizations initialized');
};