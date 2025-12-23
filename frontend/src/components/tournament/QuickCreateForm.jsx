import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';

export default function QuickCreateForm({ template, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    tournament_name: '',
    venue_address: '',
    tournament_date: '',
    entry_fee: template.entry_fee || 0,
    prize_money: template.prize_money || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'entry_fee' || name === 'prize_money' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.tournament_name || !formData.venue_address || !formData.tournament_date) {
        throw new Error('Please fill in all required fields');
      }

      // Validate date is in future
      const selectedDate = new Date(formData.tournament_date);
      if (selectedDate < new Date()) {
        throw new Error('Tournament date must be in the future');
      }

      const response = await fetch(`/api/templates/${template.template_id}/quick-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tournament');
      }

      const tournament = await response.json();
      onSuccess(tournament);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Create Tournament</h2>
      <p className="text-gray-600 mb-6">
        Using template: <span className="font-semibold">{template.template_name}</span>
      </p>

      {/* Template Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Format:</span>
            <p className="font-medium text-gray-900 capitalize">{template.format}</p>
          </div>
          <div>
            <span className="text-gray-600">Match Type:</span>
            <p className="font-medium text-gray-900 capitalize">{template.match_type}</p>
          </div>
          <div>
            <span className="text-gray-600">Max Players:</span>
            <p className="font-medium text-gray-900">{template.max_players}</p>
          </div>
          <div>
            <span className="text-gray-600">Default Entry Fee:</span>
            <p className="font-medium text-gray-900">
              {template.entry_fee > 0 ? `₹${template.entry_fee}` : 'Free'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tournament Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tournament Name *
          </label>
          <input
            type="text"
            name="tournament_name"
            value={formData.tournament_name}
            onChange={handleChange}
            placeholder="e.g., City Championship 2025"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Venue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Venue Address *
          </label>
          <input
            type="text"
            name="venue_address"
            value={formData.venue_address}
            onChange={handleChange}
            placeholder="e.g., Sports Complex, Bangalore"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tournament Date *
          </label>
          <input
            type="date"
            name="tournament_date"
            value={formData.tournament_date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Entry Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entry Fee (₹)
          </label>
          <input
            type="number"
            name="entry_fee"
            value={formData.entry_fee}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Template default: ₹{template.entry_fee}</p>
        </div>

        {/* Prize Money */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prize Money (₹)
          </label>
          <input
            type="number"
            name="prize_money"
            value={formData.prize_money}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Template default: ₹{template.prize_money}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Tournament'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
