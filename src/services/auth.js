import { api } from './api';

export async function login(payload) {
  const res = await api.post('/auth/login', payload);
  return res.data;
}

export async function setupInitialAdmin(payload) {
  const res = await api.post('/auth/setup', payload);
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

export async function changePassword(payload) {
  const res = await api.put('/auth/change-password', payload);
  return res.data;
}

