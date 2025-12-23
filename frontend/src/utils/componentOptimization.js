// React component optimization utilities

import { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';

// Higher-order component for performance optimization
export const withPerformanceOptimization = (Component, options = {}) => {
  const { 
    memoize = true, 
    trackRenders = false,
    displayName 
  } = options;
  
  const OptimizedComponent = (props) => {
    const renderCount = useRef(0);
    
    if (trackRenders) {
      renderCount.current++;
      if (renderCount.current > 10) {
        console.warn(`Component ${displayName || Component.name} has rendered ${renderCount.current} times`);
      }
    }
    
    return <Component {...props} />;
  };
  
  OptimizedComponent.displayName = displayName || `Optimized(${Component.displayName || Component.name})`;
  
  return memoize ? memo(OptimizedComponent) : OptimizedComponent;
};

// Optimized tournament card component
export const OptimizedTournamentCard = memo(({ tournament, onRegister, onView }) => {
  const formattedDate = useMemo(() => {
    return new Date(tournament.tournament_date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [tournament.tournament_date]);
  
  const isFullyBooked = useMemo(() => {
    return tournament.current_participants >= tournament.max_players;
  }, [tournament.current_participants, tournament.max_players]);
  
  const handleRegister = useCallback(() => {
    onRegister(tournament.tournament_id);
  }, [tournament.tournament_id, onRegister]);
  
  const handleView = useCallback(() => {
    onView(tournament.tournament_id);
  }, [tournament.tournament_id, onView]);
  
  return (
    <div className="tournament-card bg-white rounded-lg shadow-md p-4 mb-4">
      {tournament.poster_url && (
        <OptimizedImage 
          src={tournament.poster_url} 
          alt={tournament.name}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {tournament.name}
      </h3>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p>📅 {formattedDate}</p>
        <p>📍 {tournament.venue}</p>
        <p>💰 ₹{tournament.entry_fee}</p>
        <p>👥 {tournament.current_participants}/{tournament.max_players} players</p>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleView}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
        
        {!isFullyBooked && (
          <button
            onClick={handleRegister}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Register
          </button>
        )}
      </div>
    </div>
  );
});

// Optimized image component with lazy loading
export const OptimizedImage = memo(({ src, alt, className, placeholder }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);
  
  const handleError = useCallback(() => {
    setError(true);
  }, []);
  
  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded">
          {placeholder && (
            <div className="flex items-center justify-center h-full text-gray-400">
              {placeholder}
            </div>
          )}
        </div>
      )}
      
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      
      {error && (
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400 rounded">
          Image not available
        </div>
      )}
    </div>
  );
});

// Virtualized list component for large datasets
export const VirtualizedTournamentList = memo(({ tournaments, onRegister, onView }) => {
  const Row = useCallback(({ index, style }) => (
    <div style={style}>
      <OptimizedTournamentCard
        tournament={tournaments[index]}
        onRegister={onRegister}
        onView={onView}
      />
    </div>
  ), [tournaments, onRegister, onView]);
  
  if (tournaments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tournaments found
      </div>
    );
  }
  
  return (
    <List
      height={600}
      itemCount={tournaments.length}
      itemSize={280} // Approximate height of tournament card
      className="tournament-list"
    >
      {Row}
    </List>
  );
});

// Debounced search input
export const DebouncedSearchInput = memo(({ onSearch, placeholder, delay = 300 }) => {
  const [value, setValue] = useState('');
  const timeoutRef = useRef();
  
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onSearch(newValue);
    }, delay);
  }, [onSearch, delay]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
});

// Optimized modal component
export const OptimizedModal = memo(({ isOpen, onClose, children, title }) => {
  const modalRef = useRef();
  
  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length > 0) {
        focusableElements[0].focus();
      }
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        if (e.key === 'Tab') {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
});

// Performance monitoring hook
export const usePerformanceMonitor = (componentName) => {
  const renderCount = useRef(0);
  const renderTimes = useRef([]);
  
  useEffect(() => {
    const startTime = performance.now();
    renderCount.current++;
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      renderTimes.current.push(renderTime);
      
      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current.shift();
      }
      
      // Log slow renders
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      // Log excessive re-renders
      if (renderCount.current > 20) {
        const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
        console.warn(`Excessive re-renders in ${componentName}: ${renderCount.current} renders, avg ${avgRenderTime.toFixed(2)}ms`);
      }
    };
  });
  
  return {
    renderCount: renderCount.current,
    avgRenderTime: renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
      : 0
  };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      { threshold: 0.1, ...options }
    );
    
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasIntersected, options]);
  
  return [elementRef, isIntersecting, hasIntersected];
};

// Optimized form component with validation
export const OptimizedForm = memo(({ onSubmit, children, validation = {} }) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);
  
  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.entries(validation).forEach(([field, rules]) => {
      const value = values[field];
      
      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = `${field} is required`;
      } else if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `${field} must be at least ${rules.minLength} characters`;
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.message || `${field} format is invalid`;
      }
    });
    
    return newErrors;
  }, [values, validation]);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {typeof children === 'function' 
        ? children({ values, errors, isSubmitting, onChange: handleChange })
        : children
      }
    </form>
  );
});

export default {
  OptimizedTournamentCard,
  OptimizedImage,
  VirtualizedTournamentList,
  DebouncedSearchInput,
  OptimizedModal,
  OptimizedForm,
  withPerformanceOptimization,
  usePerformanceMonitor,
  useIntersectionObserver
};