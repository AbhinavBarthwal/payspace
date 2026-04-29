// Central API service - all backend calls go through here

const HOST = window.location.hostname;
const BASE_URL = `http://${HOST}:8081/api`;

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status; // Attach status code
    throw err;
  }
  return data;
}

// ─── Auth ──────────────────────────────────────────────
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, walletId: data.walletId }));
  return data;
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await handleResponse(res);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, walletId: data.walletId }));
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

// ─── Wallet ─────────────────────────────────────────────
export async function getBalance() {
  const res = await fetch(`${BASE_URL}/wallet/balance`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function addFunds(amount) {
  const res = await fetch(`${BASE_URL}/wallet/add-funds`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  });
  return handleResponse(res);
}

export async function transfer(receiverEmail, amount, note) {
  const res = await fetch(`${BASE_URL}/wallet/transfer`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ receiverEmail, amount, note }),
  });
  return handleResponse(res);
}

export async function getTransactions() {
  const res = await fetch(`${BASE_URL}/wallet/transactions`, { headers: authHeaders() });
  return handleResponse(res);
}

// ─── Users ──────────────────────────────────────────────
export async function getMe() {
  const res = await fetch(`${BASE_URL}/users/me`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function searchUser(email) {
  const res = await fetch(`${BASE_URL}/users/search?email=${encodeURIComponent(email)}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/users/all`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getAnalytics(monthOffset = 0) {
  const res = await fetch(`${BASE_URL}/users/analytics?monthOffset=${monthOffset}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}
