import axios from "axios";

// Prefer Vite proxy in development so frontend does not break on CORS or Vite port changes.
const envUrl = import.meta.env.VITE_API_URL;
const baseURL = envUrl && envUrl.length > 0 ? envUrl : "/api";

const API = axios.create({
  baseURL,
  timeout: 15000,
});

// Automatically attach token
API.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
