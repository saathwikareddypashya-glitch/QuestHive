import { ApiError, DB_EVENT } from './mockDb';

/**
 * REST client for the Spring Boot backend.
 * VITE_API_URL  — backend base URL (default http://localhost:8080/api)
 * VITE_USE_MOCK — "true" runs the app on in-browser mock data instead (no backend needed)
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
export const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8080/api').replace(/\/$/, '');

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the QuestHive server. Make sure the Spring Boot backend is running on port 8080.', 'NETWORK');
  }
  if (!res.ok) {
    let message = 'Something went wrong. Please try again.';
    try { message = (await res.json()).error || message; } catch { /* non-JSON error */ }
    throw new ApiError(message, String(res.status));
  }
  const data = res.status === 204 ? undefined : await res.json();
  // Tell every open page to refetch after a change, exactly like the mock store does.
  if (method !== 'GET') window.dispatchEvent(new Event(DB_EVENT));
  return data as T;
}

export const http = {
  get: <T,>(path: string) => request<T>('GET', path),
  post: <T,>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T,>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T,>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T,>(path: string) => request<T>('DELETE', path),
};

export const q = (params: Record<string, string>) => '?' + new URLSearchParams(params).toString();
