import { useState } from 'react';
import { Check, Trophy, Loader2 } from 'lucide-react';

const MatchCard = ({ match, onScoreSubmit, tournament }) => {
  const [player1Score, setPlayer1Score] = useState(match.player1_score || '');
  const [player2Score, setPlayer2Score] = useState(match.player2_score || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isCompleted = match.status === 'completed';
  const canEdit = !isCompleted;

  const player1IsWinner = isCompleted && match.winner_id === match.player1_id;
  const player2IsWinner = isCompleted && match.winner_id === match.player2_id;

  const handleSubmit = async () => {
    if (!player1Score || !player2Score) {
      setError('Please enter scores for both players');
      return;
    }

    if (player1Score === player2Score) {
      setError('Scores cannot be equal. There must be a winner');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onScoreSubmit(match.match_id, {
        player1_score: parseInt(player1Score),
        player2_score: parseInt(player2Score),
      });
    } catch (err) {
      setError(err.message || 'Failed to submit score');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlayerClasses = (isWinner) => {
    if (!isCompleted) return 'text-gray-800';
    if (isWinner) return 'text-green-700 font-bold';
    return 'text-gray-500';
  };

  const getScoreInputClasses = (isWinner) => {
    if (!isCompleted) return 'border-blue-300 bg-white focus:ring-blue-500';
    if (isWinner) return 'border-green-500 bg-green-100 text-green-700';
    return 'border-gray-300 bg-gray-50 text-gray-500';
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 p-4 transition-all ${
        isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
      }`}
    >
      {/* Player 1 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {player1IsWinner && <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
          <span className={`text-base truncate ${getPlayerClasses(player1IsWinner)}`}>
            {match.player1_name || 'TBD'}
          </span>
        </div>

        <input
          type="number"
          min="0"
          max="99"
          value={player1Score}
          onChange={(e) => {
            setPlayer1Score(e.target.value);
            setError('');
          }}
          disabled={!canEdit}
          className={`w-16 h-12 ml-2 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 ${getScoreInputClasses(
            player1IsWinner
          )} disabled:cursor-not-allowed`}
          placeholder="0"
        />
      </div>

      <div className="border-t border-gray-200 my-3"></div>

      {/* Player 2 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {player2IsWinner && <Trophy className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
          <span className={`text-base truncate ${getPlayerClasses(player2IsWinner)}`}>
            {match.player2_name || 'TBD'}
          </span>
        </div>

        <input
          type="number"
          min="0"
          max="99"
          value={player2Score}
          onChange={(e) => {
            setPlayer2Score(e.target.value);
            setError('');
          }}
          disabled={!canEdit}
          className={`w-16 h-12 ml-2 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 ${getScoreInputClasses(
            player2IsWinner
          )} disabled:cursor-not-allowed`}
          placeholder="0"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Submit Button */}
      {canEdit && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !player1Score || !player2Score}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Submit Score
            </>
          )}
        </button>
      )}

      {isCompleted && (
        <div className="flex items-center justify-center gap-2 text-green-700 font-semibold py-3">
          <Check className="w-5 h-5" />
          Match Completed
        </div>
      )}
    </div>
  );
};

export default MatchCard;
