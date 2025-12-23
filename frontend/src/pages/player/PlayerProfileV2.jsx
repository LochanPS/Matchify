import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, TrendingUp, Flame, Target, Award } from 'lucide-react';
import './PlayerProfileV2.css';

/**
 * PlayerProfileV2 - Updated player profile without skill levels
 * Shows objective statistics, achievements, and journey
 */
const PlayerProfileV2 = ({ userId }) => {
  const [playerStats, setPlayerStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayerStats();
    fetchAchievements();
  }, [userId]);

  const fetchPlayerStats = async () => {
    try {
      const response = await fetch(`/api/player-stats/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setPlayerStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/player-stats/${userId}/achievements`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch achievements');
      const data = await response.json();
      setAchievements(data.achievements);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!playerStats) return <div className="error">Player not found</div>;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getRecentForm = () => {
    if (!playerStats.recent_form) return [];
    return playerStats.recent_form.split('').map((result, idx) => ({
      result,
      key: idx
    }));
  };

  return (
    <div className="player-profile-v2">
      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <h1 className="player-name">{playerStats.name}</h1>
          <div className="location-info">
            <span className="location-icon">📍</span>
            <span>{playerStats.city}</span>
          </div>
          <div className="playing-since">
            <span className="icon">🏸</span>
            <span>Playing since {formatDate(playerStats.first_tournament_date)}</span>
          </div>
        </div>
        <div className="experience-badge">
          <span className="badge-text">{playerStats.experience_segment}</span>
          <span className="form-badge">{playerStats.current_form_badge}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-label">Tournaments</div>
            <div className="stat-value">{playerStats.tournaments_completed}</div>
            <div className="stat-subtext">completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Matches</div>
            <div className="stat-value">{playerStats.total_matches}</div>
            <div className="stat-subtext">{playerStats.wins} wins</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Win Rate</div>
            <div className="stat-value">{playerStats.win_percentage}%</div>
            <div className="stat-subtext">
              {playerStats.total_matches >= 5 ? 'Fair sample' : 'Building record'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-label">Best Streak</div>
            <div className="stat-value">{playerStats.longest_win_streak}</div>
            <div className="stat-subtext">consecutive wins</div>
          </div>
        </div>
      </div>

      {/* Tournament Journey */}
      <div className="section">
        <h2 className="section-title">Tournament Journey</h2>
        <div className="journey-stats">
          <div className="journey-item">
            <Trophy className="journey-icon" />
            <div className="journey-content">
              <div className="journey-label">Tournaments Joined</div>
              <div className="journey-value">{playerStats.tournaments_joined}</div>
            </div>
          </div>

          <div className="journey-item">
            <Target className="journey-icon" />
            <div className="journey-content">
              <div className="journey-label">Tournaments Won</div>
              <div className="journey-value">{playerStats.tournaments_won}</div>
            </div>
          </div>

          <div className="journey-item">
            <Award className="journey-icon" />
            <div className="journey-content">
              <div className="journey-label">Runner-Up Finishes</div>
              <div className="journey-value">{playerStats.runner_up_finishes}</div>
            </div>
          </div>

          <div className="journey-item">
            <Calendar className="journey-icon" />
            <div className="journey-content">
              <div className="journey-label">Active For</div>
              <div className="journey-value">{playerStats.active_months} months</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Form */}
      {playerStats.recent_form && (
        <div className="section">
          <h2 className="section-title">Recent Form (Last 10 Matches)</h2>
          <div className="recent-form">
            {getRecentForm().map((match) => (
              <div
                key={match.key}
                className={`form-indicator ${match.result === 'W' ? 'win' : 'loss'}`}
                title={match.result === 'W' ? 'Win' : 'Loss'}
              >
                {match.result}
              </div>
            ))}
          </div>
          <div className="form-summary">
            <span className="form-text">
              {playerStats.recent_wins}/{playerStats.recent_wins + playerStats.recent_losses} wins in last 10 matches
            </span>
            <span className={`form-status ${playerStats.recent_wins >= 6 ? 'strong' : 'building'}`}>
              {playerStats.recent_wins >= 6 ? '🔥 Strong Form' : '📈 Building'}
            </span>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="section">
        <h2 className="section-title">
          🎖️ Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
        </h2>
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-content">
                <div className="achievement-title">{achievement.title}</div>
                <div className="achievement-description">{achievement.description}</div>
                {!achievement.unlocked && achievement.progress && (
                  <div className="achievement-progress">{achievement.progress}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Section */}
      <div className="section">
        <h2 className="section-title">Activity</h2>
        <div className="activity-info">
          <div className="activity-item">
            <Calendar className="activity-icon" />
            <div className="activity-content">
              <div className="activity-label">Last Active</div>
              <div className="activity-value">
                {playerStats.last_active_date 
                  ? formatDate(playerStats.last_active_date)
                  : 'Not yet active'}
              </div>
            </div>
          </div>

          <div className="activity-item">
            <TrendingUp className="activity-icon" />
            <div className="activity-content">
              <div className="activity-label">Avg Tournaments/Month</div>
              <div className="activity-value">{playerStats.tournaments_per_month.toFixed(1)}</div>
            </div>
          </div>

          <div className="activity-item">
            <Flame className="activity-icon" />
            <div className="activity-content">
              <div className="activity-label">Completion Rate</div>
              <div className="activity-value">{playerStats.completion_rate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <p>
          <strong>💡 About Your Profile:</strong> Your profile shows your real tournament journey 
          and performance metrics. No skill labels—just objective data that tells your story. 
          Keep playing to unlock more achievements!
        </p>
      </div>
    </div>
  );
};

export default PlayerProfileV2;
