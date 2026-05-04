import { api } from './api';

export async function listSales() {
  const res = await api.get('/sales');
  return res.data;
}

export async function createSale(payload) {
  const res = await api.post('/sales', payload);
  return res.data;
}

export async function getSale(id) {
  const res = await api.get(`/sales/${id}`);
  return res.data;
}

export async function deleteSale(id) {
  const res = await api.delete(`/sales/${id}`);
  return res.data;
}

export async function getSalesReport(params) {
  const res = await api.get('/sales/report', { params });
  return res.data;
}

export async function generateInvoice(id) {
  const res = await api.post(`/sales/${id}/invoice`);
  return res.data;
}

