const DEFAULT_API_BASE = 'https://workspaceapi-server-production-476e.up.railway.app';

/** Backend API origin (no trailing slash). Override with VITE_API_URL at build time. */
export function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (env?.trim()) return env.replace(/\/$/, '');
  return DEFAULT_API_BASE;
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
