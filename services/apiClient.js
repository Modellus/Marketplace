import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = 'https://modellus-api.interactivebook.workers.dev';

function buildUrl(path, searchParams) {
  const url = new URL(path, API_BASE_URL);
  if (searchParams && typeof searchParams === 'object') {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

function ensureJsonBody(body, headers) {
  if (!body || body instanceof FormData) return body;
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return JSON.stringify(body);
}

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status ?? null;
    this.payload = payload ?? null;
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    headers: customHeaders = {},
    body,
    searchParams,
    omitAuth = false,
    signal
  } = options;

  const authStore = useAuthStore();

  // Clear token if it is already expired before request
  if (!omitAuth && authStore?.token && !authStore.isAuthenticated) {
    authStore.clearAuth({ reason: 'Session expired. Please sign in again.' });
  }

  const headers = new Headers(customHeaders);
  if (!omitAuth && authStore?.authorizationHeader) {
    headers.set('Authorization', authStore.authorizationHeader);
  }

  const fetchOptions = {
    method,
    headers,
    signal
  };

  if (body !== undefined) {
    fetchOptions.body = ensureJsonBody(body, headers);
  }

  const response = await fetch(buildUrl(path, searchParams), fetchOptions);

  if (response.status === 401 && !omitAuth) {
    authStore?.clearAuth({ reason: 'Session expired. Please sign in again.' });
    throw new ApiError('Unauthorized. Please sign in again.', { status: 401 });
  }

  if (response.status === 204) {
    return null;
  }

  const responseContentType = response.headers.get('content-type') || '';
  let payload = null;
  if (responseContentType.includes('application/json')) {
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Request failed with status ${response.status}`;
    throw new ApiError(message, { status: response.status, payload });
  }

  return payload;
}

export function exchangeGoogleIdToken(idToken) {
  return apiRequest('/auth/google', {
    method: 'POST',
    body: { idToken },
    omitAuth: true
  });
}

export const modellusApi = {
  // Users
  listUsers: (params) => apiRequest('/users', { searchParams: params }),
  getUser: (id) => apiRequest(`/users/${id}`),
  createUser: (payload) => apiRequest('/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => apiRequest(`/users/${id}`, { method: 'PUT', body: payload }),
  deleteUser: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),

  // Sciences
  listSciences: () => apiRequest('/sciences'),
  getScience: (id) => apiRequest(`/sciences/${id}`),
  createScience: (payload) => apiRequest('/sciences', { method: 'POST', body: payload }),
  updateScience: (id, payload) => apiRequest(`/sciences/${id}`, { method: 'PUT', body: payload }),
  deleteScience: (id) => apiRequest(`/sciences/${id}`, { method: 'DELETE' }),

  // Science Areas
  listScienceAreas: () => apiRequest('/science-areas'),
  getScienceArea: (id) => apiRequest(`/science-areas/${id}`),
  createScienceArea: (payload) => apiRequest('/science-areas', { method: 'POST', body: payload }),
  updateScienceArea: (id, payload) => apiRequest(`/science-areas/${id}`, { method: 'PUT', body: payload }),
  deleteScienceArea: (id) => apiRequest(`/science-areas/${id}`, { method: 'DELETE' }),

  // Education Levels
  listEducationLevels: () => apiRequest('/education-levels'),
  getEducationLevel: (id) => apiRequest(`/education-levels/${id}`),

  // Models
  listModels: (params) => apiRequest('/models', { searchParams: params }),
  getModel: (id) => apiRequest(`/models/${id}`),
  createModel: (payload) => apiRequest('/models', { method: 'POST', body: payload }),
  updateModel: (id, payload) => apiRequest(`/models/${id}`, { method: 'PUT', body: payload }),
  deleteModel: (id) => apiRequest(`/models/${id}`, { method: 'DELETE' }),

  // Marketplace
  listMarketplaceEntries: () => apiRequest('/marketplace'),
  getMarketplaceEntry: (id) => apiRequest(`/marketplace/${id}`),
  createMarketplaceEntry: (payload) => apiRequest('/marketplace', { method: 'POST', body: payload }),
  updateMarketplaceEntry: (id, payload) => apiRequest(`/marketplace/${id}`, { method: 'PUT', body: payload }),
  deleteMarketplaceEntry: (id) => apiRequest(`/marketplace/${id}`, { method: 'DELETE' })
};
