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

export const certificateService = {
  async getSafetyChecklist(deviceId) {
    const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/safety`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateSafetyChecklist(deviceId, checklistData) {
    const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/safety`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(checklistData),
    });
    return handleResponse(res);
  },

  async generateCertificate(deviceId) {
    const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/certificate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getCertificate(deviceId) {
    const res = await fetch(`${API_BASE_URL}/devices/${deviceId}/certificate`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getPublicCertificate(verificationId) {
    const res = await fetch(`${API_BASE_URL}/certificates/${verificationId}`);
    return handleResponse(res);
  },

  async getGlobalImpact() {
    const res = await fetch(`${API_BASE_URL}/impact`);
    return handleResponse(res);
  },

  async getUserImpact() {
    const res = await fetch(`${API_BASE_URL}/impact/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
