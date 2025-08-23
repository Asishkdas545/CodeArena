import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://codearena-yfc7.onrender.com",
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
