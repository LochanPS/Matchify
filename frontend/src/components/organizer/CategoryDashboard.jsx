import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Trophy, 
  Edit2, 
  Trash2, 
  Play, 
  Download, 
  Mail,
  MoreVertical,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { categoryAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const CategoryCard = ({ category, onEdit, onDelete, onGenerateMatches, onViewParticipants }) => {
  const [showActions, setShowActions] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const progressPercentage = (category.current_participants / category.max_participants) * 100;
  const isFull = category.current_participants >= category.max_participants;
  const canGenerateMatches = category.current_participants >= 4; // Minimum for tournament

  const fetchParticipants = async () => {
    if (participants.length > 0) return; // Already loaded
    
    setLoadingParticipants(true);
    try {
      const data = await categoryAPI.getCategoryParticipants(category.category_id);
      setParticipants(data.participants || []);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return CheckCircle2;
      case 'pending':
        return Clock;
      case 'failed':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {category.category_name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              {category.match_type === 'singles' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
              {category.match_type === 'singles' ? 'Singles' : 'Doubles'}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {category.format === 'knockout' ? 'Knockout' : 'League'}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-48">
              <button
                onClick={() => {
                  onEdit(category);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Category
              </button>
              
              {canGenerateMatches && (
                <button
                  onClick={() => {
                    onGenerateMatches(category);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Generate Matches
                </button>
              )}
              
              <button
                onClick={() => {
                  fetchParticipants();
                  onViewParticipants(category, participants);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Participants
              </button>
              
              <button
                onClick={() => {
                  // TODO: Implement send notification
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Notification
              </button>
              
              <hr className="my-1" />
              
              <button
                onClick={() => {
                  onDelete(category);
                  setShowActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {category.current_participants}
          </div>
          <div className="text-xs text-gray-600">Registered</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            ₹{(category.entry_fee * category.current_participants).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Collected</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            ₹{category.prize_money_winner.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Winner Prize</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            {category.current_participants}/{category.max_participants} slots filled
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            isFull ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {isFull ? 'Full' : `${Math.round(progressPercentage)}%`}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isFull ? 'bg-red-500' : progressPercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Recent Participants Preview */}
      {participants.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Registrations</h4>
          <div className="space-y-2">
            {participants.slice(0, 3).map((participant) => {
              const StatusIcon = getPaymentStatusIcon(participant.payment_status);
              return (
                <div key={participant.registration_id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">{participant.player_name}</span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                    getPaymentStatusColor(participant.payment_status)
                  }`}>
                    <StatusIcon className="w-3 h-3" />
                    {participant.payment_status}
                  </span>
                </div>
              );
            })}
            {participants.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{participants.length - 3} more participants
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(category)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
        
        {canGenerateMatches ? (
          <button
            onClick={() => onGenerateMatches(category)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Generate Matches
          </button>
        ) : (
          <button
            disabled
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Need {4 - category.current_participants} more
          </button>
        )}
      </div>
    </div>
  );
};

const CategoryDashboard = ({ tournamentId, categories, onCategoryUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = (category) => {
    // TODO: Open edit modal
    console.log('Edit category:', category);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.category_name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await categoryAPI.delete(category.category_id);
      onCategoryUpdate(); // Refresh categories
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError(err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMatches = async (category) => {
    if (!window.confirm(`Generate matches for "${category.category_name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await categoryAPI.generateMatches(category.category_id, category.format);
      onCategoryUpdate(); // Refresh categories
    } catch (err) {
      console.error('Failed to generate matches:', err);
      setError(err.message || 'Failed to generate matches');
    } finally {
      setLoading(false);
    }
  };

  const handleViewParticipants = (category, participants) => {
    // TODO: Open participants modal or export
    console.log('View participants for:', category.category_name, participants);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Processing..." />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Yet</h3>
        <p className="text-gray-600 mb-6">
          Create your first category to start accepting registrations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-xs text-red-600 hover:text-red-700 mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.reduce((sum, cat) => sum + cat.current_participants, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{categories.reduce((sum, cat) => sum + (cat.entry_fee * cat.current_participants), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Prize Pool</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{categories.reduce((sum, cat) => sum + cat.prize_money_winner + cat.prize_money_runner_up, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.category_id}
            category={category}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onGenerateMatches={handleGenerateMatches}
            onViewParticipants={handleViewParticipants}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryDashboard;