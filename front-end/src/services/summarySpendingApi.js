// src/api/summarySpendingApi.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // hoặc nơi bạn lưu token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getSpendingSummary = () => {
    return axiosInstance.get("/api/spending/summary");
};
