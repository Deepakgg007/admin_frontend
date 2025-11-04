import axios from 'axios';

const instance = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // config.headers.Authorization = `Bearer ${token}`;
      config.headers.Authorization = `Bearer ${token}`;
      // config.headers['Authorization'] = 'Bearer 2|FAxh5eDfbeh9FXVR20ah6K0siuXD0v8IWp97zwGVd66be75c';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;