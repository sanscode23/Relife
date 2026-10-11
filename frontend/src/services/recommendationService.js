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

export const recommendationService = {
  async runAssessment(deviceId) {
    const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/assessment`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getRecommendation(deviceId) {
    const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/recommendation`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async selectPath(deviceId, path) {
    const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/path`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ path }),
    });
    return handleResponse(res);
  },

  async getRepairComparison(deviceId) {
    const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/repair-comparison`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getPathways(deviceId) {
    const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/pathways`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
