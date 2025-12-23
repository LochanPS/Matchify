import { useState, useEffect } from 'react';
import { Trophy, Medal, Search, AlertCircle } from 'lucide-react';
import { matchAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const StandingsTable = ({ tournamentId, categoryId }) => {
  const [standings, setStandings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoryId) {
      fetchStandings();
    }
  }, [tournamentId, categoryId]);

  const fetchStandings = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all matches for this category
      const matches = await matchAPI.getTournamentMatches(tournamentId);
      const categoryMatches = matches.filter((m) => m.category_id === categoryId && m.status === 'completed');

      // Get all participants for this category
      const participantsResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/tournaments/${tournamentId}/categories/${categoryId}/participants`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (!participantsResponse.ok) {
        throw new Error('Failed to fetch participants');
      }

      const participants = await participantsResponse.json();

      // Calculate standings
      const standingsMap = {};

      // Initialize all participants
      participants.forEach((p) => {
        standingsMap[p.player_id] = {
          playerId: p.player_id,
          playerName: p.name || 'Unknown',
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          points: 0,
          winRate: 0,
        };
      });

      // Process each match
      categoryMatches.forEach((match) => {
        const { player1_id, player2_id, winner_id } = match;

        // Initialize if not already present
        if (!standingsMap[player1_id]) {
          standingsMap[player1_id] = {
            playerId: player1_id,
            playerName: match.player1_name || 'Unknown',
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            points: 0,
            winRate: 0,
          };
        }

        if (!standingsMap[player2_id]) {
          standingsMap[player2_id] = {
            playerId: player2_id,
            playerName: match.player2_name || 'Unknown',
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            points: 0,
            winRate: 0,
          };
        }

        // Both players played this match
        standingsMap[player1_id].matchesPlayed++;
        standingsMap[player2_id].matchesPlayed++;

        // Award points to winner
        if (winner_id === player1_id) {
          standingsMap[player1_id].wins++;
          standingsMap[player1_id].points += 3;
          standingsMap[player2_id].losses++;
        } else if (winner_id === player2_id) {
          standingsMap[player2_id].wins++;
          standingsMap[player2_id].points += 3;
          standingsMap[player1_id].losses++;
        }
      });

      // Calculate win rates and convert to array
      let calculatedStandings = Object.values(standingsMap).map((player) => ({
        ...player,
        winRate:
          player.matchesPlayed > 0 ? Math.round((player.wins / player.matchesPlayed) * 100) : 0,
      }));

      // Sort standings
      calculatedStandings.sort((a, b) => {
        // Primary: Points (descending)
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        // Secondary: Win rate (descending)
        if (b.winRate !== a.winRate) {
          return b.winRate - a.winRate;
        }
        // Tertiary: Wins (descending)
        if (b.wins !== a.wins) {
          return b.wins - a.wins;
        }
        // Final: Alphabetical by name
        return a.playerName.localeCompare(b.playerName);
      });

      // Add rank
      calculatedStandings = calculatedStandings.map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

      setStandings(calculatedStandings);
    } catch (err) {
      console.error('Failed to fetch standings:', err);
      setError(err.message || 'Failed to load standings');
    } finally {
      setLoading(false);
    }
  };

  const filteredStandings = standings.filter((player) =>
    player.playerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="font-semibold text-gray-700">{rank}</span>;
    }
  };

  const getRowHighlight = (rank) => {
    if (rank === 1) return 'bg-yellow-50';
    if (rank === 2) return 'bg-gray-50';
    if (rank === 3) return 'bg-orange-50';
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" text="Loading standings..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-red-900">{error}</p>
          <button
            onClick={fetchStandings}
            className="text-sm text-red-600 hover:text-red-700 font-medium mt-2"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search player..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Standings Table */}
      {filteredStandings.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {searchTerm ? 'No players found matching your search' : 'No standings data available yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Player</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16">Played</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16">Won</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16">Lost</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-16">Points</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 w-20">Win %</th>
                </tr>
              </thead>
              <tbody>
                {filteredStandings.map((player) => (
                  <tr
                    key={player.playerId}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getRowHighlight(player.rank)}`}
                  >
                    <td className="px-4 py-3 font-semibold text-center">
                      <div className="flex items-center justify-center">{getRankIcon(player.rank)}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{player.playerName}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{player.matchesPlayed}</td>
                    <td className="px-4 py-3 text-center font-semibold text-green-600">{player.wins}</td>
                    <td className="px-4 py-3 text-center font-semibold text-red-600">{player.losses}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600">{player.points}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">
                      {player.winRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Scoring System</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <span className="font-semibold text-green-600">Win:</span> 3 points
              </div>
              <div>
                <span className="font-semibold text-red-600">Loss:</span> 0 points
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {filteredStandings.length > 0 && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="text-gray-600 text-xs">Total Players</p>
            <p className="font-bold text-blue-600 text-lg">{filteredStandings.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-gray-600 text-xs">Matches Played</p>
            <p className="font-bold text-green-600 text-lg">
              {Math.round(
                filteredStandings.reduce((sum, p) => sum + p.matchesPlayed, 0) / 2
              )}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <p className="text-gray-600 text-xs">Leader</p>
            <p className="font-bold text-purple-600 text-sm truncate">
              {filteredStandings[0]?.playerName || 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandingsTable;
