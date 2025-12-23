import React from 'react';
import { Users, Trophy, DollarSign } from 'lucide-react';

/**
 * Category card component
 * Displays a single tournament category with registration info
 */
const CategoryCard = ({ category, onRegister, isRegistered, isLoading }) => {
  const isFull = category.current_participants >= category.max_participants;
  const fillPercentage = (category.current_participants / category.max_participants) * 100;

  const getMatchTypeLabel = (matchType) => {
    switch (matchType) {
      case 'singles':
        return 'Singles';
      case 'doubles':
        return 'Doubles';
      case 'mixed_doubles':
        return 'Mixed Doubles';
      default:
        return matchType;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{category.category_name}</h3>
          <p className="text-sm text-gray-600 mt-1">{getMatchTypeLabel(category.match_type)}</p>
        </div>
        {isFull && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            FULL
          </span>
        )}
      </div>

      {/* Fees & Prizes */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">
            Entry: <span className="font-semibold">₹{category.entry_fee}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-gray-700">
            Prize: <span className="font-semibold">₹{category.prize_money_winner}</span>
          </span>
        </div>
      </div>

      {/* Participants Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1 text-sm">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">
              {category.current_participants}/{category.max_participants} registered
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isFull ? 'bg-red-500' : fillPercentage >= 75 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(fillPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Register Button */}
      <button
        onClick={() => onRegister(category)}
        disabled={isRegistered || isFull || isLoading}
        className={`w-full px-4 py-2.5 rounded-lg font-medium transition-colors ${
          isRegistered
            ? 'bg-green-100 text-green-700 cursor-default'
            : isFull
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
        } disabled:opacity-50`}
      >
        {isLoading ? 'Registering...' : isRegistered ? '✓ Registered' : 'Register'}
      </button>
    </div>
  );
};

export default CategoryCard;
