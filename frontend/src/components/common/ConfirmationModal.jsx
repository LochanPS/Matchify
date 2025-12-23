import { X, Users, Trophy, Calendar, MapPin } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading = false,
  tournament,
  userStats,
  type = 'join' // 'join' or 'leave'
}) => {
  if (!isOpen) return null;

  const isJoining = type === 'join';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">
            {isJoining ? 'Join Tournament' : 'Leave Tournament'}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tournament Info */}
          {tournament && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">{tournament.name}</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{tournament.venue}, {tournament.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(tournament.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{tournament.current_players}/{tournament.max_players} players</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>₹{tournament.entry_fee} entry • ₹{tournament.prize_money} prize</span>
                </div>
              </div>
            </div>
          )}

          {/* User Stats (for joining) */}
          {isJoining && userStats && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Your Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Matches Played</span>
                  <p className="font-semibold text-blue-900">{userStats.matches_played || 0}</p>
                </div>
                <div>
                  <span className="text-blue-700">Win Rate</span>
                  <p className="font-semibold text-blue-900">
                    {userStats.matches_played > 0 
                      ? Math.round((userStats.wins / userStats.matches_played) * 100)
                      : 0}%
                  </p>
                </div>
                <div>
                  <span className="text-blue-700">Tournaments</span>
                  <p className="font-semibold text-blue-900">{userStats.tournaments_joined || 0}</p>
                </div>
                <div>
                  <span className="text-blue-700">Current Streak</span>
                  <p className="font-semibold text-blue-900">
                    {userStats.current_streak > 0 
                      ? `🔥 ${userStats.current_streak} wins`
                      : userStats.current_streak < 0
                      ? `📉 ${Math.abs(userStats.current_streak)} losses`
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          <div className="text-center mb-6">
            <p className="text-gray-700">
              {isJoining 
                ? 'Are you ready to join this tournament?'
                : 'Are you sure you want to leave this tournament?'
              }
            </p>
            {isJoining && (
              <p className="text-sm text-gray-500 mt-2">
                You can leave anytime before matches are generated.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              isJoining
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="p-0" />
                {isJoining ? 'Joining...' : 'Leaving...'}
              </>
            ) : (
              isJoining ? 'Join Tournament' : 'Leave Tournament'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;