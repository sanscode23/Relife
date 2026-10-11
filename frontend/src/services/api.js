const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '')

async function request(path, { method = 'GET', body, authenticated = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (authenticated) {
    const token = localStorage.getItem('relife_token')
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    })
  } catch {
    throw new Error('Could not reach the RE:LIFE API. Check that the backend is running and VITE_API_BASE_URL is correct.')
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error(`The RE:LIFE API returned an unreadable response (HTTP ${response.status}).`)
  }

  if (!response.ok || payload.success !== true) {
    throw new Error(payload.message || `The RE:LIFE API request failed (HTTP ${response.status}).`)
  }

  return payload.data
}

export const api = {
  async startGuestSession() {
    const data = await request('/auth/guest', { method: 'POST', authenticated: false })
    if (!data?.token) throw new Error('The API did not return an authentication token.')
    localStorage.setItem('relife_token', data.token)
    return data
  },
  registerDevice(device) {
    return request('/devices', { method: 'POST', body: device })
  },
  runAssessment(deviceId) {
    return request(`/devices/${encodeURIComponent(deviceId)}/assessment`, { method: 'POST' })
  },
  selectPath(deviceId, path) {
    return request(`/devices/${encodeURIComponent(deviceId)}/path`, { method: 'POST', body: { path } })
  },
  getSafetyChecklist(deviceId) {
    return request(`/devices/${encodeURIComponent(deviceId)}/safety`)
  },
  updateSafetyChecklist(deviceId, checklist) {
    return request(`/devices/${encodeURIComponent(deviceId)}/safety`, { method: 'PATCH', body: checklist })
  },
  generateCertificate(deviceId) {
    return request(`/devices/${encodeURIComponent(deviceId)}/certificate`, { method: 'POST' })
  },
  getPublicCertificate(verificationId) {
    return request(`/certificates/${encodeURIComponent(verificationId)}`, { authenticated: false })
  },
}
