import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((err) => {
    console.error('Error occurred:', err);
    
    // Normalize error format
    const normalizedError = {
      message: err?.message || 'An unexpected error occurred',
      status: err?.status || err?.response?.status,
      code: err?.code,
      stack: err?.stack
    };

    setError(normalizedError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(async (retryFn) => {
    if (!retryFn) return;
    
    setIsRetrying(true);
    setError(null);
    
    try {
      await retryFn();
    } catch (err) {
      handleError(err);
    } finally {
      setIsRetrying(false);
    }
  }, [handleError]);

  const withErrorHandling = useCallback((asyncFn) => {
    return async (...args) => {
      try {
        setError(null);
        return await asyncFn(...args);
      } catch (err) {
        handleError(err);
        throw err; // Re-throw so caller can handle if needed
      }
    };
  }, [handleError]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    retry,
    withErrorHandling
  };
};

export default useErrorHandler;