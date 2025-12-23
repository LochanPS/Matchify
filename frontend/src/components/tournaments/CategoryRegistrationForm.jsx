import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const CategoryRegistrationForm = ({ tournament, category, onSuccess, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    partner_id: '',
    partner_name: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPartnerSearch, setShowPartnerSearch] = useState(false);
  const [partnerSearchResults, setPartnerSearchResults] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (category.match_type === 'doubles' || category.match_type === 'mixed_doubles') {
      if (!formData.partner_id) {
        newErrors.partner_id = 'Partner selection is required for doubles';
      }
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

    setLoading(true);
    try {
      await onSuccess(formData);
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ submit: err.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const isDoubles = category.match_type === 'doubles' || category.match_type === 'mixed_doubles';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Register for Category</h2>
          <p className="text-sm text-gray-600 mt-1">{category.category_name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Category Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600">Entry Fee</p>
            <p className="font-semibold text-gray-900">₹{category.entry_fee}</p>
          </div>
          <div>
            <p className="text-gray-600">Match Type</p>
            <p className="font-semibold text-gray-900 capitalize">
              {category.match_type === 'singles'
                ? 'Singles'
                : category.match_type === 'doubles'
                  ? 'Doubles'
                  : 'Mixed Doubles'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="10-digit phone number"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Partner Selection (for doubles) */}
        {isDoubles && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Select Partner
            </label>
            {formData.partner_id ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{formData.partner_name}</p>
                  <p className="text-xs text-gray-600">Partner selected</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      partner_id: '',
                      partner_name: '',
                    }));
                  }}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPartnerSearch(!showPartnerSearch)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 text-left"
              >
                Search for partner...
              </button>
            )}
            {errors.partner_id && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.partner_id}
              </p>
            )}

            {/* Partner Search Results */}
            {showPartnerSearch && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">
                  Partner search feature coming soon. For now, enter partner details manually.
                </p>
                <input
                  type="text"
                  placeholder="Partner name"
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      partner_name: e.target.value,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.partner_name) {
                      setFormData((prev) => ({
                        ...prev,
                        partner_id: `partner_${Date.now()}`,
                      }));
                      setShowPartnerSearch(false);
                    }
                  }}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Confirm Partner
                </button>
              </div>
            )}
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900">{errors.submit}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="p-0" />
                Processing...
              </>
            ) : (
              'Continue to Payment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryRegistrationForm;
