import React from 'react';
import { MapPin, Users, Trophy, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { getTournamentDiversity, getPlayerTournamentComparison } from '../../services/tournamentRecommendations';

/**
 * EnhancedTournamentCard - Tournament card without skill level requirements
 * Shows: format, availability, participant diversity, entry fee, venue
 * Replaces skill-level indicators with practical information
 */
const EnhancedTournamentCard = ({ tournament, currentPlayer, onRegister, isRegistered }) => {
  if (!tournament) return null;

  const diversity = getTournamentDiversity(tournament);
  const comparison = currentPlayer ? getPlayerTournamentComparison(currentPlayer, tournament) : null;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  // Get availability status
  const getAvailabilityStatus = () => {
    const available = tournament.max_players - (tournament.current_players || 0);
    if (available <= 0) return { text: 'Full', color: 'bg-red-50 text-red-700' };
    if (available <= 2) return { text: `${available} slot left`, color: 'bg-orange-50 text-orange-700' };
    return { text: `${available} slots available`, color: 'bg-green-50 text-green-700' };
  };

  const availability = getAvailabilityStatus();

  // Get experience level badge
  const getExperienceBadge = () => {
    if (diversity.diversityScore >= 80) {
      return { icon: '🌈', text: 'Mixed Experience', color: 'text-purple-600' };
    }
    if (diversity.newPlayers > diversity.veteranPlayers) {
      return { icon: '🌱', text: 'Beginner-Friendly', color: 'text-green-600' };
    }
    if (diversity.veteranPlayers > diversity.newPlayers) {
      return { icon: '🏆', text: 'Competitive', color: 'text-blue-600' };
    }
    return { icon: '⚡', text: 'Active Players', color: 'text-yellow-600' };
  };

  const experienceBadge = getExperienceBadge();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{tournament.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{tournament.sport} • {tournament.format}</p>
          </div>
          {isRegistered && (
            <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
              ✓ Registered
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDate(tournament.date)}</span>
            {tournament.time && <span className="text-gray-400">• {formatTime(tournament.time)}</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Venue & Location */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">{tournament.venue}</p>
            <p className="text-xs text-gray-600">{tournament.city}</p>
          </div>
        </div>

        {/* Entry Fee & Prize */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Entry Fee</p>
            <p className="text-lg font-bold text-gray-900">₹{tournament.entry_fee}</p>
          </div>
          {tournament.prize_pool && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-yellow-700 mb-1">Prize Pool</p>
              <p className="text-lg font-bold text-yellow-900">₹{tournament.prize_pool}</p>
            </div>
          )}
        </div>

        {/* Availability Status */}
        <div className={`rounded-lg p-3 ${availability.color}`}>
          <p className="text-sm font-semibold">{availability.text}</p>
          <p className="text-xs mt-1">
            {tournament.current_players || 0} / {tournament.max_players} players
          </p>
        </div>

        {/* Experience Mix */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <span>{experienceBadge.icon}</span>
              {experienceBadge.text}
            </p>
            <span className={`text-xs font-bold ${experienceBadge.color}`}>
              {diversity.diversityScore}% diverse
            </span>
          </div>
          <p className="text-xs text-blue-700">
            {diversity.description}
          </p>
        </div>

        {/* Player Comparison (if current player provided) */}
        {comparison && (
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-xs font-semibold text-purple-900 mb-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              How you compare
            </p>
            <div className="space-y-1 text-xs text-purple-800">
              {comparison.comparison.matchesAboveAvg && (
                <p>✓ More matches than average participant</p>
              )}
              {comparison.comparison.winRateAboveAvg && (
                <p>✓ Higher win rate than average participant</p>
              )}
              {comparison.comparison.tournamentsAboveAvg && (
                <p>✓ More tournament experience than average</p>
              )}
              {!comparison.comparison.overallAboveAvg && (
                <p>• Good opportunity to gain experience</p>
              )}
            </div>
          </div>
        )}

        {/* Categories */}
        {tournament.categories && tournament.categories.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {tournament.categories.map((category, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                >
                  {category.name} (₹{category.entry_fee})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Action Button */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        {isRegistered ? (
          <button
            disabled
            className="w-full py-2 px-4 bg-gray-200 text-gray-600 rounded-lg font-semibold text-sm cursor-not-allowed"
          >
            Already Registered
          </button>
        ) : tournament.max_players - (tournament.current_players || 0) <= 0 ? (
          <button
            disabled
            className="w-full py-2 px-4 bg-gray-200 text-gray-600 rounded-lg font-semibold text-sm cursor-not-allowed"
          >
            Tournament Full
          </button>
        ) : (
          <button
            onClick={() => onRegister && onRegister(tournament)}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Register Now
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
        <p className="text-xs text-blue-900">
          <span className="font-semibold">💡 Tip:</span> All tournaments are open to all players. 
          Your experience level is shown for reference, not as a requirement.
        </p>
      </div>
    </div>
  );
};

export default EnhancedTournamentCard;
