import { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Wrapper component for lazy-loaded routes
 * Shows a loading spinner while the component is being loaded
 */
const LazyRoute = ({ children }) => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default LazyRoute;