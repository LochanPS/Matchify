import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Clock, Plus } from 'lucide-react';
import { communityAPI } from '../../services/api';

const ForumCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await communityAPI.getForumCategories();
      
      if (data.success) {
        setCategories(data.categories || []);
      } else {
        setError('Failed to load categories');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load forum categories');
      
      // Set mock data for demonstration
      setCategories([
        {
          category_id: '1',
          name: 'General Discussion',
          description: 'General badminton discussions, tips, and community chat',
          icon: '💬',
          color: '#3B82F6',
          topic_count: 45,
          latest_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          category_id: '2',
          name: 'Tournament Talk',
          description: 'Discuss tournaments, results, and competitive play',
          icon: '🏆',
          color: '#F59E0B',
          topic_count: 23,
          latest_activity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          category_id: '3',
          name: 'Equipment & Gear',
          description: 'Rackets, shoes, strings, and other badminton equipment',
          icon: '🏸',
          color: '#10B981',
          topic_count: 18,
          latest_activity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          category_id: '4',
          name: 'Training & Technique',
          description: 'Improve your game with training tips and technique discussions',
          icon: '💪',
          color: '#8B5CF6',
          topic_count: 31,
          latest_activity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'No activity';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };
  
  const handleCategoryClick = (categoryId) => {
    navigate(`/community/forums/categories/${categoryId}`);
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Unable to Load Forums</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchCategories}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Forums</h2>
          <p className="text-gray-600 mt-1">
            Connect with fellow badminton enthusiasts, share experiences, and get help
          </p>
        </div>
        <button
          onClick={() => navigate('/community/forums/create-topic')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Topic
        </button>
      </div>
      
      {/* Categories List */}
      <div className="space-y-3">
        {categories.map(category => (
          <div
            key={category.category_id}
            onClick={() => handleCategoryClick(category.category_id)}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* Category Icon */}
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: category.color }}
              >
                {category.icon}
              </div>
              
              {/* Category Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {category.topic_count || 0} topics
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatRelativeTime(category.latest_activity)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Forum Categories</h3>
          <p className="text-gray-500">Forum categories will appear here once they're created.</p>
        </div>
      )}
      
      {/* Forum Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Forum Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be respectful and courteous to all community members</li>
          <li>• Keep discussions relevant to badminton and the community</li>
          <li>• Search before posting to avoid duplicate topics</li>
          <li>• Help newcomers and share your knowledge generously</li>
          <li>• Report inappropriate content to moderators</li>
        </ul>
      </div>
    </div>
  );
};

export default ForumCategories;