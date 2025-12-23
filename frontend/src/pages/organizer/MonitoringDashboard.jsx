import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/MonitoringDashboard.css';

const MonitoringDashboard = () => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/monitoring/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Dashboard fetch error:', err);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/monitoring/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Alerts fetch error:', err);
    }
  };

  // Initial load and set up polling
  useEffect(() => {
    fetchDashboardData();
    fetchAlerts();
    setLoading(false);

    const interval = setInterval(() => {
      fetchDashboardData();
      fetchAlerts();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [token, refreshInterval]);

  if (loading) {
    return <div className="monitoring-loading">Loading monitoring dashboard...</div>;
  }

  if (error) {
    return <div className="monitoring-error">Error: {error}</div>;
  }

  if (!dashboardData) {
    return <div className="monitoring-error">No data available</div>;
  }

  const { systemHealth, performance, memory, users, tournaments, payments, registrations, errors } = dashboardData;

  return (
    <div className="monitoring-dashboard">
      <div className="monitoring-header">
        <h1>📊 MATCHIFY Monitoring Dashboard</h1>
        <div className="monitoring-controls">
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            className="refresh-interval"
          >
            <option value={5000}>Refresh: 5s</option>
            <option value={10000}>Refresh: 10s</option>
            <option value={30000}>Refresh: 30s</option>
            <option value={60000}>Refresh: 1m</option>
          </select>
          <button onClick={() => { fetchDashboardData(); fetchAlerts(); }} className="refresh-btn">
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h2>⚠️ Active Alerts ({alerts.length})</h2>
          <div className="alerts-list">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`alert alert-${alert.severity}`}>
                <span className="alert-severity">{alert.severity.toUpperCase()}</span>
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="monitoring-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          Business
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* System Health */}
          <div className="metric-card health-card">
            <h3>🏥 System Health</h3>
            <div className="health-status">
              <div className={`status-indicator ${systemHealth.status}`}>
                {systemHealth.status.toUpperCase()}
              </div>
              <div className="health-details">
                <p>Database: <span className={systemHealth.checks.database ? 'healthy' : 'unhealthy'}>
                  {systemHealth.checks.database ? '✅ Connected' : '❌ Disconnected'}
                </span></p>
                <p>Memory: <span className={systemHealth.checks.memory ? 'healthy' : 'unhealthy'}>
                  {systemHealth.checks.memory ? '✅ Healthy' : '❌ Critical'}
                </span></p>
                <p>Performance: <span className={systemHealth.checks.performance ? 'healthy' : 'unhealthy'}>
                  {systemHealth.checks.performance ? '✅ Good' : '❌ Degraded'}
                </span></p>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <h4>👥 Total Users</h4>
              <div className="metric-value">{users?.total_users || 0}</div>
              <div className="metric-detail">
                <span>Players: {users?.players || 0}</span>
                <span>Organizers: {users?.organizers || 0}</span>
              </div>
              <div className="metric-trend">+{users?.new_users_24h || 0} in 24h</div>
            </div>

            <div className="metric-card">
              <h4>🏆 Tournaments</h4>
              <div className="metric-value">{tournaments?.total_tournaments || 0}</div>
              <div className="metric-detail">
                <span>Active: {tournaments?.active_tournaments || 0}</span>
                <span>Completed: {tournaments?.completed_tournaments || 0}</span>
              </div>
              <div className="metric-trend">+{tournaments?.new_tournaments_24h || 0} in 24h</div>
            </div>

            <div className="metric-card">
              <h4>💰 Revenue</h4>
              <div className="metric-value">₹{(payments?.total_revenue || 0).toLocaleString()}</div>
              <div className="metric-detail">
                <span>Transactions: {payments?.total_transactions || 0}</span>
                <span>Success Rate: {payments?.total_transactions > 0 ? ((payments?.successful_transactions / payments?.total_transactions) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="metric-trend">+{payments?.transactions_24h || 0} in 24h</div>
            </div>

            <div className="metric-card">
              <h4>📝 Registrations</h4>
              <div className="metric-value">{registrations?.total_registrations || 0}</div>
              <div className="metric-detail">
                <span>Active: {registrations?.active_registrations || 0}</span>
              </div>
              <div className="metric-trend">+{registrations?.new_registrations_24h || 0} in 24h</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="tab-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>⚡ API Performance</h3>
              <div className="performance-metrics">
                <div className="perf-metric">
                  <span>Avg Response Time:</span>
                  <strong>{performance?.apiMetrics?.avgResponseTime || 0}ms</strong>
                </div>
                <div className="perf-metric">
                  <span>P50:</span>
                  <strong>{performance?.apiMetrics?.p50 || 0}ms</strong>
                </div>
                <div className="perf-metric">
                  <span>P95:</span>
                  <strong className={performance?.apiMetrics?.p95 > 200 ? 'warning' : ''}>
                    {performance?.apiMetrics?.p95 || 0}ms
                  </strong>
                </div>
                <div className="perf-metric">
                  <span>P99:</span>
                  <strong>{performance?.apiMetrics?.p99 || 0}ms</strong>
                </div>
                <div className="perf-metric">
                  <span>Total Calls:</span>
                  <strong>{performance?.apiMetrics?.totalCalls || 0}</strong>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h3>🗄️ Database Performance</h3>
              <div className="performance-metrics">
                <div className="perf-metric">
                  <span>Avg Query Time:</span>
                  <strong>{performance?.dbMetrics?.avgQueryTime || 0}ms</strong>
                </div>
                <div className="perf-metric">
                  <span>P50:</span>
                  <strong>{performance?.dbMetrics?.p50 || 0}ms</strong>
                </div>
                <div className="perf-metric">
                  <span>P95:</span>
                  <strong className={performance?.dbMetrics?.p95 > 100 ? 'warning' : ''}>
                    {performance?.dbMetrics?.p95 || 0}ms
                  </strong>
                </div>
                <div className="perf-metric">
                  <span>P99:</span>
                  <strong>{performance?.dbMetrics?.p99 || 0}ms</strong>
                </div>
                <div className="perf-metric">
                  <span>Total Queries:</span>
                  <strong>{performance?.dbMetrics?.totalQueries || 0}</strong>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h3>💾 Memory Usage</h3>
              <div className="performance-metrics">
                <div className="perf-metric">
                  <span>Heap Used:</span>
                  <strong>{memory?.heapUsed || 0}MB</strong>
                </div>
                <div className="perf-metric">
                  <span>Heap Total:</span>
                  <strong>{memory?.heapTotal || 0}MB</strong>
                </div>
                <div className="perf-metric">
                  <span>Usage %:</span>
                  <strong className={parseFloat(memory?.heapUsagePercent) > 80 ? 'warning' : ''}>
                    {memory?.heapUsagePercent || 0}%
                  </strong>
                </div>
                <div className="perf-metric">
                  <span>RSS:</span>
                  <strong>{memory?.rss || 0}MB</strong>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h3>📊 Error Metrics</h3>
              <div className="performance-metrics">
                <div className="perf-metric">
                  <span>Error Rate:</span>
                  <strong className={performance?.errorRate > 2 ? 'warning' : ''}>
                    {performance?.errorRate || 0}%
                  </strong>
                </div>
                <div className="perf-metric">
                  <span>Total Errors:</span>
                  <strong>{errors?.total_errors || 0}</strong>
                </div>
                <div className="perf-metric">
                  <span>Unique Types:</span>
                  <strong>{errors?.unique_error_types || 0}</strong>
                </div>
                <div className="perf-metric">
                  <span>Last Hour:</span>
                  <strong>{errors?.errors_last_hour || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="tab-content">
          <div className="metric-card">
            <h3>👥 User Statistics</h3>
            <div className="user-stats">
              <div className="stat-row">
                <span>Total Users:</span>
                <strong>{users?.total_users || 0}</strong>
              </div>
              <div className="stat-row">
                <span>Players:</span>
                <strong>{users?.players || 0}</strong>
              </div>
              <div className="stat-row">
                <span>Organizers:</span>
                <strong>{users?.organizers || 0}</strong>
              </div>
              <div className="stat-row">
                <span>New Users (24h):</span>
                <strong className="highlight">+{users?.new_users_24h || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Tab */}
      {activeTab === 'business' && (
        <div className="tab-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>💰 Payment Metrics</h3>
              <div className="business-metrics">
                <div className="metric-row">
                  <span>Total Revenue:</span>
                  <strong>₹{(payments?.total_revenue || 0).toLocaleString()}</strong>
                </div>
                <div className="metric-row">
                  <span>Transactions:</span>
                  <strong>{payments?.total_transactions || 0}</strong>
                </div>
                <div className="metric-row">
                  <span>Successful:</span>
                  <strong className="success">{payments?.successful_transactions || 0}</strong>
                </div>
                <div className="metric-row">
                  <span>Failed:</span>
                  <strong className="error">{payments?.failed_transactions || 0}</strong>
                </div>
                <div className="metric-row">
                  <span>Success Rate:</span>
                  <strong>{payments?.total_transactions > 0 ? ((payments?.successful_transactions / payments?.total_transactions) * 100).toFixed(1) : 0}%</strong>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <h3>🏆 Tournament Metrics</h3>
              <div className="business-metrics">
                <div className="metric-row">
                  <span>Total Tournaments:</span>
                  <strong>{tournaments?.total_tournaments || 0}</strong>
                </div>
                <div className="metric-row">
                  <span>Active:</span>
                  <strong className="highlight">{tournaments?.active_tournaments || 0}</strong>
                </div>
                <div className="metric-row">
                  <span>Completed:</span>
                  <strong>{tournaments?.completed_tournaments || 0}</strong>
                </div>
                <div className="metric-row">
                  <span>Total Entry Fees:</span>
                  <strong>₹{(tournaments?.total_fees || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="monitoring-footer">
        <p>Last updated: {new Date(dashboardData.timestamp).toLocaleTimeString()}</p>
        <p>Refresh interval: {refreshInterval / 1000}s</p>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
