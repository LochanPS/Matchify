import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'success', 
  duration = 3000,
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = 'fixed z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 max-w-sm';
    
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    const typeStyles = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    };

    const visibilityStyles = isVisible 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 -translate-y-2';

    return `${baseStyles} ${positions[position]} ${typeStyles[type]} ${visibilityStyles}`;
  };

  const getIcon = () => {
    const iconProps = { className: 'h-5 w-5 flex-shrink-0' };
    
    switch (type) {
      case 'success':
        return <CheckCircle2 {...iconProps} />;
      case 'error':
        return <AlertCircle {...iconProps} />;
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      default:
        return <CheckCircle2 {...iconProps} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Provider Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', options = {}) => {
    const id = Date.now();
    const toast = {
      id,
      message,
      type,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, options.duration || 3000);

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, options) => addToast(message, 'success', options);
  const showError = (message, options) => addToast(message, 'error', options);
  const showWarning = (message, options) => addToast(message, 'warning', options);
  const showInfo = (message, options) => addToast(message, 'info', options);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

// Toast Container Component
export const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </>
  );
};

export default Toast;