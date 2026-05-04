import { api } from './api';

export async function getDashboardStats() {
  const res = await api.get('/reports/dashboard');
  return res.data;
}

export async function getMonthlyReport(month, year) {
  const res = await api.get(`/reports/monthly/${month}/${year}`);
  return res.data;
}

export async function getProfitSummary(params) {
  const res = await api.get('/reports/profit-summary', { params });
  return res.data;
}

