import { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const PullToRefresh = ({ onRefresh, children, threshold = 80, disabled = false }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || disabled || isRefreshing) return;

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, currentY.current - startY.current);
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || disabled || isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, disabled, isRefreshing]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div ref={containerRef} className="relative overflow-auto h-full">
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-blue-50 border-b border-blue-200 transition-all duration-200 z-10"
          style={{ 
            height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
            transform: `translateY(${isRefreshing ? 0 : -60 + pullDistance}px)`
          }}
        >
          <div className="flex items-center gap-2 text-blue-600">
            <RefreshCw 
              className={`w-5 h-5 transition-transform duration-200 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{ 
                transform: `rotate(${pullProgress * 180}deg)` 
              }}
            />
            <span className="text-sm font-medium">
              {isRefreshing 
                ? 'Refreshing...' 
                : shouldTrigger 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
              }
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: `translateY(${isPulling ? pullDistance : isRefreshing ? 60 : 0}px)` 
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;