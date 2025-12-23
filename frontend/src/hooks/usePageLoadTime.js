import { useEffect } from 'react';
import { performanceMonitor } from '../utils/performance';

/**
 * Hook to measure page load time
 * Automatically tracks time from component mount to when content is ready
 * @param {string} pageName - Name of the page for tracking
 */
export const usePageLoadTime = (pageName) => {
  useEffect(() => {
    // Start measuring when component mounts
    performanceMonitor.start(`page_load_${pageName}`);

    // End measuring when component unmounts or when content is ready
    return () => {
      const duration = performanceMonitor.end(`page_load_${pageName}`);
      if (duration) {
        console.log(`📊 Page load time (${pageName}): ${duration.toFixed(2)}ms`);
      }
    };
  }, [pageName]);
};

export default usePageLoadTime;
