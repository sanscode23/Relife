const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('relife_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const json = await response.json();
  if (!response.ok || !json.success) {
    const errorMsg = json.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return json.data;
};

export const deviceService = {
  // Auth & Guest
  async loginGuest() {
    const res = await fetch(`${API_BASE_URL}/auth/guest`, { method: 'POST' });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('relife_token', data.token);
    }
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('relife_token', data.token);
    }
    return data;
  },

  async register(name, email, password, city) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, city }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('relife_token', data.token);
    }
    return data;
  },

  async upgradeGuest(name, email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/upgrade`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('relife_token', data.token);
    }
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(updates) {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboard() {
    const res = await fetch(`${API_BASE_URL}/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Device CRUD & Repairs
  async registerDevice(deviceData) {
    const res = await fetch(`${API_BASE_URL}/devices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(deviceData),
    });
    return handleResponse(res);
  },

  async getDevices() {
    const res = await fetch(`${API_BASE_URL}/devices`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getDeviceById(id) {
    const res = await fetch(`${API_BASE_URL}/devices/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async uploadDeviceImage(id, file) {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('relife_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/devices/${id}/image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  async addRepairRecord(id, repairData) {
    const res = await fetch(`${API_BASE_URL}/devices/${id}/repairs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(repairData),
    });
    return handleResponse(res);
  },

  async deleteDevice(id) {
    const res = await fetch(`${API_BASE_URL}/devices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // History & Outcome
  async getDeviceHistory(id) {
    const res = await fetch(`${API_BASE_URL}/devices/${id}/history`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateDeviceHistory(id, outcomeData) {
    const res = await fetch(`${API_BASE_URL}/devices/${id}/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(outcomeData),
    });
    return handleResponse(res);
  },
};
