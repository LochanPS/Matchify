import React, { useState, useEffect } from 'react';
import { Trophy, Target, Calendar, Award, Users, TrendingUp } from 'lucide-react';

const CommunityChallenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/community/challenges', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setChallenges(data.challenges || []);
        setUserProgress(data.user_progress || {});
      }
      
      // Mock data for demonstration
      const mockChallenges = [
        {
          id: 'december_2024',
          title: 'December Tournament Challenge',
          description: 'Play in 3 tournaments this month and earn a special badge!',
          target: 3,
          current: userProgress.tournaments_this_month || 0,
          reward: 'Tournament Champion Badge',
          ends_at: '2024-12-31',
          type: 'monthly',
          icon: '🏆'
        },
        {
          id: 'week_50_2024',
          title: 'Community Helper',
          description: 'Help 5 new players by answering forum questions',
          target: 5,
          current: userProgress.forum_helps_this_week || 0,
          reward: '50 Community Points',
          ends_at: '2024-12-22',
          type: 'weekly',
          icon: '🤝'
        },
        {
          id: 'social_butterfly',
          title: 'Social Butterfly',
          description: 'Join 3 community groups and make new connections',
          target: 3,
          current: userProgress.groups_joined || 1,
          reward: 'Social Badge + 25 Points',
          ends_at: '2024-12-31',
          type: 'monthly',
          icon: '🦋'
        }
      ];
      
      setChallenges(mockChallenges);
      
      // Mock leaderboard
      setLeaderboard([
        { name: 'Rahul Kumar', points: 450, badge: '🏆', rank: 1 },
        { name: 'Priya Sharma', points: 380, badge: '🥈', rank: 2 },
        { name: 'Amit Patel', points: 320, badge: '🥉', rank: 3 },
        { name: 'Sneha Reddy', points: 280, badge: '🎯', rank: 4 },
        { name: 'Vikram Singh', points: 250, badge: '⭐', rank: 5 }
      ]);
      
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-orange-500" />
            Community Challenges
          </h2>
          <p className="text-gray-600 mt-1">Complete challenges to earn rewards and climb the leaderboard</p>
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Active Challenges
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Challenge Leaderboard
        </h3>
        <div className="space-y-3">
          {leaderboard.map((player, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {player.rank}
                </div>
                <span className="text-2xl">{player.badge}</span>
                <div>
                  <span className="font-medium text-gray-900">{player.name}</span>
                  <p className="text-sm text-gray-500">Rank #{player.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">{player.points}</span>
                <p className="text-sm text-gray-500">points</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            <Users className="w-4 h-4 inline mr-1" />
            Complete more challenges to climb the leaderboard!
          </p>
        </div>
      </div>

      {/* Challenge Types Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">How Challenges Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Weekly Challenges</h4>
            <p className="text-sm text-gray-600">Reset every Monday with new goals</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900">Monthly Challenges</h4>
            <p className="text-sm text-gray-600">Bigger goals with better rewards</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-medium text-gray-900">Special Events</h4>
            <p className="text-sm text-gray-600">Limited-time exclusive challenges</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChallengeCard = ({ challenge }) => {
  const progress = Math.min((challenge.current / challenge.target) * 100, 100);
  const isCompleted = challenge.current >= challenge.target;
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'weekly': return 'bg-blue-100 text-blue-700';
      case 'monthly': return 'bg-purple-100 text-purple-700';
      case 'special': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (progress > 66) return 'bg-blue-500';
    if (progress > 33) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{challenge.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(challenge.type)}`}>
              {challenge.type}
            </span>
          </div>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1 text-green-600">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Complete!</span>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{challenge.description}</p>
      
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{challenge.current}/{challenge.target}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Reward and Deadline */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Award className="w-4 h-4" />
          <span>{challenge.reward}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Ends {new Date(challenge.ends_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CommunityChallenge;