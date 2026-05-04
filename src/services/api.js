import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE_URL.replace(/\/$/, '')}/api`,
  timeout: 30000,
});

function getToken() {
  try {
    return localStorage.getItem('nms_token');
  } catch {
    return null;
  }
}

api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  error => {
    // Normalize error shape for UI.
    const status = error?.response?.status;
    const payload = error?.response?.data;

    const normalized = new Error(payload?.message || error?.message || 'Request failed');
    normalized.status = status;
    normalized.payload = payload;

    if (status === 401) {
      try {
        localStorage.removeItem('nms_token');
        localStorage.removeItem('nms_admin');
      } catch {
        // ignore
      }
      window.dispatchEvent(new Event('nms:unauthorized'));
    }

    return Promise.reject(normalized);
  }
);

