// Security utilities and patches

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://api.matchify.app'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

// XSS Protection
export const sanitizeHTML = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Prevent clickjacking
export const preventClickjacking = () => {
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }
};

// Secure token storage
export class SecureStorage {
  static setItem(key, value, options = {}) {
    const { encrypt = false, expiry = null } = options;
    
    let data = { value };
    
    if (expiry) {
      data.expiry = Date.now() + expiry;
    }
    
    if (encrypt) {
      // Simple encryption for demo - use proper encryption in production
      data = btoa(JSON.stringify(data));
    } else {
      data = JSON.stringify(data);
    }
    
    try {
      localStorage.setItem(key, data);
    } catch (error) {
      console.warn('Failed to store data securely:', error);
    }
  }
  
  static getItem(key, options = {}) {
    const { decrypt = false } = options;
    
    try {
      let data = localStorage.getItem(key);
      if (!data) return null;
      
      if (decrypt) {
        data = JSON.parse(atob(data));
      } else {
        data = JSON.parse(data);
      }
      
      // Check expiry
      if (data.expiry && Date.now() > data.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data.value;
    } catch (error) {
      console.warn('Failed to retrieve data securely:', error);
      return null;
    }
  }
  
  static removeItem(key) {
    localStorage.removeItem(key);
  }
  
  static clear() {
    localStorage.clear();
  }
}

// Input validation and sanitization
export const validateAndSanitizeInput = (input, type = 'text') => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  switch (type) {
    case 'email':
      // Allow only valid email characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9@._-]/g, '');
      break;
    case 'phone':
      // Allow only numbers, spaces, hyphens, and plus
      sanitized = sanitized.replace(/[^0-9\s\-+()]/g, '');
      break;
    case 'name':
      // Allow only letters, spaces, hyphens, and apostrophes
      sanitized = sanitized.replace(/[^a-zA-Z\s\-']/g, '');
      break;
    case 'alphanumeric':
      // Allow only letters and numbers
      sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, '');
      break;
    default:
      // Basic text sanitization
      sanitized = sanitized.replace(/[<>]/g, '');
  }
  
  return sanitized.trim();
};

// Rate limiting for client-side requests
export class ClientRateLimit {
  constructor() {
    this.requests = new Map();
  }
  
  isAllowed(key, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);
    this.requests.set(key, validRequests);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  getRemainingRequests(key, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      return limit;
    }
    
    const requests = this.requests.get(key);
    const validRequests = requests.filter(time => time > windowStart);
    
    return Math.max(0, limit - validRequests.length);
  }
}

// Global rate limiter instance
export const rateLimiter = new ClientRateLimit();

// Secure API request wrapper
export const secureApiRequest = async (url, options = {}) => {
  // Rate limiting
  const requestKey = `api_${url}`;
  if (!rateLimiter.isAllowed(requestKey, 30, 60000)) {
    throw new Error('Too many requests. Please wait before trying again.');
  }
  
  // Add security headers
  const secureOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    },
  };
  
  // Add CSRF token if available
  const csrfToken = SecureStorage.getItem('csrf_token');
  if (csrfToken) {
    secureOptions.headers['X-CSRF-Token'] = csrfToken;
  }
  
  try {
    const response = await fetch(url, secureOptions);
    
    // Check for security headers in response
    const securityHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security'
    ];
    
    securityHeaders.forEach(header => {
      if (!response.headers.get(header)) {
        console.warn(`Missing security header: ${header}`);
      }
    });
    
    return response;
  } catch (error) {
    console.error('Secure API request failed:', error);
    throw error;
  }
};

// Password strength checker
export const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    noCommon: !isCommonPassword(password),
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  let strength = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return {
    score,
    strength,
    checks,
    suggestions: getPasswordSuggestions(checks),
  };
};

// Common password check (simplified)
const isCommonPassword = (password) => {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  return commonPasswords.includes(password.toLowerCase());
};

// Password improvement suggestions
const getPasswordSuggestions = (checks) => {
  const suggestions = [];
  
  if (!checks.length) suggestions.push('Use at least 8 characters');
  if (!checks.uppercase) suggestions.push('Add uppercase letters');
  if (!checks.lowercase) suggestions.push('Add lowercase letters');
  if (!checks.numbers) suggestions.push('Add numbers');
  if (!checks.special) suggestions.push('Add special characters');
  if (!checks.noCommon) suggestions.push('Avoid common passwords');
  
  return suggestions;
};

// Session security
export const validateSession = () => {
  const token = SecureStorage.getItem('auth_token');
  const lastActivity = SecureStorage.getItem('last_activity');
  
  if (!token || !lastActivity) {
    return false;
  }
  
  // Check if session has expired (30 minutes of inactivity)
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes
  if (Date.now() - lastActivity > sessionTimeout) {
    SecureStorage.clear();
    return false;
  }
  
  // Update last activity
  SecureStorage.setItem('last_activity', Date.now());
  return true;
};

// Initialize security measures
export const initializeSecurity = () => {
  // Prevent clickjacking
  preventClickjacking();
  
  // Set up session validation
  setInterval(validateSession, 60000); // Check every minute
  
  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    // Clear any temporary sensitive data
    sessionStorage.clear();
  });
  
  // Detect developer tools (basic detection)
  let devtools = { open: false };
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > 200 || 
        window.outerWidth - window.innerWidth > 200) {
      if (!devtools.open) {
        devtools.open = true;
        console.warn('Developer tools detected. Please ensure you are in a secure environment.');
      }
    } else {
      devtools.open = false;
    }
  }, 500);
  
  console.log('Security measures initialized');
};