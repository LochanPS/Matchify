import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Target, Flame, TrendingUp, Loader } from 'lucide-react';

export default function PlayerAnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [matchesData, setMatchesData] = useState([]);
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
      const dashboardRes = await fetch('/api/analytics/player/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (dashboardRes.ok) {
        const dashboardJson = await dashboardRes.json();
        setDashboardData(dashboardJson.data);
      }

      // Fetch performance data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const performanceRes = await fetch(
        `/api/analytics/player/performance?start_date=${startDate}&end_date=${endDate}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      if (performanceRes.ok) {
        const performanceJson = await performanceRes.json();
        setPerformanceData(performanceJson.data);
      }

      // Fetch recent matches
      const matchesRes = await fetch('/api/analytics/player/matches?limit=5', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (matchesRes.ok) {
        const matchesJson = await matchesRes.json();
        setMatchesData(matchesJson.data);
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
      <h1 className="text-3xl font-bold text-gray-900">Your Performance</h1>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Key Metrics Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tournaments Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tournaments Played</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.total_tournaments}
                </p>
              </div>
              <Trophy className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Matches Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Matches</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.total_matches}
                </p>
              </div>
              <Target className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          {/* Win Rate Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Win Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.win_rate}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {dashboardData.matches_won} wins
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          {/* Current Streak Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.current_streak}
                </p>
                <p className="text-sm text-gray-500 mt-1">wins in a row</p>
              </div>
              <Flame className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Rate Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Win Rate Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="win_rate" stroke="#3B82F6" name="Win Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Matches Played */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Matches Played</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="matches_played" fill="#10B981" name="Matches" />
              <Bar dataKey="matches_won" fill="#3B82F6" name="Won" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Matches Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Matches</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tournament</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Opponent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Result</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {matchesData.map((match) => (
                <tr key={match.match_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{match.tournament_name}</td>
                  <td className="py-3 px-4 text-gray-600">{match.opponent_name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      match.result === 'Won'
                        ? 'bg-green-100 text-green-700'
                        : match.result === 'Lost'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {match.result}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(match.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
