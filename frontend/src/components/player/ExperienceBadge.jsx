import React from 'react';

/**
 * Accessible experience badge component
 * Shows player experience level based on matches played
 * Includes ARIA labels for screen readers
 */
const ExperienceBadge = ({ matchesPlayed }) => {
  const getBadge = (count) => {
    if (count >= 50) {
      return {
        emoji: '👑',
        label: 'Champion',
        description: 'Played 50 or more matches',
        color: 'bg-amber-100 text-amber-700',
      };
    }
    if (count >= 20) {
      return {
        emoji: '🏆',
        label: 'Veteran',
        description: 'Played 20 or more matches',
        color: 'bg-purple-100 text-purple-700',
      };
    }
    if (count >= 5) {
      return {
        emoji: '🏸',
        label: 'Regular',
        description: 'Played 5 or more matches',
        color: 'bg-green-100 text-green-700',
      };
    }
    return {
      emoji: '🎾',
      label: 'Newcomer',
      description: 'Just starting out',
      color: 'bg-blue-100 text-blue-700',
    };
  };

  const badge = getBadge(matchesPlayed);

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${badge.color}`}
      role="img"
      aria-label={`${badge.label}: ${badge.description}`}
    >
      <span aria-hidden="true">{badge.emoji}</span>
      <span>{badge.label}</span>
    </div>
  );
};

export default ExperienceBadge;
