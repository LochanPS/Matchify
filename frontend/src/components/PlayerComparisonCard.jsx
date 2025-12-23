import React from 'react';
import { TrendingUp, Calendar, Trophy } from 'lucide-react';

/**
 * PlayerComparisonCard - Compare two players fairly without skill labels
 * Shows objective metrics for transparent comparison
 */
const PlayerComparisonCard = ({ player1, player2 }) => {
  if (!player1 || !player2) return null;

  // Calculate experience level
  const getExperienceLevel = (firstTournamentDate) => {
    if (!firstTournamentDate) return 'New';
    const monthsSince = Math.floor(
      (new Date() - new Date(firstTournamentDate)) / (1000 * 60 * 60 * 24 * 30)
    );
    if (monthsSince < 3) return 'New';
    if (monthsSince < 12) return 'Active';
    return 'Veteran';
  };

  // Calculate win rate
  const getWinRate = (player) => {
    if (!player.matches_played || player.matches_played === 0) return 0;
    return ((player.wins / player.matches_played) * 100).toFixed(1);
  };

  const winRate1 = getWinRate(player1);
  const winRate2 = getWinRate(player2);

  // Generate insights
  const generateInsights = () => {
    const insights = [];

    // Experience comparison
    const exp1 = getExperienceLevel(player1.first_tournament_date);
    const exp2 = getExperienceLevel(player2.first_tournament_date);

    if (player2.total_tournaments > player1.total_tournaments) {
      const diff = player2.total_tournaments - player1.total_tournaments;
      insights.push(`${player2.name} has played ${diff} more tournaments`);
    } else if (player1.total_tournaments > player2.total_tournaments) {
      const diff = player1.total_tournaments - player2.total_tournaments;
      insights.push(`${player1.name} has played ${diff} more tournaments`);
    }

    // Win rate comparison
    if (winRate2 > winRate1) {
      const diff = (winRate2 - winRate1).toFixed(1);
      insights.push(`${player2.name} has a ${diff}% higher win rate`);
    } else if (winRate1 > winRate2) {
      const diff = (winRate1 - winRate2).toFixed(1);
      insights.push(`${player1.name} has a ${diff}% higher win rate`);
    }

    // Consistency comparison
    if (player2.active_streak > player1.active_streak) {
      insights.push(`${player2.name} has been more consistent recently`);
    } else if (player1.active_streak > player2.active_streak) {
      insights.push(`${player1.name} has been more consistent recently`);
    }

    return insights;
  };

  const insights = generateInsights();

  const PlayerColumn = ({ player, isPlayer1 }) => (
    <div className="flex-1">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">{player.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{getExperienceLevel(player.first_tournament_date)} Player</p>
      </div>

      <div className="space-y-4">
        {/* Tournaments */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Tournaments</p>
          <p className="text-2xl font-bold text-gray-900">{player.total_tournaments || 0}</p>
        </div>

        {/* Matches */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Matches</p>
          <p className="text-2xl font-bold text-gray-900">{player.matches_played || 0}</p>
        </div>

        {/* Wins */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Wins</p>
          <p className="text-2xl font-bold text-gray-900">{player.wins || 0}</p>
        </div>

        {/* Win Rate */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-600 mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-blue-900">{getWinRate(player)}%</p>
        </div>

        {/* Active Streak */}
        {player.active_streak > 0 && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-xs text-red-600 mb-1">Active Streak</p>
            <p className="text-2xl font-bold text-red-900">🔥 {player.active_streak}mo</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Player Comparison</h2>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <PlayerColumn player={player1} isPlayer1={true} />
        <PlayerColumn player={player2} isPlayer1={false} />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Comparison Insights
          </h3>
          <ul className="space-y-2">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-blue-900 flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-700">
          <span className="font-semibold">ℹ️ Note:</span> This comparison shows objective metrics based on actual
          tournament participation and performance. No artificial skill labels are used.
        </p>
      </div>
    </div>
  );
};

export default PlayerComparisonCard;
