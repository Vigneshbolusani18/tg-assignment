import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const endpoints = {
  // auth
  register: "/auth/signup",
  login: "/auth/signin",
  refresh: "/auth/refresh",
  logout: "/auth/logout",
  me: "/auth/me",

  // chat
  conversations: "/messages/conversations",   // GET list
  createConversation: "/messages/new",        // POST  ← ADDED
  messages: (id) => `/messages/${id}`,        // GET messages
  send: (id) => `/messages/${id}`,            // POST message

  // meta
  credits: "/credits",
  notifications: "/notifications",
};

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const pickAccess = (data) => data?.access_token ?? data?.accessToken ?? null;

export const setAuthHeader = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

let refreshing;
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config || {};
    if (err?.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (!refreshing) {
          refreshing = axios
            .post(`${API_BASE}${endpoints.refresh}`, {}, { withCredentials: true })
            .finally(() => (refreshing = null));
        }
        const { data } = await refreshing;
        const newToken = pickAccess(data);
        if (!newToken) throw new Error("no_access_token_from_refresh");
        setAuthHeader(newToken);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {}
    }
    throw err;
  }
);

export default api;
