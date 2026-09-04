import { supabase } from './supabase.js';

const EXPIRY_SKEW_SECONDS = 30;
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');
const API_BASE_URL = configuredApiBaseUrl
  ? (configuredApiBaseUrl.endsWith('/api') ? configuredApiBaseUrl : `${configuredApiBaseUrl}/api`)
  : '/api';
let refreshPromise = null;
let authRedirectStarted = false;

function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function isExpiring(session) {
  return !session?.access_token || (
    session.expires_at && session.expires_at * 1000 <= Date.now() + EXPIRY_SKEW_SECONDS * 1000
  );
}

function asAuthError(error) {
  return Object.assign(new Error(error?.message || 'Authentication required'), {
    status: 401,
    cause: error,
  });
}

async function refreshSession() {
  // Share one refresh request when several API calls notice an expired token
  // at the same time. This also avoids refresh-token rotation races.
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data?.session?.access_token) throw error || new Error('Unable to refresh session');
      return data.session;
    })().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

async function getAuthenticatedSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data?.session && !isExpiring(data.session)) return data.session;
  return refreshSession();
}

function headersForSession(session, json = true) {
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
  return headers;
}

async function signOutAndRedirect() {
  if (authRedirectStarted) return;
  authRedirectStarted = true;
  try { await supabase.auth.signOut(); } catch {}

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(`/login?next=${encodeURIComponent(current)}`);
  }
}

async function handleResponse(res) {
  if (res.status === 204) return null;
  const body = await res.json();
  if (!res.ok) throw Object.assign(new Error(body.error || 'Request failed'), { status: res.status, body });
  return body;
}

async function request(path, { method = 'GET', data } = {}) {
  let session;
  try {
    session = await getAuthenticatedSession();
  } catch (error) {
    await signOutAndRedirect();
    throw asAuthError(error);
  }

  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const body = data === undefined ? undefined : isFormData ? data : JSON.stringify(data);
  const response = await fetch(apiUrl(path), {
    method,
    headers: headersForSession(session, !isFormData),
    body,
  });

  if (response.status !== 401) return handleResponse(response);

  // A server-side 401 can mean the access token was revoked between the
  // session check and this request. Refresh once, then retry once.
  let refreshedSession;
  try {
    refreshedSession = await refreshSession();
  } catch (error) {
    await signOutAndRedirect();
    throw asAuthError(error);
  }

  const retryResponse = await fetch(apiUrl(path), {
    method,
    headers: headersForSession(refreshedSession, !isFormData),
    body,
  });

  if (retryResponse.status === 401) {
    await signOutAndRedirect();
  }
  return handleResponse(retryResponse);
}

export const api = {
  async get(path) { return request(path); },
  async post(path, data) { return request(path, { method: 'POST', data }); },
  async upload(path, formData) { return request(path, { method: 'POST', data: formData }); },
  async patch(path, data) { return request(path, { method: 'PATCH', data }); },
  async del(path) { return request(path, { method: 'DELETE' }); },
};
