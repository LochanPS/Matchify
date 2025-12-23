import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  MapPin,
  Trophy,
  Calendar,
  Edit2,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ActivityBadge from '../../components/player/ActivityBadge';
import StreakIndicator from '../../components/player/StreakIndicator';
import EditProfileModal from '../../components/player/EditProfileModal';
import SkipLinks from '../../components/common/SkipLinks';
import { ProfileSkeleton } from '../../components/common/SkeletonLoader';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PlayerProfile = () => {
  const navigate = useNavigate();
  const { user, logout, completeProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileData, statsData] = await Promise.all([
        userAPI.getProfile(user.user_id),
        userAPI.getStats(user.user_id),
      ]);

      setProfile(profileData);
      setStats(statsData);
      // Mock tournaments data
      setTournaments([
        {
          id: 1,
          name: 'Bangalore Open',
          date: '2024-12-28',
          status: 'upcoming',
        },
        {
          id: 2,
          name: 'HSR Layout Tournament',
          date: '2024-12-25',
          status: 'completed',
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (formData) => {
    setEditLoading(true);
    try {
      await completeProfile(formData);
      setProfile((prev) => ({
        ...prev,
        ...formData,
      }));
      setShowEditModal(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <SkipLinks />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Go back to tournaments"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
        </div>
      </div>

      {/* Content */}
      <main id="main-content" className="px-4 py-4">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-green-900">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <ErrorDisplay
            error={{ message: error }}
            onRetry={fetchProfileData}
            title="Failed to Load Profile"
            message="We couldn't load your profile data. Please try again."
          />
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
                <p className="text-gray-600 text-sm">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' }) : 'recently'}</p>
                {profile?.last_active && (
                  <p className="text-gray-500 text-xs mt-1">Last active: {new Date(profile.last_active).toLocaleDateString('en-IN')}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Edit profile"
              >
                <Edit2 className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* City & Activity Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            {profile?.city && (
              <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.city}
              </span>
            )}
            {stats && <ActivityBadge matchesPlayed={stats.matches_played || 0} />}
          </div>
        </div>

        {/* Match Record Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Match Record
          </h3>
          <div className="space-y-2">
            <p className="text-lg font-bold text-gray-900">{stats?.matches_played || 0} matches played</p>
            <p className="text-gray-600">
              <span className="font-semibold text-green-600">{stats?.wins || 0} wins</span>
              {' • '}
              <span className="font-semibold text-red-600">{stats?.losses || 0} losses</span>
            </p>
            <p className="text-2xl font-bold text-gray-900">
              Win rate: {stats?.matches_played > 0
                ? Math.round((stats.wins / stats.matches_played) * 100)
                : 0}%
            </p>
          </div>
        </div>

        {/* Tournament History Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Tournament History
          </h3>
          <div className="space-y-2">
            <p className="text-lg font-bold text-gray-900">{stats?.tournaments_joined || 0} tournaments joined</p>
            <p className="text-gray-600">{stats?.tournaments_completed || 0} completed</p>
          </div>
        </div>

        {/* Consistency Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Consistency</h3>
          {stats && <StreakIndicator currentStreak={stats.current_streak} bestStreak={stats.best_streak || 0} />}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {tournaments.length > 0 ? (
            <div className="space-y-3">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tournament.name}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(tournament.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tournament.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {tournament.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">No tournaments yet</p>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Account</h3>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-between px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            <span>Settings & Privacy</span>
            <span className="text-gray-400">›</span>
          </button>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditProfile}
        user={profile}
        isLoading={editLoading}
      />
    </div>
  );
};

export default PlayerProfile;
