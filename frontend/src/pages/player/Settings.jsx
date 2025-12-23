import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  Lock,
  Trash2,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call API to delete account
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/users/${user?.user_id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setSuccessMessage('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Go back to profile"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <main className="px-4 py-4">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
        )}

        {/* Account Settings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Account</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Notifications */}
            <button
              onClick={() => navigate('/settings/notifications')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-xs text-gray-600 mt-0.5">Manage notification preferences</p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </button>

            {/* Privacy & Security */}
            <button
              onClick={() => navigate('/settings/privacy')}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Privacy & Security</p>
                  <p className="text-xs text-gray-600 mt-0.5">Manage your privacy settings</p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-orange-600" />
                <div className="text-left">
                  <p className="font-medium text-orange-600">Logout</p>
                  <p className="text-xs text-gray-600 mt-0.5">Sign out of your account</p>
                </div>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 mb-4 overflow-hidden">
          <div className="px-4 py-3 bg-red-50 border-b border-red-200">
            <h2 className="font-semibold text-red-900">Danger Zone</h2>
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-gray-600 mt-0.5">Permanently delete your account and all data</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">About</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-900">App Version:</span> 1.0.0
            </p>
            <p>
              <span className="font-medium text-gray-900">Last Updated:</span> December 2024
            </p>
            <div className="pt-2 border-t border-gray-200 mt-3">
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Privacy Policy
              </button>
              <span className="text-gray-400 mx-2">•</span>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-2xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                  setError('');
                }}
                disabled={loading}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Warning */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
              <p className="font-semibold text-red-900">⚠️ This action cannot be undone</p>
              <p className="text-sm text-red-800">
                Deleting your account will:
              </p>
              <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
                <li>Permanently delete your profile and all personal data</li>
                <li>Remove you from all tournaments</li>
                <li>Delete your match history and statistics</li>
                <li>Cancel any pending registrations</li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setError('');
                }}
                placeholder="Type DELETE"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                  setError('');
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmText !== 'DELETE'}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="p-0" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
