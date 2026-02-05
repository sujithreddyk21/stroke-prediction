import axios from 'axios';

// 1. Get the Backend URL from .env or use default
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// 2. Create the Axios Instance
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;