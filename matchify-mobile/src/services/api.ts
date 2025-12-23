import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.matchify.app';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
      }
    );
  }

  // Tournament endpoints
  async getTournaments(filters?: any) {
    const response = await this.client.get('/tournaments', { params: filters });
    return response.data;
  }

  async getTournamentById(id: string) {
    const response = await this.client.get(`/tournaments/${id}`);
    return response.data;
  }

  async createTournament(data: any) {
    const response = await this.client.post('/tournaments', data);
    return response.data;
  }

  async joinTournament(tournamentId: string) {
    const response = await this.client.post(`/tournaments/${tournamentId}/join`);
    return response.data;
  }

  async withdrawTournament(tournamentId: string) {
    const response = await this.client.post(`/tournaments/${tournamentId}/withdraw`);
    return response.data;
  }

  // User endpoints
  async getUserProfile(userId: string) {
    const response = await this.client.get(`/users/${userId}/profile`);
    return response.data;
  }

  async updateUserProfile(userId: string, data: any) {
    const response = await this.client.patch(`/users/${userId}`, data);
    return response.data;
  }

  // Match endpoints
  async getMatches(tournamentId: string) {
    const response = await this.client.get(`/tournaments/${tournamentId}/matches`);
    return response.data;
  }

  async getMatchById(matchId: string) {
    const response = await this.client.get(`/matches/${matchId}`);
    return response.data;
  }

  async submitScore(matchId: string, data: any) {
    const response = await this.client.post(`/matches/${matchId}/score`, data);
    return response.data;
  }

  // Notification endpoints
  async getNotifications() {
    const response = await this.client.get('/api/notifications');
    return response.data;
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await this.client.patch(`/api/notifications/${notificationId}/read`);
    return response.data;
  }

  // Analytics endpoints
  async getAnalytics(filters?: any) {
    const response = await this.client.get('/api/analytics', { params: filters });
    return response.data;
  }

  // Help endpoints
  async getFAQ(filters?: any) {
    const response = await this.client.get('/api/help/faq', { params: filters });
    return response.data;
  }

  async submitSupportTicket(data: any) {
    const response = await this.client.post('/api/help/contact', data);
    return response.data;
  }

  // Generic request method
  async request(method: string, url: string, data?: any, config?: any) {
    const response = await this.client.request({
      method,
      url,
      data,
      ...config
    });
    return response.data;
  }
}

export const apiClient = new APIClient();
