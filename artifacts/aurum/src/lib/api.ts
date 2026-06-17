/**
 * Returns the API base URL.
 *
 * - If VITE_API_URL is explicitly set (e.g. in production pointing to a
 *   dedicated API server), that value is used.
 * - Otherwise, we use an empty string so every call becomes a relative path
 *   (e.g. `/api/products`) — Vite's dev-server proxy then forwards it to the
 *   local API server, and Replit's reverse-proxy does the same in production.
 */
export function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (env?.trim()) return env.replace(/\/$/, '');
  return '';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
