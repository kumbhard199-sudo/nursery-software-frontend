import { api } from './api';

export async function listWorkers() {
  const res = await api.get('/workers');
  return res.data;
}

export async function createWorker(payload) {
  const res = await api.post('/workers', payload);
  return res.data;
}

export async function getWorker(id) {
  const res = await api.get(`/workers/${id}`);
  return res.data;
}

export async function updateWorker(id, payload) {
  const res = await api.put(`/workers/${id}`, payload);
  return res.data;
}

export async function deleteWorker(id) {
  const res = await api.delete(`/workers/${id}`);
  return res.data;
}

export async function recordAttendance(workerId, payload) {
  const res = await api.post(`/workers/${workerId}/attendance`, payload);
  return res.data;
}

export async function updateAttendance(attendanceId, payload) {
  const res = await api.put(`/workers/attendance/${attendanceId}`, payload);
  return res.data;
}

export async function getSalary(workerId, month, year) {
  const res = await api.get(`/workers/${workerId}/salary/${month}/${year}`);
  return res.data;
}

