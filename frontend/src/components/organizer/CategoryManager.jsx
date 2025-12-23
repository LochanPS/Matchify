import { useState, useEffect } from 'react';
import { Edit2, Trash2, Users, Plus, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { categoryAPI, matchAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const CategoryManager = ({ tournamentId, onUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_name: '',
    match_type: 'singles',
    entry_fee: 0,
    prize_money_winner: 0,
    prize_money_runner_up: 0,
    max_participants: 16,
  });

  useEffect(() => {
    fetchCategories();
  }, [tournamentId]);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await categoryAPI.getByTournament(tournamentId);
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!formData.category_name.trim()) {
      setError('Category name is required');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await categoryAPI.create(tournamentId, formData);
      setFormData({
        category_name: '',
        match_type: 'singles',
        entry_fee: 0,
        prize_money_winner: 0,
        prize_money_runner_up: 0,
        max_participants: 16,
      });
      setShowAddForm(false);
      await fetchCategories();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to add category:', err);
      setError(err.message || 'Failed to add category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory.category_name.trim()) {
      setError('Category name is required');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await categoryAPI.update(editingCategory.category_id, editingCategory);
      setEditingCategory(null);
      await fetchCategories();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update category:', err);
      setError(err.message || 'Failed to update category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await categoryAPI.delete(categoryId);
      await fetchCategories();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError(err.message || 'Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateMatches = async (categoryId) => {
    setActionLoading(true);
    setError('');
    try {
      await matchAPI.generateMatches(categoryId);
      await fetchCategories();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to generate matches:', err);
      setError(err.message || 'Failed to generate matches');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" text="Loading categories..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      {/* Add Category Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Category
      </button>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">New Category</h3>

          <input
            type="text"
            placeholder="Category Name (e.g., Men's Singles)"
            value={formData.category_name}
            onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={formData.match_type}
            onChange={(e) => setFormData({ ...formData, match_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="singles">Singles</option>
            <option value="doubles">Doubles</option>
            <option value="mixed_doubles">Mixed Doubles</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Entry Fee"
              value={formData.entry_fee}
              onChange={(e) => setFormData({ ...formData, entry_fee: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Winner Prize"
              value={formData.prize_money_winner}
              onChange={(e) => setFormData({ ...formData, prize_money_winner: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Runner-up Prize"
              value={formData.prize_money_runner_up}
              onChange={(e) => setFormData({ ...formData, prize_money_runner_up: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formData.max_participants}
              onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={4}>4 Players</option>
              <option value={8}>8 Players</option>
              <option value={16}>16 Players</option>
              <option value={32}>32 Players</option>
              <option value={64}>64 Players</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCategory}
              disabled={actionLoading}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="py-8 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-600">No categories yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.category_id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() =>
                  setExpandedCategory(expandedCategory === category.category_id ? null : category.category_id)
                }
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-gray-900">{category.category_name}</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    {category.match_type === 'singles' ? 'Singles' : category.match_type === 'doubles' ? 'Doubles' : 'Mixed Doubles'} •
                    {category.current_participants}/{category.max_participants} registered
                  </p>
                </div>
                {expandedCategory === category.category_id ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Category Details */}
              {expandedCategory === category.category_id && (
                <div className="border-t border-gray-200 px-4 py-3 space-y-3 bg-gray-50">
                  {editingCategory?.category_id === category.category_id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingCategory.category_name}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, category_name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          value={editingCategory.entry_fee}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, entry_fee: parseFloat(e.target.value) || 0 })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          value={editingCategory.prize_money_winner}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              prize_money_winner: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateCategory}
                          disabled={actionLoading}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Entry Fee</p>
                          <p className="font-semibold text-gray-900">₹{category.entry_fee}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Winner Prize</p>
                          <p className="font-semibold text-gray-900">₹{category.prize_money_winner}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Runner-up Prize</p>
                          <p className="font-semibold text-gray-900">₹{category.prize_money_runner_up}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status</p>
                          <p className="font-semibold text-gray-900 capitalize">{category.status || 'open'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleGenerateMatches(category.category_id)}
                          disabled={actionLoading}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Generating...' : 'Generate Matches'}
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.category_id)}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
