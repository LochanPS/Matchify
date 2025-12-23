import { useState } from 'react';
import { X, ArrowLeft, ArrowRight, Users, User, Trophy, DollarSign, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

const CategoryCreationWizard = ({ isOpen, onClose, onSave, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    category_name: '',
    match_type: 'singles',
    entry_fee: '',
    prize_money_winner: '',
    prize_money_runner_up: '',
    max_participants: 16,
    format: 'knockout',
    points_per_game: 21,
    best_of: 1,
  });
  const [errors, setErrors] = useState({});

  const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Pricing', icon: DollarSign },
    { id: 3, title: 'Format', icon: Settings },
    { id: 4, title: 'Review', icon: CheckCircle2 },
  ];

  const matchTypeOptions = [
    {
      value: 'singles',
      label: 'Singles',
      icon: User,
      description: 'Individual players compete',
      recommendedParticipants: [8, 16, 32],
    },
    {
      value: 'doubles',
      label: 'Doubles',
      icon: Users,
      description: 'Teams of 2 players compete',
      recommendedParticipants: [4, 8, 16],
    },
  ];

  const formatOptions = [
    {
      value: 'knockout',
      label: 'Knockout',
      description: 'Single elimination tournament',
      icon: Trophy,
    },
    {
      value: 'league',
      label: 'League',
      description: 'Round-robin format',
      icon: Users,
    },
  ];

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.category_name.trim()) {
        newErrors.category_name = 'Category name is required';
      } else if (formData.category_name.length < 3) {
        newErrors.category_name = 'Category name must be at least 3 characters';
      }
    }

    if (step === 2) {
      if (!formData.entry_fee || formData.entry_fee < 0) {
        newErrors.entry_fee = 'Entry fee must be a positive number';
      }
      if (!formData.prize_money_winner || formData.prize_money_winner < 0) {
        newErrors.prize_money_winner = 'Winner prize must be a positive number';
      }
      if (formData.prize_money_runner_up < 0) {
        newErrors.prize_money_runner_up = 'Runner-up prize must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-calculate runner-up prize as 50% of winner prize
    if (field === 'prize_money_winner' && value) {
      setFormData((prev) => ({
        ...prev,
        prize_money_runner_up: Math.floor(value * 0.5),
      }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      try {
        await onSave(formData);
        onClose();
        // Reset form
        setCurrentStep(1);
        setFormData({
          category_name: '',
          match_type: 'singles',
          entry_fee: '',
          prize_money_winner: '',
          prize_money_runner_up: '',
          max_participants: 16,
          format: 'knockout',
          points_per_game: 21,
          best_of: 1,
        });
        setErrors({});
      } catch (err) {
        setErrors({ submit: err.message || 'Failed to create category' });
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={formData.category_name}
                onChange={(e) => handleInputChange('category_name', e.target.value)}
                placeholder="e.g., Men's Singles, Women's Doubles"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.category_name && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Match Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {matchTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('match_type', option.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.match_type === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-6 h-6 ${
                          formData.match_type === option.value ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Maximum Participants
              </label>
              <select
                value={formData.max_participants}
                onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {matchTypeOptions
                  .find((opt) => opt.value === formData.match_type)
                  ?.recommendedParticipants.map((count) => (
                    <option key={count} value={count}>
                      {count} {formData.match_type === 'singles' ? 'players' : 'teams'}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Entry Fee (₹)
              </label>
              <input
                type="number"
                value={formData.entry_fee}
                onChange={(e) => handleInputChange('entry_fee', parseFloat(e.target.value) || 0)}
                placeholder="300"
                min="0"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.entry_fee ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.entry_fee && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.entry_fee}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Winner Prize (₹)
              </label>
              <input
                type="number"
                value={formData.prize_money_winner}
                onChange={(e) => handleInputChange('prize_money_winner', parseFloat(e.target.value) || 0)}
                placeholder="3000"
                min="0"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.prize_money_winner ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.prize_money_winner && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.prize_money_winner}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Runner-up Prize (₹)
              </label>
              <input
                type="number"
                value={formData.prize_money_runner_up}
                onChange={(e) => handleInputChange('prize_money_runner_up', parseFloat(e.target.value) || 0)}
                placeholder="1500"
                min="0"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.prize_money_runner_up ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Auto-calculated as 50% of winner prize
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Prize Pool Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Entry Fees:</span>
                  <span className="font-medium text-blue-900">
                    ₹{(formData.entry_fee * formData.max_participants).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Prizes:</span>
                  <span className="font-medium text-blue-900">
                    ₹{(formData.prize_money_winner + formData.prize_money_runner_up).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-1">
                  <span className="text-blue-700">Organizer Revenue:</span>
                  <span className="font-medium text-blue-900">
                    ₹{((formData.entry_fee * formData.max_participants) - (formData.prize_money_winner + formData.prize_money_runner_up)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Tournament Format
              </label>
              <div className="grid grid-cols-1 gap-3">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('format', option.value)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.format === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-6 h-6 ${
                          formData.format === option.value ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Points per Game
                </label>
                <select
                  value={formData.points_per_game}
                  onChange={(e) => handleInputChange('points_per_game', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={11}>11 points</option>
                  <option value={15}>15 points</option>
                  <option value={21}>21 points</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Best of
                </label>
                <select
                  value={formData.best_of}
                  onChange={(e) => handleInputChange('best_of', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Best of 1</option>
                  <option value={3}>Best of 3</option>
                  <option value={5}>Best of 5</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Category Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{formData.category_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{formData.match_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-medium text-gray-900">{formData.max_participants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entry Fee:</span>
                  <span className="font-medium text-gray-900">₹{formData.entry_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Winner Prize:</span>
                  <span className="font-medium text-gray-900">₹{formData.prize_money_winner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Runner-up Prize:</span>
                  <span className="font-medium text-gray-900">₹{formData.prize_money_runner_up}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium text-gray-900 capitalize">{formData.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scoring:</span>
                  <span className="font-medium text-gray-900">
                    {formData.points_per_game} points, Best of {formData.best_of}
                  </span>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900">{errors.submit}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Category</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="p-0" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Category
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCreationWizard;