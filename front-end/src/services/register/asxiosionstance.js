import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/E-Wallet",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
