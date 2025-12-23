import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

export const useAsyncOperation = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const { error, handleError, clearError } = useErrorHandler();

  const execute = useCallback(async (asyncFn, ...args) => {
    setLoading(true);
    clearError();
    
    try {
      const result = await asyncFn(...args);
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError]);

  const executeWithoutLoading = useCallback(async (asyncFn, ...args) => {
    clearError();
    
    try {
      const result = await asyncFn(...args);
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    }
  }, [handleError, clearError]);

  return {
    loading,
    error,
    execute,
    executeWithoutLoading,
    clearError,
    setLoading
  };
};

export default useAsyncOperation;