import { api } from './api';

export async function listBatches() {
  const res = await api.get('/batches');
  return res.data;
}

export async function createBatch(payload) {
  const res = await api.post('/batches', payload);
  return res.data;
}

export async function getBatch(id) {
  const res = await api.get(`/batches/${id}`);
  return res.data;
}

export async function updateBatch(id, payload) {
  const res = await api.put(`/batches/${id}`, payload);
  return res.data;
}

export async function updateDeadCrops(id, payload) {
  const res = await api.put(`/batches/${id}/dead-crops`, payload);
  return res.data;
}

export async function deleteBatch(id) {
  const res = await api.delete(`/batches/${id}`);
  return res.data;
}

export async function getBatchStock(id) {
  const res = await api.get(`/batches/${id}/stock`);
  return res.data;
}

export async function getBatchSalesSummary(id) {
  const res = await api.get(`/batches/${id}/sales-summary`);
  return res.data;
}

