import { AlertCircle, WifiOff, RefreshCw, Home } from 'lucide-react';

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onGoHome,
  title,
  message,
  showHomeButton = false,
  className = ''
}) => {
  const isNetworkError = error?.message?.toLowerCase().includes('network') || 
                        error?.message?.toLowerCase().includes('fetch') ||
                        error?.status === 0;

  const defaultTitle = isNetworkError ? 'Connection Problem' : 'Something Went Wrong';
  const defaultMessage = isNetworkError 
    ? 'Please check your internet connection and try again.'
    : error?.message || 'An unexpected error occurred. Please try again.';

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {isNetworkError ? (
        <WifiOff className="h-16 w-16 text-gray-400 mb-4" />
      ) : (
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || defaultTitle}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {message || defaultMessage}
      </p>

      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        )}
        
        {showHomeButton && onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && error?.stack && (
        <details className="mt-6 w-full max-w-md">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
            Show Error Details
          </summary>
          <pre className="mt-2 text-xs text-left bg-gray-100 p-3 rounded overflow-auto max-h-32">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
};

export default ErrorDisplay;