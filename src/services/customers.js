import { api } from './api';

export async function listCustomers() {
  const res = await api.get('/customers');
  return res.data;
}

export async function createCustomer(payload) {
  const res = await api.post('/customers', payload);
  return res.data;
}

export async function getCustomer(id) {
  const res = await api.get(`/customers/${id}`);
  return res.data;
}

export async function updateCustomer(id, payload) {
  const res = await api.put(`/customers/${id}`, payload);
  return res.data;
}

export async function deleteCustomer(id) {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
}

export async function searchCustomers(q) {
  const res = await api.get('/customers/search', { params: { q } });
  return res.data;
}

