import { useEffect } from 'react';
import { performanceMonitor } from '../utils/performance';

/**
 * Hook to measure API call performance
 * Wraps API calls to track their duration
 * @returns {object} Object with measureAPI function
 */
export const useAPIMetrics = () => {
  /**
   * Measure an API call
   * @param {string} endpoint - API endpoint name
   * @param {Promise} apiCall - The API call promise
   * @returns {Promise} The API call result
   */
  const measureAPI = async (endpoint, apiCall) => {
    const metricName = `api_${endpoint}`;
    performanceMonitor.start(metricName);

    try {
      const result = await apiCall;
      const duration = performanceMonitor.end(metricName);
      console.log(`📡 API call (${endpoint}): ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      performanceMonitor.end(metricName);
      throw error;
    }
  };

  return { measureAPI };
};

export default useAPIMetrics;
