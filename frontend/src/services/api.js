const API_BASE = import.meta.env.VITE_API_BASE || '/api';

let csrfToken = '';

export function setCsrfToken(token) {
  csrfToken = token || '';
}

export async function api(path, options = {}) {
  const method = options.method || 'GET';
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(method !== 'GET' && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { success: false, message: text || 'Respons API tidak valid.' };
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request gagal.');
  }

  if (payload.data?.csrf_token) {
    setCsrfToken(payload.data.csrf_token);
  }

  return payload.data || {};
}

export async function apiForm(path, formData, options = {}) {
  const method = options.method || 'POST';
  const headers = {
    Accept: 'application/json',
    ...(method !== 'GET' && csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
    body: formData,
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { success: false, message: text || 'Respons API tidak valid.' };
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request gagal.');
  }

  return payload.data || {};
}

export function rupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}
