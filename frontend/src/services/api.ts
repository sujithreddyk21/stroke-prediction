import axios from "axios";

// 1. Get the Backend URL from .env or use default
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://stroke-prediction-1-orxd.onrender.com";

// 2. Create the Axios Instance (RECOMMENDED SETTINGS FOR RENDER)
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,   // ✅ IMPORTANT for Render
  timeout: 20000,            // ✅ 20 seconds (Render can be slow)
});

export default api;
