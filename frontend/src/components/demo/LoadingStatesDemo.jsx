import { useState } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import { TournamentCardSkeleton, ProfileSkeleton, MatchCardSkeleton, ListSkeleton } from '../common/SkeletonLoader';
import ErrorDisplay from '../common/ErrorDisplay';
import Toast, { useToast, ToastContainer } from '../common/Toast';

const LoadingStatesDemo = () => {
  const [activeDemo, setActiveDemo] = useState('spinners');
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();

  const demos = [
    { id: 'spinners', label: 'Loading Spinners' },
    { id: 'skeletons', label: 'Skeleton Screens' },
    { id: 'errors', label: 'Error States' },
    { id: 'toasts', label: 'Toast Notifications' }
  ];

  const renderSpinnersDemo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Loading Spinners</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium mb-4">Small Spinner</h4>
          <LoadingSpinner size="sm" text="Loading..." />
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium mb-4">Medium Spinner</h4>
          <LoadingSpinner size="md" text="Processing..." />
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium mb-4">Large Spinner</h4>
          <LoadingSpinner size="lg" text="Generating matches..." />
        </div>
        
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="font-medium mb-4">Extra Large Spinner</h4>
          <LoadingSpinner size="xl" text="Loading tournament data..." />
        </div>
      </div>
    </div>
  );

  const renderSkeletonsDemo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Skeleton Screens</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Tournament Card Skeleton</h4>
          <TournamentCardSkeleton />
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Match Card Skeleton</h4>
          <MatchCardSkeleton />
        </div>
        
        <div>
          <h4 className="font-medium mb-2">List Skeleton</h4>
          <ListSkeleton items={3} />
        </div>
      </div>
    </div>
  );

  const renderErrorsDemo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Error States</h3>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg border">
          <h4 className="font-medium p-4 border-b">Network Error</h4>
          <ErrorDisplay
            error={{ message: 'Network error - fetch failed' }}
            onRetry={() => alert('Retry clicked')}
            title="Connection Problem"
            message="Please check your internet connection and try again."
          />
        </div>
        
        <div className="bg-white rounded-lg border">
          <h4 className="font-medium p-4 border-b">Generic Error</h4>
          <ErrorDisplay
            error={{ message: 'Something went wrong' }}
            onRetry={() => alert('Retry clicked')}
            onGoHome={() => alert('Go Home clicked')}
            showHomeButton={true}
          />
        </div>
        
        <div className="bg-white rounded-lg border">
          <h4 className="font-medium p-4 border-b">Custom Error</h4>
          <ErrorDisplay
            title="Tournament Not Found"
            message="The tournament you're looking for doesn't exist or has been removed."
            onGoHome={() => alert('Go Home clicked')}
            showHomeButton={true}
          />
        </div>
      </div>
    </div>
  );

  const renderToastsDemo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Toast Notifications</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => showSuccess('Tournament created successfully!')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Show Success Toast
        </button>
        
        <button
          onClick={() => showError('Failed to load tournaments')}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Show Error Toast
        </button>
        
        <button
          onClick={() => showWarning('Tournament is almost full')}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          Show Warning Toast
        </button>
        
        <button
          onClick={() => showInfo('New match available')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Show Info Toast
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          Click the buttons above to see toast notifications appear in the top-right corner.
        </p>
      </div>
    </div>
  );

  const renderDemo = () => {
    switch (activeDemo) {
      case 'spinners':
        return renderSpinnersDemo();
      case 'skeletons':
        return renderSkeletonsDemo();
      case 'errors':
        return renderErrorsDemo();
      case 'toasts':
        return renderToastsDemo();
      default:
        return renderSpinnersDemo();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Loading States & Error Handling Demo</h1>
        
        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-white rounded-lg p-1 border">
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeDemo === demo.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {demo.label}
            </button>
          ))}
        </div>
        
        {/* Demo Content */}
        <div className="bg-gray-50 rounded-lg p-6">
          {renderDemo()}
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default LoadingStatesDemo;