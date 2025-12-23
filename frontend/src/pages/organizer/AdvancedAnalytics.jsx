import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/AdvancedAnalytics.css';

const AdvancedAnalytics = () => {
  const { user, token } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [presetRange, setPresetRange] = useState('30days');

  // Fetch analytics data
  const fetchAnalytics = async (type) => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/analytics/advanced/${type}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Analytics fetch error:', err);
    }
  };

  // Handle preset date ranges
  const handlePresetRange = (preset) => {
    const end = new Date();
    let start = new Date();

    switch (preset) {
      case 'today':
        start = new Date(end);
        break;
      case '7days':
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        break;
    }

    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
    setPresetRange(preset);
  };

  // Initial load
  useEffect(() => {
    fetchAnalytics('users');
    setLoading(false);
  }, [token]);

  // Fetch when tab changes
  useEffect(() => {
    if (activeTab === 'users') fetchAnalytics('users');
    else if (activeTab === 'tournaments') fetchAnalytics('tournaments');
    else if (activeTab === 'payments') fetchAnalytics('payments');
    else if (activeTab === 'engagement') fetchAnalytics('engagement');
  }, [activeTab, dateRange]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="analytics-error">Error: {error}</div>;
  }

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <h1>📊 Advanced Analytics Dashboard</h1>
        <div className="analytics-controls">
          <div className="date-controls">
            <div className="preset-buttons">
              <button 
                className={`preset-btn ${presetRange === 'today' ? 'active' : ''}`}
                onClick={() => handlePresetRange('today')}
              >
                Today
              </button>
              <button 
                className={`preset-btn ${presetRange === '7days' ? 'active' : ''}`}
                onClick={() => handlePresetRange('7days')}
              >
                7 Days
              </button>
              <button 
                className={`preset-btn ${presetRange === '30days' ? 'active' : ''}`}
                onClick={() => handlePresetRange('30days')}
              >
                30 Days
              </button>
              <button 
                className={`preset-btn ${presetRange === '90days' ? 'active' : ''}`}
                onClick={() => handlePresetRange('90days')}
              >
                90 Days
              </button>
            </div>
            <div className="custom-dates">
              <input 
                type="date" 
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                className="date-input"
              />
              <span>to</span>
              <input 
                type="date" 
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                className="date-input"
              />
            </div>
          </div>
          <button onClick={() => fetchAnalytics(activeTab)} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tournaments' ? 'active' : ''}`}
          onClick={() => setActiveTab('tournaments')}
        >
          Tournaments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
        >
          Engagement
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && analyticsData && (
        <div className="tab-content">
          <div className="analytics-section">
            <h2>📈 Signup Trends</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Signups</th>
                    <th>Players</th>
                    <th>Organizers</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.signupTrends?.map((row, idx) => (
                    <tr key={idx}>
                      <td>{new Date(row.date).toLocaleDateString()}</td>
                      <td><strong>{row.total_signups}</strong></td>
                      <td>{row.player_signups}</td>
                      <td>{row.organizer_signups}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="analytics-section">
            <h2>🔄 User Retention</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Signup Date</th>
                    <th>Total Users</th>
                    <th>Active (7d)</th>
                    <th>Active (30d)</th>
                    <th>Retention Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.retention?.map((row, idx) => {
                    const retentionRate = row.total_users > 0 
                      ? ((row.active_30d / row.total_users) * 100).toFixed(1)
                      : 0;
                    return (
                      <tr key={idx}>
                        <td>{new Date(row.signup_date).toLocaleDateString()}</td>
                        <td>{row.total_users}</td>
                        <td>{row.active_7d}</td>
                        <td>{row.active_30d}</td>
                        <td><strong>{retentionRate}%</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="analytics-section">
            <h2>🌍 User Segmentation</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>City</th>
                    <th>User Count</th>
                    <th>Avg Days Active</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.segmentation?.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.role}</strong></td>
                      <td>{row.city}</td>
                      <td>{row.user_count}</td>
                      <td>{row.avg_days_active?.toFixed(1)} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tournaments Tab */}
      {activeTab === 'tournaments' && analyticsData && (
        <div className="tab-content">
          <div className="analytics-section">
            <h2>🏆 Tournament Creation Trends</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Created</th>
                    <th>Active</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.creationTrends?.map((row, idx) => (
                    <tr key={idx}>
                      <td>{new Date(row.date).toLocaleDateString()}</td>
                      <td><strong>{row.tournaments_created}</strong></td>
                      <td>{row.active}</td>
                      <td>{row.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="analytics-section">
            <h2>📊 Top Tournaments</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Tournament Name</th>
                    <th>Status</th>
                    <th>Participants</th>
                    <th>Entry Fee</th>
                    <th>Total Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.performance?.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.name}</strong></td>
                      <td>{row.status}</td>
                      <td>{row.participant_count}</td>
                      <td>₹{row.avg_entry_fee?.toFixed(0)}</td>
                      <td>₹{row.total_fees?.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="analytics-section">
            <h2>🎯 Tournament Formats</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Format</th>
                    <th>Count</th>
                    <th>Avg Entry Fee</th>
                    <th>Total Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.formats?.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.format}</strong></td>
                      <td>{row.count}</td>
                      <td>₹{row.avg_fee?.toFixed(0)}</td>
                      <td>₹{row.total_fees?.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && analyticsData && (
        <div className="tab-content">
          <div className="analytics-section">
            <h2>💰 Revenue Trends</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transactions</th>
                    <th>Successful</th>
                    <th>Failed</th>
                    <th>Revenue</th>
                    <th>Avg Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.revenueTrends?.map((row, idx) => (
                    <tr key={idx}>
                      <td>{new Date(row.date).toLocaleDateString()}</td>
                      <td>{row.transactions}</td>
                      <td className="success">{row.successful}</td>
                      <td className="error">{row.failed}</td>
                      <td><strong>₹{row.revenue?.toFixed(0)}</strong></td>
                      <td>₹{row.avg_transaction?.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="analytics-section">
            <h2>📊 Payment Success Rate</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Total Amount</th>
                    <th>Avg Amount</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.successRate?.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.status}</strong></td>
                      <td>{row.count}</td>
                      <td>₹{row.total_amount?.toFixed(0)}</td>
                      <td>₹{row.avg_amount?.toFixed(0)}</td>
                      <td>{row.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="analytics-section">
            <h2>🌍 Revenue by City</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>City</th>
                    <th>Transactions</th>
                    <th>Successful</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.revenueByCity?.map((row, idx) => (
                    <tr key={idx}>
                      <td><strong>{row.city}</strong></td>
                      <td>{row.transactions}</td>
                      <td className="success">{row.successful}</td>
                      <td>₹{row.revenue?.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && analyticsData && (
        <div className="tab-content">
          <div className="analytics-section">
            <h2>🎮 Match Participation</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Matches</th>
                    <th>Participants</th>
                    <th>Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.matchParticipation?.map((row, idx) => (
                    <tr key={idx}>
                      <td>{new Date(row.date).toLocaleDateString()}</td>
                      <td>{row.matches}</td>
                      <td>{row.total_participants}</td>
                      <td>{row.completed_matches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="analytics-section">
            <h2>👤 Profile Completion</h2>
            <div className="completion-stats">
              {analyticsData.profileCompletion && analyticsData.profileCompletion[0] && (
                <>
                  <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-value">{analyticsData.profileCompletion[0].total_users}</p>
                  </div>
                  <div className="stat-card">
                    <h3>With Bio</h3>
                    <p className="stat-value">{analyticsData.profileCompletion[0].with_bio}</p>
                  </div>
                  <div className="stat-card">
                    <h3>With Picture</h3>
                    <p className="stat-value">{analyticsData.profileCompletion[0].with_picture}</p>
                  </div>
                  <div className="stat-card">
                    <h3>With City</h3>
                    <p className="stat-value">{analyticsData.profileCompletion[0].with_city}</p>
                  </div>
                  <div className="stat-card highlight">
                    <h3>Completion Rate</h3>
                    <p className="stat-value">{analyticsData.profileCompletion[0].completion_rate}%</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="analytics-section">
            <h2>🤝 Community Engagement</h2>
            <div className="engagement-stats">
              {analyticsData.communityEngagement?.map((row, idx) => (
                <div key={idx} className="engagement-card">
                  <h3>{row.type.replace('_', ' ').toUpperCase()}</h3>
                  <p className="engagement-value">{row.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="analytics-footer">
        <p>Period: {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}</p>
        <button onClick={() => window.print()} className="print-btn">🖨️ Print</button>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
