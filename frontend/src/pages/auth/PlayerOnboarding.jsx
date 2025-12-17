import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import InputField from '../../components/shared/InputField';

const PlayerOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    skillLevel: '',
    city: ''
  });
  const [error, setError] = useState('');

  const skillLevels = [
    { id: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { id: 'intermediate', label: 'Intermediate', description: 'Play regularly' },
    { id: 'advanced', label: 'Advanced', description: 'Competitive player' }
  ];

  const handleSkillSelect = (level) => {
    setFormData({ ...formData, skillLevel: level });
    setError('');
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.skillLevel) {
      setError('Please select your skill level');
      return;
    }
    
    if (step === 2 && !formData.city.trim()) {
      setError('Please enter your city');
      return;
    }

    if (step === 1) {
      setStep(2);
      setError('');
    } else {
      // In production, this would call API to update user profile
      console.log('Profile completed:', formData);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of 2</span>
            <span className="text-sm text-gray-500">{step === 1 ? '50%' : '100%'}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What's your skill level?
                </h2>
                <p className="text-gray-500">
                  This helps us match you with suitable tournaments
                </p>
              </div>

              <div className="space-y-3">
                {skillLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleSkillSelect(level.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.skillLevel === level.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-semibold mb-1 ${
                          formData.skillLevel === level.id ? 'text-blue-700' : 'text-gray-700'
                        }`}>
                          {level.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {level.description}
                        </div>
                      </div>
                      {formData.skillLevel === level.id && (
                        <Check className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Where are you based?
                </h2>
                <p className="text-gray-500">
                  We'll show you tournaments in your city
                </p>
              </div>

              <InputField
                label="City"
                value={formData.city}
                onChange={(value) => setFormData({ ...formData, city: value })}
                error={error}
                placeholder="e.g., Bangalore, Mumbai, Delhi"
              />
            </div>
          )}

          <button
            onClick={handleNextStep}
            className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors text-lg mt-6"
          >
            {step === 1 ? 'Continue' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerOnboarding;
