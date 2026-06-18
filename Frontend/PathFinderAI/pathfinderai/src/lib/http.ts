import { authHeaders, clearAuthSession, getToken } from "./auth.js";

const API_BASE_URL = (import.meta.env.VITE_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

export const apiUrl = (path: string): string =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Resolve stored media paths to full URLs for display. */
export const resolveMediaUrl = (url: string | undefined | null): string => {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return apiUrl(url.startsWith("/") ? url : `/${url}`);
};

async function logDevResponse(url: string, res: Response): Promise<void> {
  if (!import.meta.env.DEV) return;
  try {
    const text = await res.clone().text();
    const preview = text.length > 4000 ? `${text.slice(0, 4000)}…` : text;
    console.log(`[api] ${res.status} ${url}`, preview || "(empty body)");
  } catch {
    /* ignore */
  }
}

/** Merge JSON headers with Bearer token when logged in. */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const auth = authHeaders() as Record<string, string>;
  for (const [k, v] of Object.entries(auth)) {
    headers.set(k, v);
  }
  let res: Response;
  try {
    res = await fetch(input, { ...init, headers });
  } catch {
    throw new Error("Cannot reach the server. Make sure the backend is running.");
  }
  void logDevResponse(input, res);
  
  if (res.status === 401 && getToken()) {
    clearAuthSession();
    window.location.href = "/login";
  }

  return res;
}
