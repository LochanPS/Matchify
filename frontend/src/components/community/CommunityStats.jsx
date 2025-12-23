import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Calendar, Trophy } from 'lucide-react';
import { communityAPI } from '../../services/api';

const CommunityStats = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCommunityStats();
  }, []);
  
  const fetchCommunityStats = async () => {
    try {
      const data = await communityAPI.getCommunityStats();
      
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch community stats:', error);
      // Set mock data for demonstration
      setStats({
        total_members: 1247,
        forum_posts: 3892,
        events_this_month: 23,
        active_challenges: 5
      });
    } finally {
      setLoading(false);
    }
  };
  
  const StatCard = ({ icon: Icon, label, value, color }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-100',
      green: 'bg-green-50 text-green-600 border-green-100',
      purple: 'bg-purple-50 text-purple-600 border-purple-100',
      orange: 'bg-orange-50 text-orange-600 border-orange-100'
    };
    
    if (loading) {
      return (
        <div className="bg-white rounded-lg border border-gray-100 p-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg border border-gray-100 p-3 hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value || 0}
            </p>
            <p className="text-xs text-gray-600">{label}</p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <StatCard
        icon={Users}
        label="Community Members"
        value={stats.total_members}
        color="blue"
      />
      <StatCard
        icon={MessageCircle}
        label="Forum Posts"
        value={stats.forum_posts}
        color="green"
      />
      <StatCard
        icon={Calendar}
        label="Events This Month"
        value={stats.events_this_month}
        color="purple"
      />
      <StatCard
        icon={Trophy}
        label="Active Challenges"
        value={stats.active_challenges}
        color="orange"
      />
    </div>
  );
};

export default CommunityStats;