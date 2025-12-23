import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PlayerOnboarding = () => {
  const navigate = useNavigate();
  const { user, completeProfile, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    city: ''
  });
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');

  const handleCompleteOnboarding = async () => {
    if (!formData.city.trim()) {
      setError('Please enter your city');
      return;
    }

    if (formData.city.trim().length < 2) {
      setError('City name must be at least 2 characters');
      return;
    }

    setApiError('');
    try {
      await completeProfile({
        city: formData.city.trim()
      });
      
      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Profile completion error:', err);
      setApiError(err.message || 'Failed to save profile. Please try again.');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step 1 of 1</span>
            <span className="text-sm font-medium text-blue-600">Almost done!</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full w-full transition-all duration-300"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="max-w-md mx-auto w-full px-4 pt-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to MATCHIFY!</h1>
            <p className="text-gray-600 text-lg">Let's set up your profile</p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{apiError}</p>
                <button 
                  onClick={() => setApiError('')}
                  className="text-xs text-red-600 hover:text-red-700 mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                type="text"
                value={formData.city}
                onChange={(e) => {
                  setFormData({ ...formData, city: e.target.value });
                  setError('');
                }}
                placeholder="e.g., Bangalore, Mumbai, Delhi"
                className={`w-full px-4 py-4 border-2 rounded-xl text-lg focus:outline-none transition-all ${
                  error 
                    ? 'border-red-500 focus:ring-4 focus:ring-red-100' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                }`}
                autoFocus
                disabled={loading}
              />
              {error && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {error}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-500 flex items-start gap-2">
              <span>💡</span>
              <span>We'll show you tournaments near you</span>
            </p>
          </div>
        </div>

        {/* Sticky Bottom Button */}
        <div className="bg-white border-t p-4 sticky bottom-0">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleCompleteOnboarding}
              disabled={!formData.city.trim() || loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 min-h-[60px]"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Getting Started...
                </>
              ) : (
                <>
                  Get Started
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerOnboarding;
