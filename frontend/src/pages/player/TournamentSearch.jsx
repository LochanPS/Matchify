import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Trophy, Filter, X } from 'lucide-react';
import { tournamentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { TournamentCardSkeleton } from '../../components/common/SkeletonLoader';
import ErrorDisplay from '../../components/common/ErrorDisplay';

const TournamentCard = ({ tournament, onClick }) => {
  const slotsPercentage = (tournament.current_players / tournament.max_players) * 100;
  const isFull = tournament.current_players >= tournament.max_players;
  const isAlmostFull = slotsPercentage >= 75;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1">
            {tournament.name}
          </h3>
          <div className="flex items-center text-sm text-gray-600 gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{tournament.venue}</span>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            tournament.match_type === 'singles'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-purple-50 text-purple-700'
          }`}
        >
          {tournament.match_type === 'singles' ? 'Singles' : 'Doubles'}
        </span>
      </div>

      <div className="flex items-center text-sm text-gray-700 mb-3">
        <Calendar className="w-4 h-4 mr-1.5" />
        <span className="font-medium">{formatDate(tournament.date)}</span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-1.5 text-gray-600" />
            <span
              className={`font-medium ${
                isFull ? 'text-red-600' : isAlmostFull ? 'text-orange-600' : 'text-gray-700'
              }`}
            >
              {tournament.current_players}/{tournament.max_players} players
            </span>
          </div>
          {isFull && <span className="text-xs font-semibold text-red-600">FULL</span>}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isFull ? 'bg-red-500' : isAlmostFull ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${slotsPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-gray-500">Entry:</span>
            <span className="font-semibold text-gray-900 ml-1">₹{tournament.entry_fee}</span>
          </div>
          <div className="text-sm flex items-center">
            <Trophy className="w-3.5 h-3.5 text-yellow-500 mr-1" />
            <span className="font-semibold text-gray-900">₹{tournament.prize_money}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterModal = ({ isOpen, onClose, filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      matchType: 'all',
      city: '',
      dateRange: 'all',
      availability: 'all'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filter Tournaments</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Match Type</label>
            <div className="flex gap-2">
              {['all', 'singles', 'doubles'].map((type) => (
                <button
                  key={type}
                  onClick={() => setLocalFilters({ ...localFilters, matchType: type })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                    localFilters.matchType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All' },
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' }
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setLocalFilters({ ...localFilters, dateRange: range.id })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    localFilters.dateRange === range.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'available', label: 'Open Slots' },
                { id: 'filling', label: 'Filling Fast' }
              ].map((avail) => (
                <button
                  key={avail.id}
                  onClick={() => setLocalFilters({ ...localFilters, availability: avail.id })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    localFilters.availability === avail.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {avail.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const TournamentSearch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    matchType: 'all',
    city: '',
    dateRange: 'all',
    availability: 'all'
  });

  useEffect(() => {
    if (searchQuery.length >= 2 || Object.values(filters).some(f => f !== 'all' && f !== '')) {
      searchTournaments();
    } else {
      setTournaments([]);
    }
  }, [searchQuery, filters]);

  const searchTournaments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        status: 'upcoming',
        limit: 50,
      };

      if (searchQuery.length >= 2) {
        params.search = searchQuery;
      }

      if (filters.matchType !== 'all') {
        params.match_type = filters.matchType;
      }

      if (filters.city) {
        params.city = filters.city;
      }

      const data = await tournamentAPI.list(params);
      
      // Apply client-side filters
      let filteredData = data;

      if (filters.availability === 'available') {
        filteredData = filteredData.filter(t => t.current_players < t.max_players);
      } else if (filters.availability === 'filling') {
        filteredData = filteredData.filter(t => {
          const percentage = (t.current_players / t.max_players) * 100;
          return percentage >= 75 && percentage < 100;
        });
      }

      if (filters.dateRange !== 'all') {
        const now = new Date();
        filteredData = filteredData.filter(t => {
          const tournamentDate = new Date(t.date);
          switch (filters.dateRange) {
            case 'today':
              return tournamentDate.toDateString() === now.toDateString();
            case 'week':
              const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              return tournamentDate >= now && tournamentDate <= weekFromNow;
            case 'month':
              const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              return tournamentDate >= now && tournamentDate <= monthFromNow;
            default:
              return true;
          }
        });
      }

      setTournaments(filteredData);
    } catch (err) {
      console.error('Failed to search tournaments:', err);
      setError(err.message || 'Failed to search tournaments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentClick = (tournament) => {
    navigate(`/tournaments/${tournament.tournament_id}`);
  };

  const activeFiltersCount = Object.values(filters).filter(f => f !== 'all' && f !== '').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Tournaments</h1>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tournaments, venues, cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Search Prompt */}
        {!searchQuery && activeFiltersCount === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Search for Tournaments</h3>
            <p className="text-gray-600">
              Enter a tournament name, venue, or city to find tournaments
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorDisplay
            error={{ message: error }}
            onRetry={searchTournaments}
            title="Search Failed"
            message="We couldn't search tournaments. Please try again."
          />
        )}

        {/* Results Count */}
        {!loading && !error && tournaments.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div>
            {[1, 2, 3].map((i) => (
              <TournamentCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Tournament Results */}
        {!loading && tournaments.length > 0 && (
          <div>
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.tournament_id}
                tournament={tournament}
                onClick={() => handleTournamentClick(tournament)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && (searchQuery.length >= 2 || activeFiltersCount > 0) && tournaments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tournaments found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  matchType: 'all',
                  city: '',
                  dateRange: 'all',
                  availability: 'all'
                });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Clear search and filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
};

export default TournamentSearch;