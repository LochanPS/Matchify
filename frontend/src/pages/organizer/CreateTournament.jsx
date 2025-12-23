import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Trophy,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { tournamentAPI } from '../../services/api';

const CreateTournament = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    venue: '',
    city: '',
    date: '',
    match_type: 'singles',
    format: 'knockout',
    entry_fee: '',
    prize_money: '',
    max_players: '16',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tournament name is required';
    }

    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date must be in the future';
      }
    }

    if (formData.entry_fee && parseFloat(formData.entry_fee) < 0) {
      newErrors.entry_fee = 'Entry fee cannot be negative';
    }

    if (formData.prize_money && parseFloat(formData.prize_money) < 0) {
      newErrors.prize_money = 'Prize money cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const tournamentData = {
        name: formData.name.trim(),
        venue: formData.venue.trim(),
        city: formData.city.trim(),
        date: formData.date,
        match_type: formData.match_type,
        format: formData.format,
        entry_fee: parseFloat(formData.entry_fee) || 0,
        prize_money: parseFloat(formData.prize_money) || 0,
        max_players: parseInt(formData.max_players),
        description: formData.description.trim(),
      };

      // Create tournament
      await tournamentAPI.create(tournamentData);

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/organizer/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating tournament:', err);
      setApiError(err.message || 'Failed to create tournament. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/organizer/dashboard')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Create Tournament</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Error */}
          {apiError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">
                Tournament created successfully! Redirecting...
              </p>
            </div>
          )}

          {/* Tournament Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tournament Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Sunday Singles Championship"
              className={`w-full h-14 px-4 rounded-lg border-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Venue Address <span className="text-red-500">*</span>
              </div>
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              placeholder="e.g., Sports Complex, MG Road"
              className={`w-full h-14 px-4 rounded-lg border-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.venue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.venue && <p className="mt-2 text-sm text-red-600">{errors.venue}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g., Bangalore"
              className={`w-full h-14 px-4 rounded-lg border-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tournament Date <span className="text-red-500">*</span>
              </div>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={getMinDate()}
              className={`w-full h-14 px-4 rounded-lg border-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.date ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.date && <p className="mt-2 text-sm text-red-600">{errors.date}</p>}
          </div>

          {/* Match Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Match Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, match_type: 'singles' }))}
                className={`h-14 rounded-lg border-2 font-medium transition-all ${
                  formData.match_type === 'singles'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                Singles
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, match_type: 'doubles' }))}
                className={`h-14 rounded-lg border-2 font-medium transition-all ${
                  formData.match_type === 'doubles'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                Doubles
              </button>
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tournament Format <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, format: 'knockout' }))}
                className={`h-14 rounded-lg border-2 font-medium transition-all ${
                  formData.format === 'knockout'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                Knockout
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, format: 'league' }))}
                className={`h-14 rounded-lg border-2 font-medium transition-all ${
                  formData.format === 'league'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                League
              </button>
            </div>
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Maximum Players <span className="text-red-500">*</span>
              </div>
            </label>
            <select
              name="max_players"
              value={formData.max_players}
              onChange={handleInputChange}
              className="w-full h-14 px-4 rounded-lg border-2 border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="8">8 Players</option>
              <option value="16">16 Players</option>
              <option value="32">32 Players</option>
            </select>
          </div>

          {/* Entry Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Entry Fee (₹)
              </div>
            </label>
            <input
              type="number"
              name="entry_fee"
              value={formData.entry_fee}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="50"
              className={`w-full h-14 px-4 rounded-lg border-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.entry_fee ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.entry_fee && <p className="mt-2 text-sm text-red-600">{errors.entry_fee}</p>}
            <p className="mt-2 text-sm text-gray-500">Leave blank for free tournaments</p>
          </div>

          {/* Prize Money */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Prize Money (₹)
              </div>
            </label>
            <input
              type="number"
              name="prize_money"
              value={formData.prize_money}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="100"
              className={`w-full h-14 px-4 rounded-lg border-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.prize_money ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.prize_money && (
              <p className="mt-2 text-sm text-red-600">{errors.prize_money}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">Total prize pool for winners</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add any additional details about the tournament..."
              rows="4"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
          </div>

          {/* Note about poster upload */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Tournament Poster</h4>
                <p className="text-sm text-blue-800">
                  You can add a tournament poster after creation from the tournament management page. 
                  Posters help attract more participants and make your tournament look professional.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || showSuccess}
            className="w-full h-16 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Created!
              </>
            ) : (
              'Create Tournament'
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            <span className="text-red-500">*</span> Required fields
          </p>
        </form>
      </div>
    </div>
  );
};

export default CreateTournament;
