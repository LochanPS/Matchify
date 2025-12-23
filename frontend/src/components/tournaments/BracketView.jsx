import { useState, useEffect } from 'react';
import { ChevronRight, Trophy, Clock } from 'lucide-react';

const BracketView = ({ matches = [], format = 'knockout', categoryName = '' }) => {
  const [rounds, setRounds] = useState([]);
  const [svgHeight, setSvgHeight] = useState(400);

  useEffect(() => {
    if (matches && matches.length > 0) {
      organizeMatchesByRound();
    }
  }, [matches]);

  const organizeMatchesByRound = () => {
    if (!matches || matches.length === 0) {
      setRounds([]);
      return;
    }

    // Group matches by round
    const roundMap = {};
    matches.forEach((match) => {
      const round = match.round || 1;
      if (!roundMap[round]) {
        roundMap[round] = [];
      }
      roundMap[round].push(match);
    });

    // Sort rounds
    const sortedRounds = Object.keys(roundMap)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((round) => ({
        round: parseInt(round),
        matches: roundMap[round],
      }));

    setRounds(sortedRounds);

    // Calculate SVG height based on number of matches
    const maxMatches = Math.max(...sortedRounds.map((r) => r.matches.length));
    setSvgHeight(Math.max(400, maxMatches * 120));
  };

  const getMatchStatus = (match) => {
    if (match.status === 'completed') return 'Completed';
    if (match.status === 'in_progress') return 'In Progress';
    return 'Scheduled';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (format === 'league') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">League Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 font-medium text-gray-700">Position</th>
                <th className="text-left py-2 px-2 font-medium text-gray-700">Player</th>
                <th className="text-center py-2 px-2 font-medium text-gray-700">Played</th>
                <th className="text-center py-2 px-2 font-medium text-gray-700">Won</th>
                <th className="text-center py-2 px-2 font-medium text-gray-700">Points</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2 font-semibold text-gray-900">{index + 1}</td>
                  <td className="py-3 px-2 text-gray-900">{match.player_name || 'TBD'}</td>
                  <td className="py-3 px-2 text-center text-gray-600">{match.matches_played || 0}</td>
                  <td className="py-3 px-2 text-center text-gray-600">{match.wins || 0}</td>
                  <td className="py-3 px-2 text-center font-semibold text-gray-900">{match.points || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Knockout bracket view
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">
          {categoryName ? `${categoryName} - Bracket` : 'Tournament Bracket'}
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          {matches.length} matches • {format === 'knockout' ? 'Knockout' : 'League'} format
        </p>
      </div>

      {rounds.length === 0 ? (
        <div className="py-8 text-center">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No matches scheduled yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {rounds.map((roundData, roundIndex) => (
              <div key={roundIndex} className="flex flex-col gap-4">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {roundData.round === 1 ? 'Round 1' : roundData.round === 2 ? 'Semi-Finals' : 'Finals'}
                </div>

                <div className="flex flex-col gap-3">
                  {roundData.matches.map((match, matchIndex) => (
                    <div
                      key={matchIndex}
                      className={`border rounded-lg p-3 w-56 ${getStatusColor(match.status)}`}
                    >
                      {/* Match Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadgeColor(match.status)}`}>
                          {getMatchStatus(match)}
                        </span>
                        {match.status === 'completed' && (
                          <Trophy className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>

                      {/* Player 1 */}
                      <div className="mb-2 pb-2 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {match.player1_name || 'TBD'}
                          </span>
                          {match.status === 'completed' && (
                            <span className="text-sm font-semibold text-gray-900">
                              {match.player1_score || 0}
                            </span>
                          )}
                        </div>
                        {match.player1_seed && (
                          <p className="text-xs text-gray-500 mt-1">Seed #{match.player1_seed}</p>
                        )}
                      </div>

                      {/* Player 2 */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {match.player2_name || 'TBD'}
                          </span>
                          {match.status === 'completed' && (
                            <span className="text-sm font-semibold text-gray-900">
                              {match.player2_score || 0}
                            </span>
                          )}
                        </div>
                        {match.player2_seed && (
                          <p className="text-xs text-gray-500 mt-1">Seed #{match.player2_seed}</p>
                        )}
                      </div>

                      {/* Match Time */}
                      {match.scheduled_time && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          {new Date(match.scheduled_time).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-600 mb-2">Status Legend</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
            <span className="text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300" />
            <span className="text-gray-600">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BracketView;
