import axios from "axios";

export const API_BASE = (process.env.REACT_APP_BACKEND_URL || "") + "/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry && !orig.url.includes("/auth/")) {
      orig._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(orig);
      } catch {
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

export const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export function apiError(err, fallback = "Something went wrong. Please try again.") {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  return String(detail);
}
