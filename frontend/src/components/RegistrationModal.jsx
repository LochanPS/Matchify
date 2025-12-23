import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader } from 'lucide-react';

/**
 * RegistrationModal - Player registration form with payment
 * Handles form validation, payment initiation, and confirmation
 */
const RegistrationModal = ({ tournament, categories, user, onClose, onSuccess }) => {
  const [step, setStep] = useState('form');  // form, payment, success
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    category_id: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);

  const selectedCategory = categories.find(c => c.category_id === formData.category_id);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.category_id) newErrors.category_id = 'Select a category';

    // Phone validation (Indian format)
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits, starting with 6-9)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Call backend to initiate payment
      const response = await fetch('/api/registrations/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tournament_id: tournament.tournament_id,
          category_id: formData.category_id,
          player_name: formData.name,
          player_email: formData.email,
          player_phone: formData.phone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.error });
        return;
      }

      setRegistrationId(data.registration_id);

      // Open Razorpay checkout
      const options = {
        key: data.razorpay_key,
        amount: data.amount * 100,
        currency: 'INR',
        name: 'COURTIFY',
        description: `Registration for ${tournament.tournament_name}`,
        order_id: data.razorpay_order_id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#667eea'
        },
        handler: function(response) {
          verifyPayment(data.registration_id, response);
        },
        modal: {
          ondismiss: function() {
            setStep('form');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setErrors({ submit: 'Failed to initiate payment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (regId, razorpayResponse) => {
    setLoading(true);
    try {
      const response = await fetch('/api/registrations/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          registration_id: regId,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_signature: razorpayResponse.razorpay_signature
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
        if (onSuccess) onSuccess(data.registration);
      } else {
        setErrors({ submit: data.error || 'Payment verification failed' });
        setStep('form');
      }
    } catch (error) {
      setErrors({ submit: 'Error verifying payment. Please contact support.' });
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Register for Tournament</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tournament Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>{tournament.tournament_name}</strong>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  📅 {new Date(tournament.tournament_date).toLocaleDateString()}
                </p>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your full name"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.category_id
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={loading}
                >
                  <option value="">Choose a category</option>
                  {categories.map((cat) => (
                    <option
                      key={cat.category_id}
                      value={cat.category_id}
                      disabled={cat.current_players >= cat.max_players}
                    >
                      {cat.category_name} - ₹{cat.entry_fee}
                      {cat.current_players >= cat.max_players && ' (Full)'}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.category_id}
                  </p>
                )}
              </div>

              {/* Entry Fee Display */}
              {selectedCategory && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="text-lg font-bold text-gray-900">{selectedCategory.category_name}</p>
                  <p className="text-sm text-gray-600 mt-2">Entry Fee</p>
                  <p className="text-2xl font-bold text-blue-600">₹{selectedCategory.entry_fee}</p>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!formData.category_id || loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-6">
                Your registration has been confirmed. Check your email for details.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-gray-600">Tournament</p>
                <p className="font-semibold text-gray-900">{tournament.tournament_name}</p>
                <p className="text-sm text-gray-600 mt-3">Category</p>
                <p className="font-semibold text-gray-900">{selectedCategory?.category_name}</p>
                <p className="text-sm text-gray-600 mt-3">Amount Paid</p>
                <p className="text-lg font-bold text-blue-600">₹{selectedCategory?.entry_fee}</p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
