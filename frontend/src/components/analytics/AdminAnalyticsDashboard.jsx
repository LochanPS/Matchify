import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, DollarSign, Award, Loader } from 'lucide-react';

export default function AdminAnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [topOrganizers, setTopOrganizers] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard overview
      const dashboardRes = await fetch('/api/analytics/admin/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (dashboardRes.ok) {
        const dashboardJson = await dashboardRes.json();
        setDashboardData(dashboardJson.data);
      }

      // Fetch growth data
      const growthRes = await fetch('/api/analytics/admin/growth?interval=day', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (growthRes.ok) {
        const growthJson = await growthRes.json();
        setGrowthData(growthJson.data);
      }

      // Fetch top organizers
      const organizersRes = await fetch('/api/analytics/admin/top-organizers?limit=5', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (organizersRes.ok) {
        const organizersJson = await organizersRes.json();
        setTopOrganizers(organizersJson.data);
      }

      // Fetch top players
      const playersRes = await fetch('/api/analytics/admin/top-players?limit=5', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (playersRes.ok) {
        const playersJson = await playersRes.json();
        setTopPlayers(playersJson.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Key Metrics Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.total_users}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Total Tournaments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tournaments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.total_tournaments}
                </p>
              </div>
              <Award className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          {/* Total Matches */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Matches</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.total_matches}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₹{dashboardData.total_revenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Growth Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="new_users" stroke="#3B82F6" name="New Users" />
            <Line type="monotone" dataKey="new_players" stroke="#10B981" name="New Players" />
            <Line type="monotone" dataKey="new_organizers" stroke="#F59E0B" name="New Organizers" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Organizers & Players */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Organizers */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Organizers</h2>
          <div className="space-y-3">
            {topOrganizers.map((organizer, index) => (
              <div key={organizer.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{organizer.name}</p>
                    <p className="text-sm text-gray-600">{organizer.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{organizer.tournaments_created}</p>
                  <p className="text-xs text-gray-600">tournaments</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Players */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Players</h2>
          <div className="space-y-3">
            {topPlayers.map((player, index) => (
              <div key={player.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-600">{player.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{player.win_rate}%</p>
                  <p className="text-xs text-gray-600">win rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
