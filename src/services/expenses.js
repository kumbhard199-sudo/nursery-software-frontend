import { api } from './api';

export async function listRawMaterials() {
  const res = await api.get('/expenses/raw-materials');
  return res.data;
}

export async function addRawMaterial(payload) {
  const res = await api.post('/expenses/raw-materials', payload);
  return res.data;
}

export async function getRawMaterial(id) {
  const res = await api.get(`/expenses/raw-materials/${id}`);
  return res.data;
}

export async function updateRawMaterial(id, payload) {
  const res = await api.put(`/expenses/raw-materials/${id}`, payload);
  return res.data;
}

export async function deleteRawMaterial(id) {
  const res = await api.delete(`/expenses/raw-materials/${id}`);
  return res.data;
}

export async function getMonthlyExpenses(month, year) {
  const res = await api.get(`/expenses/monthly/${month}/${year}`);
  return res.data;
}

export async function getExpenseSummary(params) {
  const res = await api.get('/expenses/summary', { params });
  return res.data;
}

