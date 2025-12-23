// Comprehensive error handling utilities

// Error types
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Enhanced error class
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN_ERROR, severity = ErrorSeverity.MEDIUM, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.userAgent = navigator.userAgent;
    this.url = window.location.href;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      details: this.details,
      timestamp: this.timestamp,
      userAgent: this.userAgent,
      url: this.url,
      stack: this.stack
    };
  }
}

// Error handler class
export class ErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
  }

  // Handle different types of errors
  handleError(error, context = {}) {
    let appError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error.response) {
      // HTTP error
      appError = this.handleHttpError(error, context);
    } else if (error.request) {
      // Network error
      appError = new AppError(
        'Network error. Please check your connection.',
        ErrorTypes.NETWORK_ERROR,
        ErrorSeverity.HIGH,
        { originalError: error.message, context }
      );
    } else {
      // Unknown error
      appError = new AppError(
        error.message || 'An unexpected error occurred',
        ErrorTypes.UNKNOWN_ERROR,
        ErrorSeverity.MEDIUM,
        { originalError: error.message, context }
      );
    }

    this.logError(appError);
    this.queueError(appError);
    return appError;
  }

  // Handle HTTP errors
  handleHttpError(error, context) {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 400:
        return new AppError(
          data?.message || 'Invalid request. Please check your input.',
          ErrorTypes.VALIDATION_ERROR,
          ErrorSeverity.MEDIUM,
          { status, data, context }
        );
      case 401:
        return new AppError(
          'Authentication required. Please log in.',
          ErrorTypes.AUTHENTICATION_ERROR,
          ErrorSeverity.HIGH,
          { status, data, context }
        );
      case 403:
        return new AppError(
          'Access denied. You don\'t have permission for this action.',
          ErrorTypes.AUTHORIZATION_ERROR,
          ErrorSeverity.HIGH,
          { status, data, context }
        );
      case 404:
        return new AppError(
          'Resource not found.',
          ErrorTypes.NOT_FOUND_ERROR,
          ErrorSeverity.MEDIUM,
          { status, data, context }
        );
      case 408:
        return new AppError(
          'Request timeout. Please try again.',
          ErrorTypes.TIMEOUT_ERROR,
          ErrorSeverity.MEDIUM,
          { status, data, context }
        );
      case 429:
        return new AppError(
          'Too many requests. Please wait and try again.',
          ErrorTypes.NETWORK_ERROR,
          ErrorSeverity.MEDIUM,
          { status, data, context }
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new AppError(
          'Server error. Please try again later.',
          ErrorTypes.SERVER_ERROR,
          ErrorSeverity.HIGH,
          { status, data, context }
        );
      default:
        return new AppError(
          data?.message || 'An error occurred. Please try again.',
          ErrorTypes.UNKNOWN_ERROR,
          ErrorSeverity.MEDIUM,
          { status, data, context }
        );
    }
  }

  // Log error to console and external service
  logError(error) {
    // Console logging
    if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
      console.error('Error:', error.toJSON());
    } else {
      console.warn('Warning:', error.toJSON());
    }

    // Send to external error tracking service (e.g., Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  // Queue error for batch processing
  queueError(error) {
    this.errorQueue.push(error);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byType: {},
      bySeverity: {},
      recent: this.errorQueue.slice(-10)
    };

    this.errorQueue.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  // Retry mechanism for failed operations
  async withRetry(operation, context = {}, maxRetries = this.maxRetries) {
    const operationId = context.operationId || Math.random().toString(36);
    let attempts = this.retryAttempts.get(operationId) || 0;

    try {
      const result = await operation();
      this.retryAttempts.delete(operationId);
      return result;
    } catch (error) {
      attempts++;
      this.retryAttempts.set(operationId, attempts);

      if (attempts < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000;
        console.log(`Retrying operation ${operationId} in ${delay}ms (attempt ${attempts}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(operation, { ...context, operationId }, maxRetries);
      } else {
        this.retryAttempts.delete(operationId);
        throw this.handleError(error, { ...context, attempts });
      }
    }
  }

  // Clear error queue
  clearErrors() {
    this.errorQueue = [];
    this.retryAttempts.clear();
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// React error boundary hook
export const useErrorHandler = () => {
  const handleError = (error, context = {}) => {
    return errorHandler.handleError(error, context);
  };

  const withRetry = (operation, context = {}) => {
    return errorHandler.withRetry(operation, context);
  };

  return { handleError, withRetry };
};

// API error wrapper
export const withErrorHandling = (apiCall, context = {}) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      throw errorHandler.handleError(error, context);
    }
  };
};

// Form validation error handler
export const handleValidationErrors = (errors) => {
  const validationError = new AppError(
    'Please fix the following errors:',
    ErrorTypes.VALIDATION_ERROR,
    ErrorSeverity.MEDIUM,
    { validationErrors: errors }
  );
  
  errorHandler.logError(validationError);
  return validationError;
};

// Network status monitoring
export const monitorNetworkStatus = () => {
  const updateNetworkStatus = () => {
    if (!navigator.onLine) {
      const networkError = new AppError(
        'No internet connection. Please check your network.',
        ErrorTypes.NETWORK_ERROR,
        ErrorSeverity.HIGH,
        { online: navigator.onLine }
      );
      errorHandler.handleError(networkError);
    }
  };

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  
  return () => {
    window.removeEventListener('online', updateNetworkStatus);
    window.removeEventListener('offline', updateNetworkStatus);
  };
};

// Unhandled error listeners
export const setupGlobalErrorHandlers = () => {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = new AppError(
      'Unhandled promise rejection',
      ErrorTypes.UNKNOWN_ERROR,
      ErrorSeverity.HIGH,
      { reason: event.reason }
    );
    errorHandler.handleError(error);
    event.preventDefault();
  });

  // JavaScript errors
  window.addEventListener('error', (event) => {
    const error = new AppError(
      event.message || 'JavaScript error',
      ErrorTypes.UNKNOWN_ERROR,
      ErrorSeverity.HIGH,
      { 
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      }
    );
    errorHandler.handleError(error);
  });
};