import axios from "axios";
import { BACKEND_BASE_URL } from "./constants";

const axiosInstance = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api`,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export default axiosInstance;
