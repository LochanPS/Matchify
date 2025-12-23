import React, { useState, useEffect } from 'react';
import { Trophy, Share2, TrendingUp, Users, Target } from 'lucide-react';
import SocialShareModal from '../common/SocialShareModal';
import { generateShareContent } from '../../utils/socialSharing';

const CityLeaderboard = ({ city, user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState(false);
  const [timeframe, setTimeframe] = useState('all');
  
  useEffect(() => {
    fetchCityLeaderboard();
  }, [city, timeframe]);
  
  const fetchCityLeaderboard = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/leaderboard/city/${encodeURIComponent(city)}?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.user_rank);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const shareRanking = () => {
    if (!userRank) return;
    
    setShareModal(true);
  };
  
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };
  
  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'text-yellow-600 bg-yellow-50';
      case 2:
        return 'text-gray-600 bg-gray-50';
      case 3:
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              {city} Leaderboard
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Top players in your city
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Timeframe Filter */}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
            
            {/* Share Button */}
            {userRank && (
              <button
                onClick={shareRanking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share My Rank</span>
              </button>
            )}
          </div>
        </div>
        
        {/* User's Rank (if not in top 10) */}
        {userRank && userRank > 10 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  #{userRank}
                </div>
                <div>
                  <p className="font-medium text-blue-900">Your Rank</p>
                  <p className="text-sm text-blue-700">
                    Keep playing to climb higher!
                  </p>
                </div>
              </div>
              <button
                onClick={shareRanking}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2">No Rankings Yet</h4>
              <p className="text-gray-500">Be the first to play tournaments in {city}!</p>
            </div>
          ) : (
            leaderboard.map((player, index) => {
              const rank = index + 1;
              const isCurrentUser = user && player.user_id === user.user_id;
              
              return (
                <div
                  key={player.user_id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    isCurrentUser 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${getRankColor(rank)}`}>
                    {getRankIcon(rank)}
                  </div>
                  
                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {player.name}
                        {isCurrentUser && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            You
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {player.wins} wins
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {player.win_rate}% win rate
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {player.matches_played} matches
                      </span>
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(player.score)}
                    </p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                  
                  {/* Share Button for Current User */}
                  {isCurrentUser && (
                    <button
                      onClick={shareRanking}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Share your ranking"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
        
        {/* Leaderboard Stats */}
        {leaderboard.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{leaderboard.length}</p>
                <p className="text-sm text-gray-600">Active Players</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(leaderboard.reduce((sum, p) => sum + p.matches_played, 0) / leaderboard.length)}
                </p>
                <p className="text-sm text-gray-600">Avg Matches</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(leaderboard.reduce((sum, p) => sum + p.win_rate, 0) / leaderboard.length)}%
                </p>
                <p className="text-sm text-gray-600">Avg Win Rate</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Motivation Message */}
        {userRank && userRank > 5 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💪 Keep it up!</strong> You're ranked #{userRank} in {city}. 
              Play more tournaments to climb the leaderboard!
            </p>
          </div>
        )}
      </div>
      
      {/* Share Modal */}
      {shareModal && userRank && (
        <SocialShareModal
          isOpen={shareModal}
          onClose={() => setShareModal(false)}
          shareData={generateShareContent('leaderboard', {
            rank: userRank,
            city: city,
            user_id: user?.user_id
          })}
          title="Share Your Ranking"
        />
      )}
    </>
  );
};

export default CityLeaderboard;