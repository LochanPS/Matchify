import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const DeleteTournamentModal = ({
  isOpen,
  onClose,
  onConfirm,
  tournament,
  participantCount = 0,
  paidCount = 0,
  categoryCount = 0,
  isLoading = false,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (confirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setError('');
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="w-full bg-white rounded-t-2xl p-4 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Delete Tournament</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Warning Section */}
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg space-y-3">
          <div className="flex gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">This action cannot be undone</p>
              <p className="text-sm text-red-800 mt-1">
                Deleting this tournament will permanently remove all data associated with it.
              </p>
            </div>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-gray-900">{tournament?.name}</h3>
          <p className="text-sm text-gray-600">
            📅 {new Date(tournament?.date).toLocaleDateString('en-IN')}
          </p>
          <p className="text-sm text-gray-600">
            📍 {tournament?.venue}, {tournament?.city}
          </p>
        </div>

        {/* What Will Be Deleted */}
        <div className="space-y-3">
          <p className="font-semibold text-gray-900">This will permanently delete:</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-red-600">•</span>
              <span>Tournament details and settings</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-600">•</span>
              <span>{categoryCount} category/categories</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-600">•</span>
              <span>{participantCount} player registration(s)</span>
            </li>
            {paidCount > 0 && (
              <li className="flex gap-2">
                <span className="text-red-600">•</span>
                <span>{paidCount} paid registration(s) - consider refunding</span>
              </li>
            )}
            <li className="flex gap-2">
              <span className="text-red-600">•</span>
              <span>All matches and results</span>
            </li>
            {tournament?.poster_url && (
              <li className="flex gap-2">
                <span className="text-red-600">•</span>
                <span>Tournament poster</span>
              </li>
            )}
          </ul>
        </div>

        {/* Paid Registrations Warning */}
        {paidCount > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-900">
              ⚠️ <span className="font-semibold">{paidCount} player(s) have paid</span> for this tournament.
              Consider refunding them before deletion.
            </p>
          </div>
        )}

        {/* Confirmation Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Type "DELETE" to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setError('');
            }}
            placeholder="Type DELETE"
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || confirmText !== 'DELETE'}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="p-0" />
                Deleting...
              </>
            ) : (
              'Delete Tournament'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTournamentModal;
