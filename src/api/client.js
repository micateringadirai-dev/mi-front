import axios from 'axios';

let rawBaseURL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');

// Auto-append /api if user supplied a root URL (e.g. https://my-app.onrender.com)
if (rawBaseURL.startsWith('http') && !rawBaseURL.endsWith('/api')) {
  rawBaseURL += '/api';
}

const api = axios.create({
  baseURL: rawBaseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mi_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Reject HTML responses from Vercel SPA rewrites when API is offline or unrouted
api.interceptors.response.use(
  (response) => {
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype html') || response.data.includes('<html'))
    ) {
      return Promise.reject(
        new Error('Backend API returned HTML instead of JSON (SPA rewrite). Verify backend URL or VITE_API_URL.')
      );
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
