import React, { useState, useEffect } from 'react';
import { Users, MapPin, Plus, Check } from 'lucide-react';
import { communityAPI } from '../../services/api';

const GroupDiscovery = ({ user }) => {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState({});
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchGroups();
  }, []);
  
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const [allGroups, myGroupsData] = await Promise.all([
        communityAPI.discoverGroups(user?.city),
        communityAPI.getMyGroups()
      ]);
      
      if (allGroups.success) {
        setGroups(allGroups.groups || []);
      }
      
      if (myGroupsData.success) {
        setMyGroups(myGroupsData.groups || []);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setError('Failed to load groups');
      
      // Set mock data for demonstration
      const mockGroups = [
        {
          group_id: '1',
          name: 'Mumbai Badminton Community',
          description: 'Connect with badminton players in Mumbai. Share tournaments, find playing partners, and build the local community!',
          group_type: 'city',
          group_key: 'mumbai',
          member_count: 156,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          group_id: '2',
          name: 'Advanced Players Club',
          description: 'For experienced players looking to improve their competitive game and share advanced techniques.',
          group_type: 'interest',
          group_key: 'advanced',
          member_count: 89,
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          group_id: '3',
          name: 'Weekend Warriors',
          description: 'Casual players who love weekend tournaments and friendly matches.',
          group_type: 'interest',
          group_key: 'weekend',
          member_count: 234,
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      const mockMyGroups = [
        {
          group_id: '1',
          name: 'Mumbai Badminton Community',
          description: 'Connect with badminton players in Mumbai. Share tournaments, find playing partners, and build the local community!',
          group_type: 'city',
          group_key: 'mumbai',
          member_count: 156,
          role: 'member',
          joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setGroups(mockGroups);
      setMyGroups(mockMyGroups);
    } finally {
      setLoading(false);
    }
  };
  
  const joinGroup = async (groupId) => {
    try {
      setJoinLoading(prev => ({ ...prev, [groupId]: true }));
      
      const data = await communityAPI.joinGroup(groupId);
      
      if (data.success) {
        fetchGroups(); // Refresh groups
      } else {
        alert(data.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('Failed to join group:', error);
      alert('Failed to join group');
    } finally {
      setJoinLoading(prev => ({ ...prev, [groupId]: false }));
    }
  };
  
  const GroupCard = ({ group, isMember, onJoin }) => {
    const getGroupIcon = (type) => {
      switch (type) {
        case 'city':
          return '🏙️';
        case 'interest':
          return '🏸';
        case 'skill':
          return '⭐';
        default:
          return '👥';
      }
    };
    
    const getGroupTypeLabel = (type) => {
      switch (type) {
        case 'city':
          return 'City Group';
        case 'interest':
          return 'Interest Group';
        case 'skill':
          return 'Skill Group';
        default:
          return 'Community Group';
      }
    };
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
            {getGroupIcon(group.group_type)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{group.name}</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                {getGroupTypeLabel(group.group_type)}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{group.description}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{group.member_count} members</span>
              {group.group_type === 'city' && (
                <>
                  <span>•</span>
                  <MapPin className="w-3 h-3" />
                  <span>{group.group_key}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Created {new Date(group.created_at).toLocaleDateString()}
          </span>
          {isMember ? (
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <Check className="w-4 h-4" />
              Joined
            </div>
          ) : (
            <button
              onClick={onJoin}
              disabled={joinLoading[group.group_id]}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {joinLoading[group.group_id] ? 'Joining...' : 'Join'}
            </button>
          )}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Unable to Load Groups</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchGroups}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  const availableGroups = groups.filter(g => !myGroups.find(mg => mg.group_id === g.group_id));
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Groups</h2>
          <p className="text-gray-600 mt-1">
            Join groups to connect with players in your area and with similar interests
          </p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>
      
      {/* My Groups */}
      {myGroups.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            My Groups ({myGroups.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGroups.map(group => (
              <GroupCard 
                key={group.group_id} 
                group={group} 
                isMember={true} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Discover Groups */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Discover Groups ({availableGroups.length})
        </h3>
        
        {availableGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableGroups.map(group => (
              <GroupCard 
                key={group.group_id} 
                group={group} 
                isMember={false}
                onJoin={() => joinGroup(group.group_id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No New Groups</h4>
            <p className="text-gray-500">
              {myGroups.length > 0 
                ? "You've joined all available groups in your area!"
                : "No groups available yet. Be the first to create one!"
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Group Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">🌟 Why Join Groups?</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-blue-600">🤝</span>
            <div>
              <p className="font-medium text-gray-900">Connect Locally</p>
              <p className="text-gray-600">Meet players in your city and organize local meetups</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600">📅</span>
            <div>
              <p className="font-medium text-gray-900">Group Events</p>
              <p className="text-gray-600">Participate in group-specific tournaments and activities</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-600">💬</span>
            <div>
              <p className="font-medium text-gray-900">Share & Learn</p>
              <p className="text-gray-600">Exchange tips, techniques, and experiences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDiscovery;