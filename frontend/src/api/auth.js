import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Register
export const registerUser = (data) => API.post("/auth/register", data);

// Login
export const loginUser = (data) => API.post("/auth/login", data);

// Get logged-in user
export const fetchUser = () => API.get("/auth/me");

// Logout
export const logoutUser = () => API.post("/auth/logout");

// Profile Management
export const getProfile = () => API.get("/api/profile");
export const updateProfile = (payload) => API.post("/api/profile", payload);
export const uploadProfilePhoto = (data) => API.post("/api/profile/photo", data);

// Google URL
export const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;