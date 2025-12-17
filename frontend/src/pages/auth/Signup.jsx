import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import InputField from '../../components/shared/InputField';
import RoleSelector from '../../components/shared/RoleSelector';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'player'
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      const userData = await signup(formData.email, formData.password, formData.role);
      
      // Navigate based on role
      if (userData.role === 'player') {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    } catch (error) {
      setApiError(error.message || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-500 rounded-2xl mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500">Join Pathfinder Enhanced today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          {apiError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}

          <RoleSelector
            selectedRole={formData.role}
            onSelect={(role) => setFormData({ ...formData, role })}
          />

          <InputField
            label="Full Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            error={errors.name}
            placeholder="Enter your full name"
          />

          <InputField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            error={errors.email}
            placeholder="you@example.com"
          />

          <InputField
            label="Password"
            value={formData.password}
            onChange={(value) => setFormData({ ...formData, password: value })}
            error={errors.password}
            placeholder="At least 6 characters"
            showPasswordToggle
          />

          <InputField
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
            error={errors.confirmPassword}
            placeholder="Re-enter your password"
            showPasswordToggle
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors text-lg"
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              Already have an account? Login
            </button>
          </div>
        </form>

        {/* Demo Note */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-xs text-yellow-800">
            <strong>Demo Mode:</strong> Use any email except error@test.com to create an account
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
