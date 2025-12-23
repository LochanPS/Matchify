// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Import cache utility
import { apiCache } from '../utils/cache';

// Helper to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper to set auth token
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper to clear auth token
const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Generic fetch wrapper with error handling
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ============ Authentication APIs ============

export const authAPI = {
  signup: async (email, password, role) => {
    const data = await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },

  login: async (email, password) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },

  logout: () => {
    clearAuthToken();
  },
};

// ============ User APIs ============

export const userAPI = {
  getProfile: async (userId) => {
    const cacheKey = `user_profile_${userId}`;
    
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }
    
    const data = await apiCall(`/users/${userId}/profile`, {
      method: 'GET',
    });
    
    // Cache for 10 minutes
    apiCache.set(cacheKey, data, 600000);
    return data;
  },

  updateProfile: async (userId, profileData) => {
    const data = await apiCall(`/users/${userId}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
    
    // Invalidate profile cache after update
    apiCache.invalidate(`user_profile_${userId}`);
    return data;
  },

  getStats: async (userId) => {
    const cacheKey = `user_stats_${userId}`;
    
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }
    
    const data = await apiCall(`/users/${userId}/stats`, {
      method: 'GET',
    });
    
    // Cache for 10 minutes
    apiCache.set(cacheKey, data, 600000);
    return data;
  },

  deleteAccount: async (userId) => {
    return apiCall(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// ============ Tournament APIs ============

export const tournamentAPI = {
  list: async (filters = {}) => {
    // Extract pagination params
    const { page = 1, limit = 20, ...filterParams } = filters;
    const offset = (page - 1) * limit;
    
    // Create cache key from filters (excluding pagination)
    const cacheKey = `tournaments_${JSON.stringify(filterParams)}_page_${page}`;
    
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }
    
    const queryParams = new URLSearchParams({
      ...filterParams,
      limit,
      offset,
    });
    const data = await apiCall(`/tournaments?${queryParams.toString()}`, {
      method: 'GET',
    });
    
    // Cache for 5 minutes
    apiCache.set(cacheKey, data, 300000);
    return data;
  },

  search: async (filters = {}) => {
    // Extract pagination params
    const { page = 1, limit = 20, ...filterParams } = filters;
    const offset = (page - 1) * limit;
    
    // Create cache key from filters (excluding pagination)
    const cacheKey = `tournaments_search_${JSON.stringify(filterParams)}_page_${page}`;
    
    // Check cache first
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }
    
    const queryParams = new URLSearchParams({
      ...filterParams,
      limit,
      offset,
    });
    const data = await apiCall(`/tournaments/search?${queryParams.toString()}`, {
      method: 'GET',
    });
    
    // Cache for 5 minutes
    apiCache.set(cacheKey, data, 300000);
    return data;
  },

  getById: async (tournamentId) => {
    const cacheKey = `tournament_${tournamentId}`;
    
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }
    
    const data = await apiCall(`/tournaments/${tournamentId}`, {
      method: 'GET',
    });
    
    // Cache for 10 minutes
    apiCache.set(cacheKey, data, 600000);
    return data;
  },

  create: async (tournamentData) => {
    return apiCall('/tournaments', {
      method: 'POST',
      body: JSON.stringify(tournamentData),
    });
  },

  update: async (tournamentId, tournamentData) => {
    return apiCall(`/tournaments/${tournamentId}`, {
      method: 'PATCH',
      body: JSON.stringify(tournamentData),
    });
  },

  delete: async (tournamentId) => {
    return apiCall(`/tournaments/${tournamentId}`, {
      method: 'DELETE',
    });
  },

  getOrganizerTournaments: async (organizerId) => {
    return apiCall(`/tournaments/organizer/${organizerId}`, {
      method: 'GET',
    });
  },
};

// ============ Participant APIs ============

export const participantAPI = {
  join: async (tournamentId) => {
    const data = await apiCall(`/tournaments/${tournamentId}/join`, {
      method: 'POST',
    });
    
    // Invalidate tournament cache after joining
    apiCache.invalidate(`tournament_${tournamentId}`);
    apiCache.invalidate('tournaments_');
    return data;
  },

  leave: async (tournamentId) => {
    const data = await apiCall(`/tournaments/${tournamentId}/leave`, {
      method: 'DELETE',
    });
    
    // Invalidate tournament cache after leaving
    apiCache.invalidate(`tournament_${tournamentId}`);
    apiCache.invalidate('tournaments_');
    return data;
  },

  getParticipants: async (tournamentId) => {
    const cacheKey = `participants_${tournamentId}`;
    
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }
    
    const data = await apiCall(`/tournaments/${tournamentId}/participants`, {
      method: 'GET',
    });
    
    // Cache for 5 minutes
    apiCache.set(cacheKey, data, 300000);
    return data;
  },

  checkParticipation: async (tournamentId) => {
    return apiCall(`/tournaments/${tournamentId}/check-participation`, {
      method: 'GET',
    });
  },

  getUserTournaments: async (userId) => {
    const cacheKey = `user_tournaments_${userId}`;
    
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }
    
    const data = await apiCall(`/users/${userId}/tournaments`, {
      method: 'GET',
    });
    
    // Cache for 10 minutes
    apiCache.set(cacheKey, data, 600000);
    return data;
  },
};

// ============ Match APIs ============

export const matchAPI = {
  generateMatches: async (tournamentId) => {
    return apiCall(`/tournaments/${tournamentId}/generate-matches`, {
      method: 'POST',
    });
  },

  getTournamentMatches: async (tournamentId) => {
    return apiCall(`/tournaments/${tournamentId}/matches`, {
      method: 'GET',
    });
  },

  getById: async (matchId) => {
    return apiCall(`/matches/${matchId}`, {
      method: 'GET',
    });
  },

  deleteMatches: async (tournamentId) => {
    return apiCall(`/tournaments/${tournamentId}/matches`, {
      method: 'DELETE',
    });
  },

  getStandings: async (tournamentId, categoryId) => {
    const cacheKey = `standings_${tournamentId}_${categoryId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }

    const data = await apiCall(`/tournaments/${tournamentId}/categories/${categoryId}/standings`, {
      method: 'GET',
    });

    // Cache for 5 minutes
    apiCache.set(cacheKey, data, 300000);
    return data;
  },
};

// ============ Score APIs ============

export const scoreAPI = {
  submitScore: async (matchId, scoreData) => {
    return apiCall(`/matches/${matchId}/score`, {
      method: 'POST',
      body: JSON.stringify(scoreData),
    });
  },

  getLeaderboard: async (tournamentId) => {
    return apiCall(`/tournaments/${tournamentId}/leaderboard`, {
      method: 'GET',
    });
  },
};

// ============ Category APIs ============

export const categoryAPI = {
  create: async (tournamentId, categoryData) => {
    return apiCall(`/tournaments/${tournamentId}/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  getByTournament: async (tournamentId) => {
    const cacheKey = `categories_${tournamentId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }

    const data = await apiCall(`/tournaments/${tournamentId}/categories`, {
      method: 'GET',
    });

    // Cache for 5 minutes
    apiCache.set(cacheKey, data, 300000);
    return data;
  },

  register: async (categoryId, registrationData) => {
    return apiCall(`/categories/${categoryId}/register`, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },

  leave: async (categoryId, playerId) => {
    return apiCall(`/categories/${categoryId}/leave`, {
      method: 'DELETE',
      body: JSON.stringify({ player_id: playerId }),
    });
  },

  generateMatches: async (categoryId, format) => {
    return apiCall(`/categories/${categoryId}/generate-matches`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  },

  update: async (categoryId, categoryData) => {
    return apiCall(`/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  },

  delete: async (categoryId) => {
    return apiCall(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
};

// ============ Payment APIs ============

export const paymentAPI = {
  initiatePayment: async (categoryId, playerId, amount) => {
    return apiCall(`/payments/initiate`, {
      method: 'POST',
      body: JSON.stringify({
        category_id: categoryId,
        player_id: playerId,
        amount,
      }),
    });
  },

  verifyPayment: async (paymentId, signature) => {
    return apiCall(`/payments/verify`, {
      method: 'POST',
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    });
  },

  getPaymentStatus: async (categoryId, playerId) => {
    const queryParams = new URLSearchParams({
      category_id: categoryId,
      player_id: playerId,
    });
    return apiCall(`/payments/status?${queryParams.toString()}`, {
      method: 'GET',
    });
  },

  getPaymentHistory: async (playerId) => {
    const cacheKey = `payment_history_${playerId}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }

    const data = await apiCall(`/payments/history/${playerId}`, {
      method: 'GET',
    });

    // Cache for 10 minutes
    apiCache.set(cacheKey, data, 600000);
    return data;
  },
};

// ============ Poster APIs ============

export const posterAPI = {
  upload: async (tournamentId, file) => {
    const formData = new FormData();
    formData.append('poster', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/poster`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    const data = await response.json();
    
    // Invalidate tournament cache after poster upload
    apiCache.invalidate(`tournament_${tournamentId}`);
    return data;
  },

  get: async (tournamentId) => {
    const cacheKey = `poster_${tournamentId}`;
    
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }
    
    const data = await apiCall(`/tournaments/${tournamentId}/poster`, {
      method: 'GET',
    });
    
    // Cache for 30 minutes (posters don't change often)
    apiCache.set(cacheKey, data, 1800000);
    return data;
  },

  replace: async (tournamentId, file) => {
    const formData = new FormData();
    formData.append('poster', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/poster`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    const data = await response.json();
    
    // Invalidate caches after poster replacement
    apiCache.invalidate(`tournament_${tournamentId}`);
    apiCache.invalidate(`poster_${tournamentId}`);
    return data;
  },

  remove: async (tournamentId) => {
    const data = await apiCall(`/tournaments/${tournamentId}/poster`, {
      method: 'DELETE',
    });
    
    // Invalidate caches after poster removal
    apiCache.invalidate(`tournament_${tournamentId}`);
    apiCache.invalidate(`poster_${tournamentId}`);
    return data;
  },

  getUploadUrl: async (tournamentId) => {
    return apiCall(`/tournaments/${tournamentId}/poster/upload-url`, {
      method: 'GET',
    });
  },
};

// ============ Feedback APIs ============

export const feedbackAPI = {
  submit: async (feedbackData) => {
    return apiCall('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return apiCall(`/feedback?${queryParams.toString()}`, {
      method: 'GET',
    });
  },

  getStats: async () => {
    return apiCall('/feedback/stats', {
      method: 'GET',
    });
  },

  getUserFeedback: async () => {
    return apiCall('/feedback/my-feedback', {
      method: 'GET',
    });
  },

  updateStatus: async (feedbackId, updates) => {
    return apiCall(`/feedback/${feedbackId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};

// ============ Referral APIs ============

export const referralAPI = {
  getMyCode: async () => {
    return apiCall('/api/referrals/my-code', {
      method: 'GET',
    });
  },

  getStats: async () => {
    return apiCall('/api/referrals/stats', {
      method: 'GET',
    });
  },

  validate: async (referralCode) => {
    return apiCall('/api/referrals/validate', {
      method: 'POST',
      body: JSON.stringify({ referral_code: referralCode }),
    });
  },

  apply: async (referralCode, refereeId) => {
    return apiCall('/api/referrals/apply', {
      method: 'POST',
      body: JSON.stringify({ referral_code: referralCode, referee_id: refereeId }),
    });
  },

  complete: async (refereeId) => {
    return apiCall('/api/referrals/complete', {
      method: 'POST',
      body: JSON.stringify({ referee_id: refereeId }),
    });
  },

  getRewards: async () => {
    return apiCall('/api/referrals/rewards', {
      method: 'GET',
    });
  },

  applyReward: async (rewardId) => {
    return apiCall(`/api/referrals/rewards/${rewardId}/apply`, {
      method: 'POST',
    });
  },
};

// ============ Social Sharing APIs ============

export const socialAPI = {
  trackShare: async (contentType, contentId, platform, shareUrl) => {
    return apiCall('/api/social/share', {
      method: 'POST',
      body: JSON.stringify({
        content_type: contentType,
        content_id: contentId,
        platform: platform,
        share_url: shareUrl
      }),
    });
  },

  getShareStats: async () => {
    return apiCall('/api/social/shares/stats', {
      method: 'GET',
    });
  },

  sendInvitations: async (invitations) => {
    return apiCall('/api/tournaments/invite', {
      method: 'POST',
      body: JSON.stringify({ invitations }),
    });
  },

  getTournamentInvitations: async (tournamentId) => {
    return apiCall(`/api/tournaments/${tournamentId}/invitations`, {
      method: 'GET',
    });
  },

  getCityLeaderboard: async (city, timeframe = 'all') => {
    const queryParams = new URLSearchParams({ timeframe });
    return apiCall(`/api/leaderboard/city/${encodeURIComponent(city)}?${queryParams.toString()}`, {
      method: 'GET',
    });
  },

  getGrowthAnalytics: async (timeframe = '30d') => {
    const queryParams = new URLSearchParams({ timeframe });
    return apiCall(`/api/analytics/growth?${queryParams.toString()}`, {
      method: 'GET',
    });
  },
};

// ============ Community APIs ============

export const communityAPI = {
  // Forums
  getForumCategories: async () => {
    const cacheKey = 'forum_categories';
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }

    const data = await apiCall('/api/community/forums/categories', {
      method: 'GET',
    });

    // Cache for 10 minutes
    apiCache.set(cacheKey, data, 600000);
    return data;
  },

  getForumTopics: async (categoryId, page = 1, limit = 20) => {
    const cacheKey = `forum_topics_${categoryId}_page_${page}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }

    const queryParams = new URLSearchParams({ page, limit });
    const data = await apiCall(`/api/community/forums/categories/${categoryId}/topics?${queryParams.toString()}`, {
      method: 'GET',
    });

    // Cache for 5 minutes
    apiCache.set(cacheKey, data, 300000);
    return data;
  },

  getForumTopic: async (topicId) => {
    return apiCall(`/api/community/forums/topics/${topicId}`, {
      method: 'GET',
    });
  },

  createForumTopic: async (categoryId, title, content) => {
    const data = await apiCall('/api/community/forums/topics', {
      method: 'POST',
      body: JSON.stringify({ category_id: categoryId, title, content }),
    });

    // Invalidate forum cache
    apiCache.invalidate('forum_categories');
    apiCache.invalidate(`forum_topics_${categoryId}`);
    return data;
  },

  createForumPost: async (topicId, content) => {
    return apiCall(`/api/community/forums/topics/${topicId}/posts`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Groups
  discoverGroups: async (city) => {
    const cacheKey = `groups_discover_${city || 'all'}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }

    const queryParams = city ? new URLSearchParams({ city }) : '';
    const data = await apiCall(`/api/community/groups/discover?${queryParams.toString()}`, {
      method: 'GET',
    });

    // Cache for 5 minutes
    apiCache.set(cacheKey, data, 300000);
    return data;
  },

  getMyGroups: async () => {
    return apiCall('/api/community/groups/my-groups', {
      method: 'GET',
    });
  },

  joinGroup: async (groupId) => {
    const data = await apiCall(`/api/community/groups/${groupId}/join`, {
      method: 'POST',
    });

    // Invalidate groups cache
    apiCache.invalidate('groups_discover');
    return data;
  },

  // Events
  getEvents: async (filters = {}) => {
    const cacheKey = `events_${JSON.stringify(filters)}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }

    const queryParams = new URLSearchParams(filters);
    const data = await apiCall(`/api/community/events?${queryParams.toString()}`, {
      method: 'GET',
    });

    // Cache for 5 minutes
    apiCache.set(cacheKey, data, 300000);
    return data;
  },

  createEvent: async (eventData) => {
    const data = await apiCall('/api/community/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });

    // Invalidate events cache
    apiCache.invalidate('events_');
    return data;
  },

  rsvpEvent: async (eventId, status) => {
    return apiCall(`/api/community/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  // Challenges
  getChallenges: async () => {
    return apiCall('/api/community/challenges', {
      method: 'GET',
    });
  },

  // Stats
  getCommunityStats: async () => {
    const cacheKey = 'community_stats';
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', cacheKey);
      return cached;
    }

    const data = await apiCall('/api/community/stats', {
      method: 'GET',
    });

    // Cache for 5 minutes
    apiCache.set(cacheKey, data, 300000);
    return data;
  },
};

export default {
  authAPI,
  userAPI,
  tournamentAPI,
  participantAPI,
  matchAPI,
  scoreAPI,
  categoryAPI,
  paymentAPI,
  posterAPI,
  feedbackAPI,
  referralAPI,
  socialAPI,
  communityAPI,
  templateAPI,
};


// ============ Template APIs ============

export const templateAPI = {
  list: async (page = 1, limit = 20) => {
    const queryParams = new URLSearchParams({ page, limit });
    return apiCall(`/api/templates?${queryParams.toString()}`, {
      method: 'GET',
    });
  },

  getById: async (templateId) => {
    return apiCall(`/api/templates/${templateId}`, {
      method: 'GET',
    });
  },

  create: async (templateData) => {
    return apiCall('/api/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  },

  update: async (templateId, templateData) => {
    return apiCall(`/api/templates/${templateId}`, {
      method: 'PATCH',
      body: JSON.stringify(templateData),
    });
  },

  delete: async (templateId) => {
    return apiCall(`/api/templates/${templateId}`, {
      method: 'DELETE',
    });
  },

  duplicate: async (templateId) => {
    return apiCall(`/api/templates/${templateId}/duplicate`, {
      method: 'POST',
    });
  },

  quickCreate: async (templateId, tournamentData) => {
    return apiCall(`/api/templates/${templateId}/quick-create`, {
      method: 'POST',
      body: JSON.stringify(tournamentData),
    });
  },
};
