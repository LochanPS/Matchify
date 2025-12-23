import React from 'react';

/**
 * Skip links component for keyboard navigation
 * Allows users to skip to main content sections
 * Hidden by default, visible on focus
 */
const SkipLinks = () => {
  return (
    <div className="sr-only">
      <a
        href="#main-content"
        className="focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>
      <a
        href="#profile-stats"
        className="focus:not-sr-only focus:fixed focus:top-12 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2"
      >
        Skip to profile statistics
      </a>
      <a
        href="#recent-tournaments"
        className="focus:not-sr-only focus:fixed focus:top-24 focus:left-0 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2"
      >
        Skip to recent tournaments
      </a>
    </div>
  );
};

export default SkipLinks;
