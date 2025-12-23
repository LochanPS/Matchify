import React from 'react';

/**
 * Accessible stat card component with ARIA labels
 * Displays a single statistic with icon, label, and value
 */
const StatCard = ({ icon: Icon, label, value, description, ariaLabel }) => {
  const id = `stat-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      className="bg-blue-50 rounded-xl p-4"
      role="region"
      aria-label={ariaLabel || `${label}: ${value}`}
      aria-describedby={description ? id : undefined}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={20} className="text-blue-600" aria-hidden="true" />
        <span className="text-xs text-gray-600 font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {description && (
        <p id={id} className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      )}
    </div>
  );
};

export default StatCard;
