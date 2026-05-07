export const API_BASE_URL =
  (typeof window !== "undefined" && window._env_?.REACT_APP_API_URL) ||
  "https://loancollectionmanagement-production.up.railway.app";

export const getToken = () => localStorage.getItem("auth_token");

export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    window.location.replace("/login");
    throw new Error("Session expired");
  }
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.json();
};
