// Accessibility improvements and WCAG compliance utilities

// ARIA live region manager
export class LiveRegionManager {
  constructor() {
    this.regions = new Map();
    this.createLiveRegions();
  }
  
  createLiveRegions() {
    // Create polite live region
    const politeRegion = document.createElement('div');
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.className = 'sr-only';
    politeRegion.id = 'live-region-polite';
    document.body.appendChild(politeRegion);
    this.regions.set('polite', politeRegion);
    
    // Create assertive live region
    const assertiveRegion = document.createElement('div');
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    assertiveRegion.id = 'live-region-assertive';
    document.body.appendChild(assertiveRegion);
    this.regions.set('assertive', assertiveRegion);
  }
  
  announce(message, priority = 'polite') {
    const region = this.regions.get(priority);
    if (region) {
      region.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }
}

// Global live region instance
export const liveRegion = new LiveRegionManager();

// Keyboard navigation manager
export class KeyboardNavigationManager {
  constructor() {
    this.focusableElements = [
      'button',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
  }
  
  getFocusableElements(container = document) {
    return Array.from(container.querySelectorAll(this.focusableElements))
      .filter(el => this.isVisible(el) && !el.disabled);
  }
  
  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }
  
  trapFocus(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return () => {};
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e) => {
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
      
      if (e.key === 'Escape') {
        this.restoreFocus();
      }
    };
    
    this.previousFocus = document.activeElement;
    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      this.restoreFocus();
    };
  }
  
  restoreFocus() {
    if (this.previousFocus && this.isVisible(this.previousFocus)) {
      this.previousFocus.focus();
    }
  }
  
  createSkipLink(targetId, text = 'Skip to main content') {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView();
      }
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    return skipLink;
  }
}

// Global keyboard navigation instance
export const keyboardNav = new KeyboardNavigationManager();

// Color contrast checker
export const checkColorContrast = (foreground, background) => {
  const getLuminance = (color) => {
    const rgb = color.match(/\d+/g).map(Number);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio: ratio.toFixed(2),
    AA: ratio >= 4.5,
    AAA: ratio >= 7,
    AALarge: ratio >= 3,
    AAALarge: ratio >= 4.5
  };
};

// Form accessibility enhancements
export const enhanceFormAccessibility = () => {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    // Add form validation announcements
    form.addEventListener('submit', (e) => {
      const invalidInputs = form.querySelectorAll(':invalid');
      if (invalidInputs.length > 0) {
        e.preventDefault();
        const firstInvalid = invalidInputs[0];
        firstInvalid.focus();
        liveRegion.announce(`Form has ${invalidInputs.length} error${invalidInputs.length > 1 ? 's' : ''}. Please check your input.`, 'assertive');
      }
    });
    
    // Enhance input labels and descriptions
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      // Ensure proper labeling
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        const label = form.querySelector(`label[for="${input.id}"]`);
        if (!label && input.id) {
          console.warn(`Input with id "${input.id}" has no associated label`);
        }
      }
      
      // Add error message association
      input.addEventListener('invalid', () => {
        const errorId = `${input.id}-error`;
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.id = errorId;
          errorElement.className = 'error-message';
          errorElement.setAttribute('role', 'alert');
          input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
        
        errorElement.textContent = input.validationMessage;
        input.setAttribute('aria-describedby', errorId);
        input.setAttribute('aria-invalid', 'true');
      });
      
      input.addEventListener('input', () => {
        if (input.validity.valid) {
          input.removeAttribute('aria-invalid');
          const errorElement = document.getElementById(`${input.id}-error`);
          if (errorElement) {
            errorElement.textContent = '';
          }
        }
      });
    });
  });
};

// Table accessibility enhancements
export const enhanceTableAccessibility = () => {
  const tables = document.querySelectorAll('table');
  
  tables.forEach(table => {
    // Add table caption if missing
    if (!table.querySelector('caption')) {
      const caption = document.createElement('caption');
      caption.textContent = 'Data table';
      caption.className = 'sr-only';
      table.insertBefore(caption, table.firstChild);
    }
    
    // Enhance headers
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
      if (!header.id) {
        header.id = `header-${index}`;
      }
      if (!header.getAttribute('scope')) {
        header.setAttribute('scope', 'col');
      }
    });
    
    // Associate cells with headers
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, index) => {
        const header = headers[index];
        if (header && !cell.getAttribute('headers')) {
          cell.setAttribute('headers', header.id);
        }
      });
    });
  });
};

// Image accessibility enhancements
export const enhanceImageAccessibility = () => {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Check for alt text
    if (!img.hasAttribute('alt')) {
      console.warn('Image missing alt attribute:', img.src);
      img.alt = ''; // Decorative image
    }
    
    // Check for meaningful alt text
    if (img.alt && (img.alt.toLowerCase().includes('image') || img.alt.toLowerCase().includes('picture'))) {
      console.warn('Alt text should not include "image" or "picture":', img.alt);
    }
    
    // Add loading announcement for important images
    if (img.alt && img.alt.trim() !== '') {
      img.addEventListener('load', () => {
        if (img.complete && img.naturalHeight !== 0) {
          // Image loaded successfully
        } else {
          liveRegion.announce('Image failed to load', 'polite');
        }
      });
    }
  });
};

// Heading structure validator
export const validateHeadingStructure = () => {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const issues = [];
  let previousLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    
    if (index === 0 && level !== 1) {
      issues.push('Page should start with h1');
    }
    
    if (level > previousLevel + 1) {
      issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
    }
    
    if (!heading.textContent.trim()) {
      issues.push('Empty heading found');
    }
    
    previousLevel = level;
  });
  
  if (issues.length > 0) {
    console.warn('Heading structure issues:', issues);
  }
  
  return issues;
};

// Focus management for SPAs
export const manageFocusForSPA = () => {
  let previousUrl = window.location.href;
  
  const handleRouteChange = () => {
    const currentUrl = window.location.href;
    
    if (currentUrl !== previousUrl) {
      previousUrl = currentUrl;
      
      // Focus on main heading or main content
      const mainHeading = document.querySelector('h1');
      const mainContent = document.querySelector('main, [role="main"]');
      
      if (mainHeading) {
        mainHeading.focus();
        mainHeading.scrollIntoView();
      } else if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView();
      }
      
      // Announce page change
      const pageTitle = document.title;
      liveRegion.announce(`Navigated to ${pageTitle}`, 'polite');
    }
  };
  
  // Listen for navigation events
  window.addEventListener('popstate', handleRouteChange);
  
  // For React Router or similar
  const observer = new MutationObserver(() => {
    handleRouteChange();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return () => {
    window.removeEventListener('popstate', handleRouteChange);
    observer.disconnect();
  };
};

// Reduced motion preferences
export const respectReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const updateMotionPreference = () => {
    if (prefersReducedMotion.matches) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  };
  
  updateMotionPreference();
  prefersReducedMotion.addEventListener('change', updateMotionPreference);
  
  return () => {
    prefersReducedMotion.removeEventListener('change', updateMotionPreference);
  };
};

// Initialize all accessibility enhancements
export const initializeAccessibility = () => {
  // Add screen reader only styles
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }
    
    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
      border-radius: 4px;
    }
    
    .skip-link:focus {
      top: 6px;
    }
    
    .reduce-motion * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    .error-message {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    [aria-invalid="true"] {
      border-color: #dc2626 !important;
      box-shadow: 0 0 0 1px #dc2626 !important;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      * {
        border-color: ButtonText !important;
      }
      
      button, input, select, textarea {
        background: ButtonFace !important;
        color: ButtonText !important;
        border: 2px solid ButtonText !important;
      }
    }
    
    /* Focus indicators */
    *:focus {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px !important;
    }
    
    button:focus, a:focus {
      outline-offset: 4px !important;
    }
  `;
  document.head.appendChild(style);
  
  // Create skip link
  const mainContent = document.querySelector('main, [role="main"]');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main-content';
  }
  if (mainContent) {
    keyboardNav.createSkipLink('main-content');
  }
  
  // Apply enhancements
  enhanceFormAccessibility();
  enhanceTableAccessibility();
  enhanceImageAccessibility();
  validateHeadingStructure();
  manageFocusForSPA();
  respectReducedMotion();
  
  // Set page language if not set
  if (!document.documentElement.lang) {
    document.documentElement.lang = 'en';
  }
  
  console.log('Accessibility enhancements initialized');
};