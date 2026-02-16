const PLACEHOLDER = '__API_PUBLIC_URL__';
const DEFAULT_API_URL = 'http://localhost:3011/api';

function getApiUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  const w = window as unknown as { __ENV__?: { API_PUBLIC_URL?: string }; __API_URL__?: string };
  const fromEnv = w.__ENV__?.API_PUBLIC_URL;
  if (fromEnv && fromEnv !== PLACEHOLDER) return fromEnv;
  if (w.__API_URL__) return w.__API_URL__;
  return DEFAULT_API_URL;
}

export const API_URL = getApiUrl();
