import axios from 'axios';

/**
 * API Base Configuration
 * Change the base URL here to update it across the entire application
 */
export const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with base configuration
const apiBase = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiBase.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiBase.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.clear();
      window.location.href = '/auths/auth-login';
    }
    return Promise.reject(error);
  }
);

export default apiBase;
