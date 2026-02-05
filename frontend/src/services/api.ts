import axios from "axios";

// 1. Get the Backend URL from .env or use default
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://stroke-prediction-1-orxd.onrender.com";

// 2. Create the Axios Instance (RECOMMENDED SETTINGS FOR RENDER)
const api = axios.create({
  baseURL: API_URL.replace(/\/$/, ""), // Remove trailing slash
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // ✅ 15 seconds (Render can be slow)
});

// Log requests for debugging
api.interceptors.request.use((config) => {
  console.log(
    `📡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
  );
  return config;
});

// Log responses for debugging
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.message);
    return Promise.reject(error);
  }
);

export default api;
