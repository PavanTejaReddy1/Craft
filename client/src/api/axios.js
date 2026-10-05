import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 10000, // 10 s — prevents indefinite hangs when server is unreachable
  headers: { 'Content-Type': 'application/json' },
});

// Attach saved access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → try silent token refresh once, then bail to login
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Only attempt refresh for 401s that haven't already been retried
    // and NOT for the auth endpoints themselves (avoid infinite loop)
    const isAuthEndpoint = original?.url?.includes('/auth/');
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true, timeout: 5000 }
        );
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem('accessToken');
        // Don't hard-redirect — let the app handle it gracefully
      }
    }

    return Promise.reject(error);
  }
);

export default api;
