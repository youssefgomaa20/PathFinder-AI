export const AUTH_TOKEN_KEY = "pathfinder_token";
export const AUTH_USER_KEY = "pathfinder_user";
export const AUTH_SESSION_UID_KEY = "pathfinder_uid";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  birthDate?: string | null;
  university?: string | null;
  education?: string | null;
  experienceLevel?: string | null;
  careerGoal?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  skills?: string[];
  cvUrl?: string | null;
  photoUrl?: string | null;
  level?: string | null;
  specialization?: string | null;
  graduationYear?: string | null;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSessionUid(uid: string | null): void {
  if (typeof window === "undefined") return;
  if (!uid) localStorage.removeItem(AUTH_SESSION_UID_KEY);
  else localStorage.setItem(AUTH_SESSION_UID_KEY, uid);
}

export function getSessionUid(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_SESSION_UID_KEY);
}

/**
 * Per-user local storage key.
 * Prefer Firebase UID when available; otherwise fall back to backend user id.
 */
export function getUserScopedKey(userIdOrUid?: string | null): string | null {
  const uid = userIdOrUid ?? getSessionUid() ?? getStoredUser()?.id ?? null;
  if (!uid) return null;
  return `pathfinder_user_${uid}`;
}

export type UserScopedData = {
  profileImage?: string;
};

export function getUserScopedData(userIdOrUid?: string | null): UserScopedData | null {
  if (typeof window === "undefined") return null;
  const key = getUserScopedKey(userIdOrUid);
  if (!key) return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserScopedData;
  } catch {
    return null;
  }
}

export function setUserScopedData(patch: UserScopedData, userIdOrUid?: string | null): void {
  if (typeof window === "undefined") return;
  const key = getUserScopedKey(userIdOrUid);
  if (!key) return;
  const prev = getUserScopedData(userIdOrUid) ?? {};
  const next = { ...prev, ...patch };
  localStorage.setItem(key, JSON.stringify(next));
}

export function setAuthSession(token: string, user: AuthUser): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  if (import.meta.env.DEV) console.log("[auth] setAuthSession", { userId: user.id, email: user.email });
  window.dispatchEvent(new Event("pathfinder-auth-changed"));
}

/** Update cached user after profile changes while keeping the same JWT. */
export function updateStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  if (!getToken()) return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("pathfinder-auth-changed"));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_SESSION_UID_KEY);
  if (import.meta.env.DEV) console.log("[auth] clearAuthSession");
  window.dispatchEvent(new Event("pathfinder-auth-changed"));
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function readApiErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const data = JSON.parse(text) as { message?: string; details?: string };
    if (typeof data.message === "string") return data.message;
    if (typeof data.details === "string") return data.details;
  } catch {
    /* ignore */
  }
  const trimmed = text.trim();
  if (trimmed) return trimmed.slice(0, 500);
  return `Request failed (${res.status})`;
}
