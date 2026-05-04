const TOKEN_KEY = 'nms_token';
const ADMIN_KEY = 'nms_admin';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSession({ token, admin }) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  } catch {
    // ignore
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  } catch {
    // ignore
  }
}

export function getAdmin() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

