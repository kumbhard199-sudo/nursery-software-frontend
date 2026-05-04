import axios from 'axios';

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export async function getHealth() {
  const res = await axios.get(`${BASE}/health`);
  return res.data;
}

export async function getRootInfo() {
  const res = await axios.get(`${BASE}/`);
  return res.data;
}

