import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Award, Loader } from 'lucide-react';

export default function OrganizerAnalyticsDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [formatData, setFormatData] = useState([]);
  const [tournamentsData, setTournamentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard overview
      const dashboardRes = await fetch('/api/analytics/organizer/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (dashboardRes.ok) {
        const dashboardJson = await dashboardRes.json();
        setDashboardData(dashboardJson.data);
      }

      // Fetch revenue data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const revenueRes = await fetch(
        `/api/analytics/organizer/revenue?start_date=${startDate}&end_date=${endDate}&interval=${dateRange}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      if (revenueRes.ok) {
        const revenueJson = await revenueRes.json();
        setRevenueData(revenueJson.data);
      }

      // Fetch format data
      const formatRes = await fetch('/api/analytics/organizer/formats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (formatRes.ok) {
        const formatJson = await formatRes.json();
        setFormatData(formatJson.data);
      }

      // Fetch tournaments data
      const tournamentsRes = await fetch('/api/analytics/organizer/tournaments?limit=5', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (tournamentsRes.ok) {
        const tournamentsJson = await tournamentsRes.json();
        setTournamentsData(tournamentsJson.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>

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
                <p className="text-gray-600 text-sm">Total Tournaments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.total_tournaments}
                </p>
              </div>
              <Award className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          {/* Participants Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Participants</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.total_participants}
                </p>
              </div>
              <Users className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ₹{dashboardData.total_revenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          {/* Completion Rate Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboardData.completion_rate}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Format Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tournament Formats</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formatData}
                dataKey="count"
                nameKey="format"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {formatData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tournaments Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tournaments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tournament</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Participants</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Matches</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {tournamentsData.map((tournament) => (
                <tr key={tournament.tournament_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{tournament.tournament_name}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(tournament.tournament_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{tournament.participant_count}</td>
                  <td className="py-3 px-4 text-gray-600">{tournament.match_count}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {tournament.average_rating > 0 ? `${tournament.average_rating.toFixed(1)}★` : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tournament.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : tournament.status === 'ongoing'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {tournament.status}
                    </span>
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
