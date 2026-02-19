import axios from 'axios';
// export const API_BASE_URL = 'https://krishik-abiuasd.in';
export const API_BASE_URL = 'https://shobhaconsultancy.in';

// export const API_BASE_URL = 'http://localhost:8000';


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

// Response interceptor for error handling and CORS fixes
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

export const normalizeUrl = (url) => {
  if (!url) return url;
  return url.replace(/^http:/, 'https:');
};

// ========== Authentication APIs ==========

/**
 * Logout user and clear session
 */
export const logoutUser = () => {
  return apiBase.post('/auth/logout/');
};

export default apiBase;
