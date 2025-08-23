import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // ⬅ important if backend uses cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// // Optional: attach token automatically
// axiosClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default axiosClient;
