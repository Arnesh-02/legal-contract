import API from "./axios";

export const getUserDocuments = () => API.get("/api/documents");
