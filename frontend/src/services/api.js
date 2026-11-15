const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

export async function apiFetch(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method, credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('Não foi possível conectar à API. Verifique se o servidor está ligado e tente novamente.', 0);
  }
  let result;
  try { result = await response.json(); }
  catch { throw new ApiError('A resposta do servidor não pôde ser lida. Tente novamente.', response.status); }
  if (!response.ok) throw new ApiError(result.error || 'Não foi possível concluir a operação.', response.status, result.fields || {});
  return result;
}
