import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Accessible tooltip component
 * Shows help text on hover or focus
 * Keyboard accessible with proper ARIA labels
 */
const Tooltip = ({ text, children, label }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {children}
      <button
        type="button"
        className="ml-1 inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-colors"
        aria-label={label || `Help: ${text}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        <HelpCircle size={16} aria-hidden="true" />
      </button>

      {isVisible && (
        <div
          className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-10 shadow-lg"
          role="tooltip"
        >
          {text}
          <div className="absolute top-full left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
