declare global {
  interface Window {
    __ENV__?: { API_URL?: string };
  }
}

export function getApiUrl(): string {
  if (typeof window !== "undefined" && window.__ENV__?.API_URL) {
    return window.__ENV__.API_URL;
  }
  return process.env.API_URL || "http://localhost:8000/v1";
}

export function getWsUrl(): string {
  return getApiUrl().replace(/^http/, "ws");
}
