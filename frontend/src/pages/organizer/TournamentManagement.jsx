import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, List, Trophy, Loader2, AlertCircle, CheckCircle2, Trash2, Image } from 'lucide-react';
import { tournamentAPI, participantAPI, matchAPI, scoreAPI, categoryAPI } from '../../services/api';
import MatchCard from '../../components/organizer/MatchCard';
import StandingsTable from '../../components/tournaments/StandingsTable';
import BracketView from '../../components/tournaments/BracketView';
import DeleteTournamentModal from '../../components/organizer/DeleteTournamentModal';
import PosterUpload from '../../components/organizer/PosterUpload';
import { ListSkeleton, MatchCardSkeleton } from '../../components/common/SkeletonLoader';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TournamentManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('participants');
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch tournament data and participants
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tournament details
        const tournamentData = await tournamentAPI.getById(id);
        setTournament(tournamentData);

        // Fetch categories if tournament has them
        try {
          const categoriesData = await categoryAPI.getByTournament(id);
          setCategories(categoriesData || []);
          if (categoriesData && categoriesData.length > 0) {
            setSelectedCategory(categoriesData[0].category_id);
          }
        } catch (err) {
          // Categories might not exist, that's okay
          setCategories([]);
        }

        // Fetch participants
        const participantsData = await participantAPI.getParticipants(id);
        setParticipants(participantsData);

        // Fetch matches if they exist
        try {
          const matchesData = await matchAPI.getTournamentMatches(id);
          setMatches(matchesData);
        } catch (err) {
          // Matches might not exist yet, that's okay
          setMatches([]);
        }
      } catch (err) {
        console.error('Error fetching tournament data:', err);
        setError(err.message || 'Failed to load tournament data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleGenerateMatches = async () => {
    if (!window.confirm(`Generate matches for ${participants.length} players?`)) {
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      
      // Call API to generate matches
      const newMatches = await matchAPI.generateMatches(id);
      setMatches(newMatches);
      setSuccessMessage(`Successfully generated ${newMatches.length} matches!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Switch to matches tab
      setActiveTab('matches');
    } catch (err) {
      console.error('Error generating matches:', err);
      setError(err.message || 'Failed to generate matches');
    } finally {
      setGenerating(false);
    }
  };

  const handleBack = () => {
    navigate('/organizer/dashboard');
  };

  const canDeleteTournament = () => {
    if (!tournament) return false;
    if (tournament.status === 'live' || tournament.status === 'completed') return false;
    const tournamentDate = new Date(tournament.date);
    return tournamentDate > new Date();
  };

  const handleDeleteTournament = async () => {
    setDeleting(true);
    setError(null);

    try {
      await tournamentAPI.delete(id);
      setSuccessMessage('Tournament deleted successfully!');
      setTimeout(() => {
        navigate('/organizer/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error deleting tournament:', err);
      setError(err.message || 'Failed to delete tournament');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleScoreSubmit = async (matchId, scores) => {
    try {
      setError(null);
      
      // Call API to submit score
      const updatedMatch = await scoreAPI.submitScore(matchId, scores);
      
      // Update local state with the updated match
      setMatches((prevMatches) =>
        prevMatches.map((match) =>
          match.match_id === matchId
            ? {
                ...match,
                player1_score: scores.player1_score,
                player2_score: scores.player2_score,
                winner_id: updatedMatch.winner_id,
                status: 'completed',
              }
            : match
        )
      );

      setSuccessMessage('Score submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error submitting score:', err);
      setError(err.message || 'Failed to submit score');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="p-4">
          <ListSkeleton items={5} height="h-20" />
        </div>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorDisplay
          error={{ message: error }}
          onRetry={() => window.location.reload()}
          onGoHome={handleBack}
          showHomeButton={true}
          title="Failed to Load Tournament"
          message="We couldn't load the tournament data. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            {canDeleteTournament() && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{tournament?.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
            <span>📍 {tournament?.venue}</span>
            <span>•</span>
            <span>📅 {new Date(tournament?.date).toLocaleDateString()}</span>
            <span>•</span>
            <span className="capitalize">🏸 {tournament?.match_type}</span>
            <span>•</span>
            <span className="capitalize">🏆 {tournament?.format}</span>
          </div>
          <div className="mt-3">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                tournament?.status === 'upcoming'
                  ? 'bg-green-100 text-green-800'
                  : tournament?.status === 'live'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {tournament?.status?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'participants'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Participants
              <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs">
                {participants.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'matches'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              Matches
              <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs">
                {matches.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'results'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Results
            </button>
            <button
              onClick={() => setActiveTab('poster')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === 'poster'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Image className="w-4 h-4" />
              Poster
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {activeTab === 'participants' && (
          <ParticipantsTab
            participants={participants}
            tournament={tournament}
            matches={matches}
            onGenerateMatches={handleGenerateMatches}
            generating={generating}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesTab
            matches={matches}
            tournament={tournament}
            onScoreSubmit={handleScoreSubmit}
          />
        )}

        {activeTab === 'results' && (
          <ResultsTab
            tournament={tournament}
            matches={matches}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {activeTab === 'poster' && tournament && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tournament Poster</h2>
            <PosterUpload
              tournamentId={tournament.tournament_id}
              currentPosterUrl={tournament.poster_url}
              onUploadSuccess={(posterUrl) => {
                setTournament(prev => ({ ...prev, poster_url: posterUrl }));
                setSuccessMessage('Poster uploaded successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
              }}
              onRemoveSuccess={() => {
                setTournament(prev => ({ ...prev, poster_url: null }));
                setSuccessMessage('Poster removed successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
              }}
            />
          </div>
        )}
      </div>

      {/* Delete Tournament Modal */}
      <DeleteTournamentModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteTournament}
        tournament={tournament}
        participantCount={participants.length}
        paidCount={0} // TODO: Calculate from registrations with payment_status = 'paid'
        categoryCount={categories.length}
        isLoading={deleting}
      />
    </div>
  );
};

const ParticipantsTab = ({ participants, tournament, matches, onGenerateMatches, generating }) => {
  const canGenerateMatches =
    matches.length === 0 &&
    participants.length >= 2 &&
    tournament?.status === 'upcoming';

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <div className="bg-white rounded-lg border shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Players Joined</p>
            <p className="text-4xl font-bold text-gray-900">
              {participants.length}{' '}
              <span className="text-2xl text-gray-400">/ {tournament?.max_players}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Tournament Status</p>
            <p className="text-lg font-semibold">
              {participants.length === tournament?.max_players ? (
                <span className="text-green-600 flex items-center justify-end gap-1">
                  <span className="text-2xl">✓</span> Full
                </span>
              ) : (
                <span className="text-orange-600">
                  {tournament?.max_players - participants.length} spots left
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out"
              style={{
                width: `${(participants.length / tournament?.max_players) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {Math.round((participants.length / tournament?.max_players) * 100)}% filled
          </p>
        </div>
      </div>

      {/* Generate Matches Button */}
      {canGenerateMatches && (
        <button
          onClick={onGenerateMatches}
          disabled={generating}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          {generating ? (
            <>
              <LoadingSpinner size="sm" className="p-0" />
              Generating Matches...
            </>
          ) : (
            <>
              <List className="w-5 h-5" />
              Generate Matches
            </>
          )}
        </button>
      )}

      {matches.length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 shadow-sm">
          <p className="text-green-800 font-medium flex items-center gap-2">
            <span className="text-xl">✓</span>
            Matches have been generated! Switch to the Matches tab to enter scores.
          </p>
        </div>
      )}

      {participants.length < 2 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 shadow-sm">
          <p className="text-yellow-800 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            Need at least 2 players to generate matches. Currently {participants.length} player(s)
            joined.
          </p>
        </div>
      )}

      {/* Participants List */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Registered Players</h2>
        </div>
        {participants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">No players have joined yet</p>
            <p className="text-sm mt-1">Share your tournament to get players!</p>
          </div>
        ) : (
          <div className="divide-y">
            {participants.map((participant, index) => (
              <div key={participant.participant_id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{participant.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-0.5">
                        <span>📍 {participant.city}</span>
                        <span>•</span>
                        <span>{participant.matches_played || 0} matches</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p className="font-medium">Joined</p>
                    <p>{new Date(participant.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience Mix Summary */}
      {participants.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Participant Mix</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{participants.length}</span> players joined
            </p>
            <p className="text-sm text-gray-600">
              Average experience: <span className="font-medium text-gray-900">
                {Math.round(participants.reduce((sum, p) => sum + (p.matches_played || 0), 0) / participants.length)} matches
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const MatchesTab = ({ matches, tournament, onScoreSubmit }) => {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <List className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
        <p className="text-lg text-gray-600 mb-2">No matches generated yet</p>
        <p className="text-sm text-gray-500">
          Go to the Participants tab to generate matches
        </p>
      </div>
    );
  }

  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    const round = match.round || 'Unassigned';
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {});

  // Define round order for knockout tournaments
  const roundOrder = [
    'Finals',
    'Semi Finals',
    'Quarter Finals',
    'Round of 16',
    'Round of 32',
    'Round of 64',
  ];

  const sortedRounds = Object.keys(matchesByRound).sort((a, b) => {
    const aIndex = roundOrder.indexOf(a);
    const bIndex = roundOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Calculate stats
  const completedMatches = matches.filter((m) => m.status === 'completed').length;
  const totalMatches = matches.length;

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700 font-medium">Total Matches</p>
            <p className="text-3xl font-bold text-blue-600">{totalMatches}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedMatches}</p>
          </div>
          <div>
            <p className="text-sm text-gray-700 font-medium">Remaining</p>
            <p className="text-3xl font-bold text-orange-600">{totalMatches - completedMatches}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500"
              style={{ width: `${(completedMatches / totalMatches) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2 text-right">
            {Math.round((completedMatches / totalMatches) * 100)}% complete
          </p>
        </div>
      </div>

      {/* Matches by Round */}
      <div className="space-y-6">
        {sortedRounds.map((round) => (
          <div key={round}>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">
              {round}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({matchesByRound[round].length} matches)
              </span>
            </h3>
            <div className="space-y-3">
              {matchesByRound[round].map((match) => (
                <MatchCard
                  key={match.match_id}
                  match={match}
                  tournament={tournament}
                  onScoreSubmit={onScoreSubmit}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultsTab = ({ tournament, matches, categories, selectedCategory, onSelectCategory }) => {
  // If tournament has categories, show category selector
  if (categories.length > 0) {
    return (
      <div className="space-y-4">
        {/* Category Selector */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Category</label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Results based on format */}
        {selectedCategory && (
          <>
            {tournament?.format === 'league' ? (
              <StandingsTable tournamentId={tournament.tournament_id} categoryId={selectedCategory} />
            ) : (
              <BracketView
                matches={matches.filter((m) => m.category_id === selectedCategory)}
                format={tournament?.format || 'knockout'}
                categoryName={categories.find((c) => c.category_id === selectedCategory)?.category_name}
              />
            )}
          </>
        )}
      </div>
    );
  }

  // Single category tournament
  return (
    <>
      {tournament?.format === 'league' ? (
        <StandingsTable tournamentId={tournament?.tournament_id} categoryId={tournament?.tournament_id} />
      ) : (
        <BracketView
          matches={matches}
          format={tournament?.format || 'knockout'}
          categoryName={tournament?.name}
        />
      )}
    </>
  );
};

export default TournamentManagement;
