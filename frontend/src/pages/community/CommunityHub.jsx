import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Users, Calendar, Trophy, GraduationCap } from 'lucide-react';
import ForumCategories from '../../components/community/ForumCategories';
import GroupDiscovery from '../../components/community/GroupDiscovery';
import EventCalendar from '../../components/community/EventCalendar';
import CommunityChallenge from '../../components/community/CommunityChallenge';
import MentorshipProgram from '../../components/community/MentorshipProgram';
import CommunityStats from '../../components/community/CommunityStats';
import { useAuth } from '../../contexts/AuthContext';

const CommunityHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('forums');
  const [loading, setLoading] = useState(false);
  
  const tabs = [
    { id: 'forums', label: 'Forums', icon: MessageCircle, color: 'blue' },
    { id: 'groups', label: 'Groups', icon: Users, color: 'green' },
    { id: 'events', label: 'Events', icon: Calendar, color: 'purple' },
    { id: 'challenges', label: 'Challenges', icon: Trophy, color: 'orange' },
    { id: 'mentorship', label: 'Mentorship', icon: GraduationCap, color: 'indigo' }
  ];
  
  const getTabColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      green: isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
      purple: isActive ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      orange: isActive ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
      indigo: isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
    };
    return colors[color] || colors.blue;
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'forums':
        return <ForumCategories />;
      case 'groups':
        return <GroupDiscovery user={user} />;
      case 'events':
        return <EventCalendar city={user?.city} />;
      case 'challenges':
        return <CommunityChallenge />;
      case 'mentorship':
        return <MentorshipProgram />;
      default:
        return <ForumCategories />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community</h1>
              <p className="text-sm text-gray-600">Connect, learn, and grow together</p>
            </div>
          </div>
          
          {/* Community Stats */}
          <CommunityStats />
          
          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    getTabColorClasses(tab.color, isActive)
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default CommunityHub;