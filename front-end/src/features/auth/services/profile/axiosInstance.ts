import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api/v1",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      // localStorage.clear();
      // window.location.href = "/login";
      console.warn("Auth error (dev mode):", status);
    }

    return Promise.reject(error);
  }
);

export default instance;
