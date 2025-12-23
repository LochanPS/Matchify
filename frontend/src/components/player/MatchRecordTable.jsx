import React from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Accessible match record table component
 * Displays player statistics with proper table semantics
 * Includes ARIA labels and descriptions for screen readers
 */
const MatchRecordTable = ({ stats }) => {
  if (!stats) return null;

  const matchesPlayed = stats.matchesPlayed || 0;
  const wins = stats.wins || 0;
  const losses = stats.losses || 0;
  const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

  return (
    <section aria-label="Match Record Statistics">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Match Record</h2>

      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse"
          role="table"
          aria-label="Player match statistics"
        >
          <thead>
            <tr className="border-b-2 border-gray-300 bg-gray-50">
              <th
                scope="col"
                className="text-left py-3 px-4 font-semibold text-gray-700"
              >
                Metric
              </th>
              <th
                scope="col"
                className="text-right py-3 px-4 font-semibold text-gray-700"
              >
                Value
              </th>
              <th
                scope="col"
                className="text-left py-3 px-4 font-semibold text-gray-700"
              >
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-900">
                Matches Played
              </td>
              <td className="py-3 px-4 text-right font-bold text-blue-600">
                {matchesPlayed}
              </td>
              <td className="py-3 px-4 text-gray-600">
                Total matches participated in
              </td>
            </tr>

            <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-900">Wins</td>
              <td className="py-3 px-4 text-right font-bold text-green-600">
                {wins}
              </td>
              <td className="py-3 px-4 text-gray-600">
                Matches won ({winRate}%)
              </td>
            </tr>

            <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-900">Losses</td>
              <td className="py-3 px-4 text-right font-bold text-red-600">
                {losses}
              </td>
              <td className="py-3 px-4 text-gray-600">
                Matches lost ({matchesPlayed > 0 ? Math.round(((matchesPlayed - wins) / matchesPlayed) * 100) : 0}%)
              </td>
            </tr>

            <tr className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 font-medium text-gray-900">Win Rate</td>
              <td className="py-3 px-4 text-right font-bold text-purple-600">
                {winRate}%
              </td>
              <td className="py-3 px-4 text-gray-600">
                Percentage of matches won
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        Player has played {matchesPlayed} matches with {wins} wins and {losses}{' '}
        losses, for a win rate of {winRate}%.
      </div>
    </section>
  );
};

export default MatchRecordTable;
