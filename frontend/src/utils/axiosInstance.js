import axios from "axios";
import { BACKEND_BASE_URL } from "./constants";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development" ? `${BACKEND_BASE_URL}/api` : "/api",
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export default axiosInstance;
