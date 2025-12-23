import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar,
  Users,
  Trophy,
  ChevronRight,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { tournamentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const OrganizerTournamentCard = ({ tournament, onViewClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'live':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'live':
        return 'Live';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const slotPercentage = (tournament.current_players / tournament.max_players) * 100;

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 active:bg-gray-50 transition-colors cursor-pointer hover:shadow-md"
      onClick={() => onViewClick(tournament.tournament_id)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg text-gray-900 flex-1 pr-2">
          {tournament.name}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
            tournament.status
          )}`}
        >
          {getStatusText(tournament.status)}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{formatDate(tournament.date)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{tournament.venue}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600 flex items-center">
            <Users className="w-4 h-4 mr-1" />
            Players
          </span>
          <span className="text-sm font-medium text-gray-900">
            {tournament.current_players}/{tournament.max_players}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              slotPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${slotPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex gap-4 text-sm">
          <span className="text-gray-600">
            <span className="font-medium text-gray-900">₹{tournament.entry_fee}</span> Entry
          </span>
          <span className="text-gray-600">
            <Trophy className="w-4 h-4 inline mr-1" />
            <span className="font-medium text-gray-900">₹{tournament.prize_money}</span>
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
    <div className="h-2 bg-gray-200 rounded w-full"></div>
  </div>
);

const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (user) {
      fetchTournaments();
    }
  }, [user]);

  const fetchTournaments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await tournamentAPI.getOrganizerTournaments(user.user_id);
      setTournaments(data);
    } catch (err) {
      console.error('Failed to fetch tournaments:', err);
      setError(err.message || 'Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = () => {
    navigate('/organizer/tournaments/create');
  };

  const handleViewTournament = (tournamentId) => {
    navigate(`/organizer/tournaments/${tournamentId}/manage`);
  };

  const filteredTournaments = tournaments.filter((t) => t.status === activeTab);

  const tabs = [
    {
      id: 'upcoming',
      label: 'Upcoming',
      count: tournaments.filter((t) => t.status === 'upcoming').length,
    },
    {
      id: 'live',
      label: 'Live',
      count: tournaments.filter((t) => t.status === 'live').length,
    },
    {
      id: 'completed',
      label: 'Completed',
      count: tournaments.filter((t) => t.status === 'completed').length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Tournaments</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all your tournaments</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab.id ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
              <button
                onClick={fetchTournaments}
                className="text-xs text-red-600 hover:text-red-700 mt-2 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : filteredTournaments.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} tournaments
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' &&
                'Create your first tournament to get started'}
              {activeTab === 'live' &&
                'No tournaments are currently in progress'}
              {activeTab === 'completed' &&
                "You haven't completed any tournaments yet"}
            </p>
            {activeTab === 'upcoming' && (
              <button
                onClick={handleCreateTournament}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Tournament
              </button>
            )}
          </div>
        ) : (
          // Tournament List
          <div>
            {filteredTournaments.map((tournament) => (
              <OrganizerTournamentCard
                key={tournament.tournament_id}
                tournament={tournament}
                onViewClick={handleViewTournament}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleCreateTournament}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 active:scale-95 transition-all z-20 flex items-center justify-center"
        style={{ width: '64px', height: '64px' }}
        title="Create Tournament"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
};

export default OrganizerDashboard;
