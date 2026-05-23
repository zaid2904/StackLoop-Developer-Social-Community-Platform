import axios from "axios";

const api = axios.create({
  baseURL:
    // "https://stackloop-developer-community-platform.onrender.com/",
    "http://localhost:3000"
});


// REQUEST INTERCEPTOR
api.interceptors.request.use((req) => {

  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});


// RESPONSE INTERCEPTOR
api.interceptors.response.use(

  // Success
  (response) => response,

  // Error
  (error) => {

    console.error(
      "API Error:",
      error.response?.data?.message || error.message
    );

    // TOKEN EXPIRED / INVALID
    if (error.response?.status === 401) {

      // Remove token
      localStorage.removeItem("token");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;