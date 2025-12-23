import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Share2, Gift, Target, BarChart3 } from 'lucide-react';

const MetricCard = ({ title, value, change, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50'
  };
  
  const changeColor = change >= 0 ? 'text-green-600' : 'text-red-600';
  const changeIcon = change >= 0 ? '↗' : '↘';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`text-sm font-medium ${changeColor}`}>
            {changeIcon} {Math.abs(change)}%
          </span>
        )}
      </div>
      
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

const ReferralFunnelChart = ({ data }) => {
  if (!data) return null;
  
  const stages = [
    { name: 'Codes Generated', value: data.codes_generated, color: 'bg-blue-500' },
    { name: 'Codes Shared', value: data.codes_shared, color: 'bg-green-500' },
    { name: 'Signups Started', value: data.signups_started, color: 'bg-yellow-500' },
    { name: 'Signups Completed', value: data.signups_completed, color: 'bg-orange-500' },
    { name: 'First Tournament', value: data.first_tournament, color: 'bg-red-500' }
  ];
  
  const maxValue = Math.max(...stages.map(s => s.value));
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Referral Funnel</h3>
      
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          const conversionRate = index > 0 ? ((stage.value / stages[index - 1].value) * 100).toFixed(1) : 100;
          
          return (
            <div key={stage.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{stage.value}</span>
                  {index > 0 && (
                    <span className="text-xs text-gray-500">({conversionRate}%)</span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${stage.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SharingBreakdownChart = ({ data }) => {
  if (!data) return null;
  
  const platforms = Object.entries(data).map(([platform, count]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    count,
    percentage: (count / Object.values(data).reduce((a, b) => a + b, 0)) * 100
  }));
  
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Sharing Breakdown</h3>
      
      <div className="space-y-3">
        {platforms.map((platform, index) => (
          <div key={platform.platform} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
              <span className="text-sm font-medium text-gray-700">{platform.platform}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{platform.count}</span>
              <span className="text-xs text-gray-500">({platform.percentage.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GrowthDashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchGrowthMetrics();
  }, [timeframe]);
  
  const fetchGrowthMetrics = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/analytics/growth?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        throw new Error('Failed to fetch growth metrics');
      }
    } catch (error) {
      console.error('Error fetching growth metrics:', error);
      setError('Failed to load growth metrics');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Growth Analytics</h1>
          <p className="text-gray-600 mt-1">Track user acquisition and viral growth</p>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="New Users"
          value={metrics.new_users || 0}
          change={metrics.new_users_change}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Referral Rate"
          value={`${metrics.referral_rate || 0}%`}
          change={metrics.referral_rate_change}
          icon={<Gift className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Viral Coefficient"
          value={metrics.viral_coefficient || 0}
          change={metrics.viral_coefficient_change}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Share Rate"
          value={`${metrics.share_rate || 0}%`}
          change={metrics.share_rate_change}
          icon={<Share2 className="w-6 h-6" />}
          color="orange"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReferralFunnelChart data={metrics.referral_funnel} />
        <SharingBreakdownChart data={metrics.sharing_breakdown} />
      </div>
      
      {/* Growth Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Growth Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Performing Content */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Top Shared Content</h4>
            <div className="space-y-2">
              {metrics.top_shared_content?.map((content, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{content.title}</p>
                    <p className="text-xs text-gray-600">{content.type}</p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{content.shares}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No sharing data available</p>
              )}
            </div>
          </div>
          
          {/* Growth Opportunities */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Growth Opportunities</h4>
            <div className="space-y-2">
              {metrics.growth_opportunities?.map((opportunity, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  opportunity.priority === 'high' 
                    ? 'border-red-500 bg-red-50' 
                    : opportunity.priority === 'medium'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-green-500 bg-green-50'
                }`}>
                  <p className="font-medium text-sm">{opportunity.type}</p>
                  <p className="text-xs text-gray-600">{opportunity.suggestion}</p>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No opportunities identified</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Viral Coefficient Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Understanding Viral Coefficient</h3>
        <p className="text-blue-700 text-sm mb-3">
          Viral coefficient measures how many new users each existing user brings to the platform through referrals and sharing.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-900">< 1.0</p>
            <p className="text-blue-700">Growth slowing down</p>
          </div>
          <div>
            <p className="font-medium text-blue-900">= 1.0</p>
            <p className="text-blue-700">Sustainable growth</p>
          </div>
          <div>
            <p className="font-medium text-blue-900">> 1.0</p>
            <p className="text-blue-700">Viral growth! 🚀</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthDashboard;