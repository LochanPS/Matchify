import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * Add category form component
 * Form for adding a new category to a tournament
 */
const AddCategoryForm = ({ onAdd, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    category_name: '',
    match_type: 'singles',
    entry_fee: 0,
    prize_money_winner: 0,
    prize_money_runner_up: 0,
    max_participants: 16,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_name.trim()) {
      newErrors.category_name = 'Category name is required';
    }

    if (formData.max_participants < 2) {
      newErrors.max_participants = 'Max participants must be at least 2';
    }

    if (formData.entry_fee < 0) {
      newErrors.entry_fee = 'Entry fee cannot be negative';
    }

    if (formData.prize_money_winner < 0) {
      newErrors.prize_money_winner = 'Prize money cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Add Category</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Category Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Name *
        </label>
        <input
          type="text"
          placeholder="e.g., Men's Singles"
          value={formData.category_name}
          onChange={(e) => handleChange('category_name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.category_name && (
          <p className="text-sm text-red-600 mt-1">{errors.category_name}</p>
        )}
      </div>

      {/* Match Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Match Type *
        </label>
        <select
          value={formData.match_type}
          onChange={(e) => handleChange('match_type', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="singles">Singles</option>
          <option value="doubles">Doubles</option>
          <option value="mixed_doubles">Mixed Doubles</option>
        </select>
      </div>

      {/* Entry Fee */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Entry Fee (₹)
        </label>
        <input
          type="number"
          min="0"
          value={formData.entry_fee}
          onChange={(e) => handleChange('entry_fee', parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.entry_fee && (
          <p className="text-sm text-red-600 mt-1">{errors.entry_fee}</p>
        )}
      </div>

      {/* Prize Money */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Winner Prize (₹)
          </label>
          <input
            type="number"
            min="0"
            value={formData.prize_money_winner}
            onChange={(e) => handleChange('prize_money_winner', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.prize_money_winner && (
            <p className="text-sm text-red-600 mt-1">{errors.prize_money_winner}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Runner-up Prize (₹)
          </label>
          <input
            type="number"
            min="0"
            value={formData.prize_money_runner_up}
            onChange={(e) => handleChange('prize_money_runner_up', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Max Participants */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Participants *
        </label>
        <select
          value={formData.max_participants}
          onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
          <option value={64}>64</option>
        </select>
        {errors.max_participants && (
          <p className="text-sm text-red-600 mt-1">{errors.max_participants}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Adding...' : 'Add Category'}
        </button>
      </div>
    </div>
  );
};

export default AddCategoryForm;
