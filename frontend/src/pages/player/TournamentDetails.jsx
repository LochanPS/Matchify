import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { tournamentAPI, participantAPI, categoryAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { TournamentDetailsSkeleton } from '../../components/common/SkeletonLoader';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import BracketView from '../../components/tournaments/BracketView';
import CategoryRegistrationForm from '../../components/tournaments/CategoryRegistrationForm';
import PaymentModal from '../../components/tournaments/PaymentModal';
import PaymentConfirmation from '../../components/tournaments/PaymentConfirmation';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [registeredCategories, setRegisteredCategories] = useState([]);
  const [isParticipant, setIsParticipant] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    fetchTournamentDetails();
  }, [id]);

  const fetchTournamentDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [tournamentData, participantsData, participationStatus, categoriesData] = await Promise.all([
        tournamentAPI.getById(id),
        participantAPI.getParticipants(id),
        participantAPI.checkParticipation(id),
        categoryAPI.getByTournament(id),
      ]);

      setTournament(tournamentData);
      setParticipants(participantsData);
      setIsParticipant(participationStatus.is_participant);
      setCategories(categoriesData || []);

      // Get registered categories for current user
      if (user?.user_id) {
        const registered = categoriesData
          ?.filter((cat) => cat.participants?.some((p) => p.player_id === user.user_id))
          .map((cat) => cat.category_id) || [];
        setRegisteredCategories(registered);
      }
    } catch (err) {
      console.error('Failed to fetch tournament details:', err);
      setError(err.message || 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await participantAPI.join(id);
      setIsParticipant(true);
      setSuccessMessage('Successfully joined the tournament!');
      setTimeout(() => {
        fetchTournamentDetails();
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      console.error('Failed to join tournament:', err);
      setError(err.message || 'Failed to join tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterCategory = async (category) => {
    setActionLoading(true);
    setError('');
    try {
      await categoryAPI.register(category.category_id, {
        player_id: user?.user_id,
      });
      setSuccessMessage(`Successfully registered for ${category.category_name}!`);
      setShowRegistrationModal(false);
      setSelectedCategory(null);
      setTimeout(() => {
        fetchTournamentDetails();
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      console.error('Failed to register for category:', err);
      setError(err.message || 'Failed to register for category');
    } finally {
      setActionLoading(false);
    }
  };;

  const handleLeaveCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to leave this category?')) return;

    setActionLoading(true);
    setError('');
    try {
      await categoryAPI.leave(categoryId, user?.user_id);
      setSuccessMessage('Successfully left the category');
      setTimeout(() => {
        fetchTournamentDetails();
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      console.error('Failed to leave category:', err);
      setError(err.message || 'Failed to leave category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegistrationFormSubmit = async (formData) => {
    setRegistrationData({
      ...formData,
      player_id: user?.user_id,
    });
    setShowRegistrationModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentInfo) => {
    setPaymentData(paymentInfo);
    setShowPaymentModal(false);
    setShowConfirmation(true);

    // Refresh tournament details after successful payment
    setTimeout(() => {
      fetchTournamentDetails();
    }, 2000);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setShowRegistrationModal(false);
    setShowPaymentModal(false);
    setRegistrationData(null);
    setPaymentData(null);
    setSelectedCategory(null);
    fetchTournamentDetails();
  };

  const handleLeaveTournament = async () => {
    if (!window.confirm('Are you sure you want to leave this tournament?')) return;

    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await participantAPI.leave(id);
      setIsParticipant(false);
      setSuccessMessage('Successfully left the tournament');
      setTimeout(() => {
        fetchTournamentDetails();
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      console.error('Failed to leave tournament:', err);
      setError(err.message || 'Failed to leave tournament');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <TournamentDetailsSkeleton />;
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <Trophy className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Tournament not found</h2>
        <p className="text-gray-600 mb-6">The tournament you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to tournaments
        </button>
      </div>
    );
  }

  const slotsPercentage = (tournament.current_players / tournament.max_players) * 100;
  const isFull = tournament.current_players >= tournament.max_players;
  const isAlmostFull = slotsPercentage >= 75;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getCategorySlots = (category) => {
    return (category.current_participants / category.max_participants) * 100;
  };

  const isCategoryFull = (category) => {
    return category.current_participants >= category.max_participants;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Tournament Details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
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
            onRetry={fetchTournamentDetails}
            title="Failed to Load Tournament"
            message="We couldn't load the tournament details. Please try again."
          />
        )}

        {/* Tournament Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{tournament.name}</h2>
              <div className="flex items-center text-gray-600 gap-1 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{tournament.venue}</span>
              </div>
              <div className="flex items-center text-gray-600 gap-1">
                <MapPin className="w-4 h-4" />
                <span>{tournament.city}</span>
              </div>
            </div>
          </div>

          {tournament.description && (
            <p className="text-gray-600 text-sm mt-3">{tournament.description}</p>
          )}
        </div>

        {/* Tournament Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600 font-medium">Date</span>
            </div>
            <p className="font-semibold text-gray-900">{formatDate(tournament.date)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600 font-medium">Categories</span>
            </div>
            <p className="font-semibold text-gray-900">{categories.length}</p>
          </div>
        </div>

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Available Categories</h3>
            <div className="space-y-3">
              {categories.map((category) => {
                const isRegistered = registeredCategories.includes(category.category_id);
                const categoryFull = isCategoryFull(category);
                const categorySlots = getCategorySlots(category);

                return (
                  <div
                    key={category.category_id}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{category.category_name}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {category.match_type === 'singles'
                            ? 'Singles'
                            : category.match_type === 'doubles'
                              ? 'Doubles'
                              : 'Mixed Doubles'}
                        </p>
                      </div>
                      {isRegistered && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          Registered
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <p className="text-gray-600">Entry Fee</p>
                        <p className="font-semibold text-gray-900">₹{category.entry_fee}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Prize</p>
                        <p className="font-semibold text-gray-900">₹{category.prize_money_winner}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">
                          {category.current_participants}/{category.max_participants} registered
                        </span>
                        {categoryFull && (
                          <span className="text-xs font-medium text-red-600">Full</span>
                        )}
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            categoryFull ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${categorySlots}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isRegistered ? (
                        <button
                          onClick={() => handleLeaveCategory(category.category_id)}
                          disabled={actionLoading}
                          className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                        >
                          Leave
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowRegistrationModal(true);
                          }}
                          disabled={actionLoading || categoryFull}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {categoryFull ? 'Full' : 'Register'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Participants Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Participants
            </h3>
            <span className="text-sm font-medium text-gray-600">
              {participants.length} total
            </span>
          </div>

          {/* Participants List */}
          {participants.length > 0 ? (
            <div className="space-y-2">
              {participants.slice(0, 5).map((participant, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-t border-gray-100">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{participant.name}</p>
                    <p className="text-xs text-gray-600">
                      {participant.matches_played || 0} matches • {participant.win_rate || 0}% win rate
                    </p>
                  </div>
                  {isParticipant && participant.name === user?.name && (
                    <span className="text-xs font-medium text-blue-600">You</span>
                  )}
                </div>
              ))}
              {participants.length > 5 && (
                <p className="text-xs text-gray-600 text-center py-2">
                  +{participants.length - 5} more participants
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600 text-center py-4">No participants yet</p>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-2xl p-4 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <CategoryRegistrationForm
              tournament={tournament}
              category={selectedCategory}
              onSuccess={handleRegistrationFormSubmit}
              onClose={() => {
                setShowRegistrationModal(false);
                setSelectedCategory(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedCategory && registrationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-2xl p-4 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <PaymentModal
              tournament={tournament}
              category={selectedCategory}
              registrationData={registrationData}
              onSuccess={handlePaymentSuccess}
              onClose={() => {
                setShowPaymentModal(false);
                setShowRegistrationModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showConfirmation && selectedCategory && paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-2xl p-4 space-y-4 animate-slide-up max-h-[90vh] overflow-y-auto">
            <PaymentConfirmation
              tournament={tournament}
              category={selectedCategory}
              paymentData={paymentData}
              onClose={handleConfirmationClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetails;
