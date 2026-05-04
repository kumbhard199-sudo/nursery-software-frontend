import { api } from './api';

export async function listTravellingCosts({ month, year } = {}) {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await api.get(`/travelling-costs${query}`);
  return res.data;
}

export async function createTravellingCost(payload) {
  const res = await api.post('/travelling-costs', payload);
  return res.data;
}

export async function getTravellingCost(id) {
  const res = await api.get(`/travelling-costs/${id}`);
  return res.data;
}

export async function updateTravellingCost(id, payload) {
  const res = await api.put(`/travelling-costs/${id}`, payload);
  return res.data;
}

export async function deleteTravellingCost(id) {
  const res = await api.delete(`/travelling-costs/${id}`);
  return res.data;
}

export async function getMonthlySummary(year) {
  const res = await api.get(`/travelling-costs/summary/${year}`);
  return res.data;
}
