import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Trophy, DollarSign, Calendar } from 'lucide-react';
import './TournamentDiscoveryV2.css';

/**
 * TournamentDiscoveryV2 - Tournament discovery without skill-level filters
 * Uses smart recommendations based on player stats and preferences
 */
const TournamentDiscoveryV2 = ({ userId, userCity }) => {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchTournaments();
    fetchRecommendations();
  }, [userId, userCity]);

  useEffect(() => {
    applyFilters();
  }, [tournaments, searchTerm, selectedFormat, sortBy]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`/api/tournaments?city=${userCity}&status=upcoming`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch tournaments');
      const data = await response.json();
      setTournaments(data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/player-stats/${userId}/recommendations`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...tournaments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Format filter
    if (selectedFormat !== 'all') {
      filtered = filtered.filter(t => t.format === selectedFormat);
    }

    // Sort
    switch (sortBy) {
      case 'upcoming':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'participants':
        filtered.sort((a, b) => b.current_players - a.current_players);
        break;
      case 'prize':
        filtered.sort((a, b) => (b.prize_pool || 0) - (a.prize_pool || 0));
        break;
      case 'recommended':
        // Prioritize recommended tournaments
        filtered = [
          ...filtered.filter(t => recommendations.some(r => r.tournament_id === t.tournament_id)),
          ...filtered.filter(t => !recommendations.some(r => r.tournament_id === t.tournament_id))
        ];
        break;
      default:
        break;
    }

    setFilteredTournaments(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAvailabilityStatus = (tournament) => {
    const available = tournament.max_players - (tournament.current_players || 0);
    if (available <= 0) return { text: 'Full', color: 'red' };
    if (available <= 2) return { text: `${available} slot left`, color: 'orange' };
    return { text: `${available} slots available`, color: 'green' };
  };

  const isRecommended = (tournamentId) => {
    return recommendations.some(r => r.tournament_id === tournamentId);
  };

  return (
    <div className="tournament-discovery-v2">
      {/* Header */}
      <div className="discovery-header">
        <h1>Discover Tournaments</h1>
        <p>Find tournaments that match your interests and experience level</p>
      </div>

      {/* Search & Filters */}
      <div className="search-filters">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search tournaments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Format:</label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Formats</option>
            <option value="singles">Singles</option>
            <option value="doubles">Doubles</option>
            <option value="mixed">Mixed Doubles</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="recommended">Recommended for You ⭐</option>
            <option value="upcoming">Upcoming Soon</option>
            <option value="participants">Most Participants</option>
            <option value="prize">Highest Prize Money</option>
          </select>
        </div>
      </div>

      {/* Tournaments List */}
      <div className="tournaments-container">
        {loading ? (
          <div className="loading">Loading tournaments...</div>
        ) : filteredTournaments.length === 0 ? (
          <div className="no-results">
            <Trophy className="no-results-icon" />
            <p>No tournaments found matching your criteria</p>
          </div>
        ) : (
          filteredTournaments.map((tournament) => {
            const availability = getAvailabilityStatus(tournament);
            const recommended = isRecommended(tournament.tournament_id);

            return (
              <div
                key={tournament.tournament_id}
                className={`tournament-card ${recommended ? 'recommended' : ''}`}
              >
                {recommended && (
                  <div className="recommended-badge">⭐ Recommended for You</div>
                )}

                <div className="tournament-header">
                  <h3 className="tournament-name">{tournament.name}</h3>
                  <div className="tournament-meta">
                    <span className="format-badge">{tournament.format}</span>
                  </div>
                </div>

                <div className="tournament-details">
                  <div className="detail-item">
                    <Calendar className="detail-icon" />
                    <span>{formatDate(tournament.date)}</span>
                  </div>

                  <div className="detail-item">
                    <MapPin className="detail-icon" />
                    <span>{tournament.venue}</span>
                  </div>

                  <div className="detail-item">
                    <Users className="detail-icon" />
                    <span>
                      {tournament.current_players}/{tournament.max_players} players
                    </span>
                  </div>

                  {tournament.prize_pool && (
                    <div className="detail-item">
                      <Trophy className="detail-icon" />
                      <span>₹{tournament.prize_pool} prize</span>
                    </div>
                  )}
                </div>

                <div className="tournament-footer">
                  <div className={`availability-status ${availability.color}`}>
                    {availability.text}
                  </div>

                  <div className="entry-fee">
                    <DollarSign className="fee-icon" />
                    <span>₹{tournament.entry_fee}</span>
                  </div>

                  <button className="join-button">
                    Join Tournament
                  </button>
                </div>

                {/* Recent Participants Preview */}
                {tournament.recent_participants && tournament.recent_participants.length > 0 && (
                  <div className="participants-preview">
                    <p className="preview-label">Recent Participants:</p>
                    <div className="participants-list">
                      {tournament.recent_participants.slice(0, 3).map((participant, idx) => (
                        <div key={idx} className="participant-chip">
                          {participant.name} ({participant.win_rate}%)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Info Box */}
      <div className="info-section">
        <div className="info-box">
          <h3>💡 How We Recommend Tournaments</h3>
          <p>
            Our recommendations are based on your location, tournament preferences, 
            and participation history—not skill labels. All tournaments are open to all players. 
            Check the participant list to see who's playing and decide if it's right for you!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TournamentDiscoveryV2;
