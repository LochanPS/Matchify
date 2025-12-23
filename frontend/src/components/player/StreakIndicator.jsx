import React from 'react';
import { Zap } from 'lucide-react';

/**
 * Accessible streak indicator component
 * Shows current and best win/loss streaks
 * Includes ARIA labels for screen readers
 */
const StreakIndicator = ({ currentStreak = 0, longestStreak = 0 }) => {
  const isWinStreak = currentStreak > 0;
  const streakValue = Math.abs(currentStreak);

  return (
    <div
      className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100"
      role="region"
      aria-label="Current Streak Information"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-orange-500" aria-hidden="true" />
          <span className="text-sm font-medium text-gray-700">Current Streak</span>
        </div>
        {isWinStreak && streakValue > 0 && (
          <span aria-hidden="true" className="text-xl">
            🔥
          </span>
        )}
      </div>

      <div className="text-2xl font-bold text-gray-900 mb-2">
        {streakValue > 0 ? (
          <span
            aria-label={`${streakValue} ${isWinStreak ? 'win' : 'loss'} streak`}
          >
            {streakValue} {isWinStreak ? 'Win' : 'Loss'}
            {streakValue > 1 ? 's' : ''}
          </span>
        ) : (
          <span aria-label="No active streak">No active streak</span>
        )}
      </div>

      <div className="text-sm text-gray-600">
        <span aria-label={`Best streak: ${longestStreak} wins`}>
          Best: {longestStreak} wins
        </span>
      </div>
    </div>
  );
};

export default StreakIndicator;
