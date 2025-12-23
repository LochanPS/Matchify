import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Trophy, ChevronRight, AlertCircle } from 'lucide-react';
import { tournamentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { TournamentCardSkeleton } from '../../components/common/SkeletonLoader';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import PullToRefresh from '../../components/common/PullToRefresh';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { usePageLoadTime } from '../../hooks/usePageLoadTime';

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
      {/* Header */}
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

      {/* Date */}
      <div className="flex items-center text-sm text-gray-700 mb-3">
        <Calendar className="w-4 h-4 mr-1.5" />
        <span className="font-medium">{formatDate(tournament.date)}</span>
      </div>

      {/* Slots Progress */}
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

      {/* Footer */}
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
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <TournamentCardSkeleton key={i} />
    ))}
  </div>
);

const TournamentList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  usePageLoadTime('TournamentList');

  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const observerTarget = useRef(null);
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'singles', label: 'Singles' },
    { id: 'doubles', label: 'Doubles' },
    { id: 'available', label: 'Available' },
  ];

  // Build filter params
  const getFilterParams = useCallback(() => {
    const params = { status: 'upcoming' };
    if (selectedFilter === 'singles') params.match_type = 'singles';
    if (selectedFilter === 'doubles') params.match_type = 'doubles';
    return params;
  }, [selectedFilter]);

  // Fetch tournaments
  const fetchTournaments = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');

      const data = await tournamentAPI.list({
        ...getFilterParams(),
        page: pageNum,
        limit: 20,
      });

      if (pageNum === 1) {
        setTournaments(data.tournaments || []);
      } else {
        setTournaments((prev) => [...prev, ...(data.tournaments || [])]);
      }

      // Check if there are more pages
      setHasMore(data.pagination?.hasMore ?? true);
    } catch (err) {
      console.error('Failed to fetch tournaments:', err);
      setError(err.message || 'Failed to load tournaments. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [getFilterParams]);

  // Initial load
  useEffect(() => {
    setPage(1);
    setTournaments([]);
    setHasMore(true);
    fetchTournaments(1);
  }, [selectedFilter, fetchTournaments]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchTournaments(page);
    }
  }, [page, fetchTournaments]);

  // Filter tournaments based on search
  const filteredTournaments = tournaments.filter((tournament) => {
    if (selectedFilter === 'available' && tournament.current_players >= tournament.max_players) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tournament.name.toLowerCase().includes(query) ||
        tournament.venue.toLowerCase().includes(query) ||
        (tournament.city && tournament.city.toLowerCase().includes(query))
      );
    }

    return true;
  });

  const handleTournamentClick = (tournament) => {
    navigate(`/tournaments/${tournament.tournament_id}`);
  };

  const handleRetry = () => {
    setPage(1);
    setTournaments([]);
    setHasMore(true);
    fetchTournaments(1);
  };

  const handleRefresh = async () => {
    setPage(1);
    setTournaments([]);
    setHasMore(true);
    await fetchTournaments(1, true);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={loading}>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tournaments</h1>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tournaments, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          {/* Error State */}
          {error && !loading && (
            <ErrorDisplay
              error={{ message: error }}
              onRetry={handleRetry}
              title="Failed to Load Tournaments"
              message="We couldn't load the tournaments. Please check your connection and try again."
            />
          )}

          {/* Results Count */}
          {!loading && !error && tournaments.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? 's' : ''}{' '}
                found
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && <LoadingSkeleton />}

          {/* Tournament List */}
          {!loading && filteredTournaments.length > 0 && (
            <div>
              {filteredTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.tournament_id}
                  tournament={tournament}
                  onClick={() => handleTournamentClick(tournament)}
                />
              ))}
            </div>
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          )}

          {/* Intersection Observer Target */}
          <div ref={observerTarget} className="h-10" />

          {/* End of List Message */}
          {!hasMore && tournaments.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No more tournaments to show</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && tournaments.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tournaments found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'No upcoming tournaments available right now'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

export default TournamentList;
