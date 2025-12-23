import React from 'react';
import { Calendar, Flame, Trophy, TrendingUp } from 'lucide-react';

/**
 * PlayerExperienceCard - Shows player's journey and experience
 * Replaces skill level with objective metrics
 */
const PlayerExperienceCard = ({ player }) => {
  if (!player) return null;

  // Calculate experience badge
  const getExperienceBadge = () => {
    if (!player.first_tournament_date) {
      return { icon: '🌱', text: 'New Player', color: 'bg-green-50 text-green-700' };
    }

    const monthsSinceFirst = Math.floor(
      (new Date() - new Date(player.first_tournament_date)) / (1000 * 60 * 60 * 24 * 30)
    );

    if (monthsSinceFirst < 3) {
      return { icon: '🌱', text: 'New Player', color: 'bg-green-50 text-green-700' };
    } else if (monthsSinceFirst < 12) {
      return { icon: '⚡', text: 'Active Player', color: 'bg-blue-50 text-blue-700' };
    } else {
      return { icon: '🏆', text: 'Veteran Player', color: 'bg-purple-50 text-purple-700' };
    }
  };

  // Calculate consistency badge
  const getConsistencyBadge = () => {
    const streak = player.active_streak || 0;
    if (streak >= 6) return { icon: '🔥', text: 'Consistent', color: 'text-red-600' };
    if (streak >= 3) return { icon: '✨', text: 'Regular', color: 'text-yellow-600' };
    return null;
  };

  const experienceBadge = getExperienceBadge();
  const consistencyBadge = getConsistencyBadge();

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not started';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Calculate months playing
  const monthsPlaying = player.first_tournament_date
    ? Math.floor(
        (new Date() - new Date(player.first_tournament_date)) / (1000 * 60 * 60 * 24 * 30)
      )
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      {/* Header with badges */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {player.name} {experienceBadge.icon}
          </h2>
          <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${experienceBadge.color}`}>
            {experienceBadge.text}
          </p>
          {consistencyBadge && (
            <p className={`inline-block ml-2 px-3 py-1 rounded-full text-sm font-medium ${consistencyBadge.color}`}>
              {consistencyBadge.icon} {consistencyBadge.text}
            </p>
          )}
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-4">
          <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Playing since</p>
            <p className="text-lg font-semibold text-gray-900">{formatDate(player.first_tournament_date)}</p>
            {monthsPlaying > 0 && (
              <p className="text-sm text-gray-500 mt-1">{monthsPlaying} months of experience</p>
            )}
          </div>
        </div>

        {player.active_streak > 0 && (
          <div className="flex items-start gap-4">
            <Flame className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-gray-600">Active streak</p>
              <p className="text-lg font-semibold text-gray-900">{player.active_streak} months</p>
              <p className="text-sm text-gray-500 mt-1">Consecutive months with tournament activity</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          <Trophy className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-sm text-gray-600">Tournament experience</p>
            <p className="text-lg font-semibold text-gray-900">{player.total_tournaments || 0} tournaments</p>
            <p className="text-sm text-gray-500 mt-1">Total tournaments joined</p>
          </div>
        </div>
      </div>

      {/* Career Stats */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Career Stats
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">{player.matches_played || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Matches</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{player.wins || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Wins</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {player.matches_played > 0
                ? ((player.wins / player.matches_played) * 100).toFixed(1)
                : '0'}
              %
            </p>
            <p className="text-xs text-gray-600 mt-1">Win Rate</p>
          </div>
        </div>
      </div>

      {/* Recent Form */}
      {player.recent_form && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Form (Last 10)</h3>
          <div className="flex gap-1">
            {player.recent_form.split('').map((result, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                  result === 'W' ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 Tip:</span> Your profile shows your real journey and performance,
          not arbitrary labels. This helps everyone see your true experience level.
        </p>
      </div>
    </div>
  );
};

export default PlayerExperienceCard;
