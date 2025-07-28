// CupNote API Service Layer
// Frontend-Backend integration following BMAD Method

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.token = localStorage.getItem('cupnote_token');
  }

  // Helper method for API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(data.error?.message || 'API request failed', response.status, data.error?.code);
      }

      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0, 'NETWORK_ERROR');
    }
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('cupnote_token', token);
    } else {
      localStorage.removeItem('cupnote_token');
    }
  }

  // Auth endpoints
  auth = {
    register: async (data) => {
      const result = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      this.setToken(result.token.access_token);
      return result;
    },

    login: async (data) => {
      const result = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      this.setToken(result.token.access_token);
      return result;
    },

    logout: () => {
      this.setToken(null);
    },

    refresh: async (refreshToken) => {
      const result = await this.request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      this.setToken(result.token.access_token);
      return result;
    },
  };

  // Coffee endpoints
  coffees = {
    list: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/coffees${queryString ? `?${queryString}` : ''}`);
    },

    get: (id) => this.request(`/coffees/${id}`),

    create: (data) => this.request('/coffees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    update: (id, data) => this.request(`/coffees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  };

  // Tasting note endpoints
  tastingNotes = {
    list: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/tasting-notes${queryString ? `?${queryString}` : ''}`);
    },

    get: (id) => this.request(`/tasting-notes/${id}`),

    create: (data) => this.request('/tasting-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    update: (id, data) => this.request(`/tasting-notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

    delete: (id) => this.request(`/tasting-notes/${id}`, {
      method: 'DELETE',
    }),
  };

  // Recipe endpoints
  recipes = {
    list: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request(`/recipes${queryString ? `?${queryString}` : ''}`);
    },

    get: (id) => this.request(`/recipes/${id}`),

    create: (data) => this.request('/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    update: (id, data) => this.request(`/recipes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

    delete: (id) => this.request(`/recipes/${id}`, {
      method: 'DELETE',
    }),

    use: (id) => this.request(`/recipes/${id}/use`, {
      method: 'POST',
    }),
  };

  // Achievement endpoints
  achievements = {
    list: () => this.request('/achievements'),
    
    getMine: () => this.request('/users/me/achievements'),
  };

  // User endpoints
  users = {
    getStats: () => this.request('/users/me/stats'),
    
    updateProfile: (data) => this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  };

  // Upload endpoint
  upload = {
    photo: async (file) => {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(`${this.baseURL}/upload/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new ApiError(data.error?.message || 'Upload failed', response.status);
      }

      return data.data;
    },
  };
}

// Custom error class
class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

// Export singleton instance
const api = new ApiService();

// Integration with existing app
if (typeof window !== 'undefined') {
  window.api = api;
  window.ApiError = ApiError;
}