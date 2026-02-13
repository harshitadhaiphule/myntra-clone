import axios from "axios";
import { getItem } from "./storage";

export const API = axios.create({
  baseURL: "http://localhost:5000",
});

API.interceptors.request.use(async (config) => {
  const storedUser = await getItem("user");
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
