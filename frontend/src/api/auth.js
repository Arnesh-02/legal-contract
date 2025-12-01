import API from "./axios";

export const loginUser = (data) => API.post("/auth/login", data);
export const fetchUser = () => API.get("/auth/me");
export const registerUser = (data) => API.post("/auth/register", data);
export const logoutUser = () => API.post("/auth/logout");

export const getProfile = () => API.get("/api/profile");
export const updateProfile = (data) => API.post("/api/profile", data);
export const uploadProfilePhoto = (data) => API.post("/api/profile/photo", data);

export const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_URL}/auth/google`;
