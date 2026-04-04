const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

interface ApiResponse<T = any> {
  data?: T;
  detail?: string;
  message?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error: ApiResponse = await response.json();
      throw new Error(error.detail || error.message || 'Request failed');
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth/login', { email, password });
  }

  async register(email: string, password: string, name: string): Promise<LoginResponse> {
    return this.post<LoginResponse>('/auth/register', { email, password, name });
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  async getAlertTrends(days: number = 7) {
    return this.get(`/dashboard/alert-trends?days=${days}`);
  }

  async getThreatMap() {
    return this.get('/dashboard/threat-map');
  }

  async getRecentAlerts(limit: number = 10) {
    return this.get(`/dashboard/recent-alerts?limit=${limit}`);
  }

  async getActivityFeed(limit: number = 20) {
    return this.get(`/dashboard/activity-feed?limit=${limit}`);
  }

  async getSystemHealth() {
    return this.get('/dashboard/system-health');
  }

  // Alerts endpoints
  async getAlerts(params?: {
    page?: number;
    size?: number;
    severity?: string;
    status?: string;
    assigned_to?: string;
    search?: string;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return this.get(`/alerts?${query.toString()}`);
  }

  async getAlert(id: string) {
    return this.get(`/alerts/${id}`);
  }

  async createAlert(data: any) {
    return this.post('/alerts', data);
  }

  async updateAlert(id: string, data: any) {
    return this.put(`/alerts/${id}`, data);
  }

  async deleteAlert(id: string) {
    return this.delete(`/alerts/${id}`);
  }

  async assignAlert(id: string, userId: string) {
    return this.post(`/alerts/${id}/assign`, { user_id: userId });
  }

  async resolveAlert(id: string, resolutionNotes?: string) {
    return this.post(`/alerts/${id}/resolve`, { resolution_notes: resolutionNotes });
  }

  // Logs endpoints
  async getLogs(params?: {
    page?: number;
    size?: number;
    start_date?: string;
    end_date?: string;
    ip_address?: string;
    endpoint?: string;
    method?: string;
    status_code?: number;
    user_id?: string;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return this.get(`/logs?${query.toString()}`);
  }

  async getLog(id: string) {
    return this.get(`/logs/${id}`);
  }

  async createLog(data: any) {
    return this.post('/logs', data);
  }

  async getLogStats(params?: {
    start_date?: string;
    end_date?: string;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return this.get(`/logs/stats/summary?${query.toString()}`);
  }

  async getLogTimeline(hours: number = 24) {
    return this.get(`/logs/stats/timeline?hours=${hours}`);
  }

  // WebSocket connection
  createWebSocket(): WebSocket {
    const token = localStorage.getItem('auth_token');
    const wsUrl = token ? `${WS_URL}?token=${token}` : WS_URL;
    return new WebSocket(wsUrl);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
