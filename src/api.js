// src/api.js

import axios from "axios";

const API = axios.create({
  baseURL: "https://studenterp-5wuj.onrender.com/api",
});

// Automatically attach JWT token to every API request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// An expired or revoked token comes back as 401. Clear the
// saved session and send the user back to the login page
// instead of leaving them stuck on empty data.
//
// The router uses basename="/studentERP", and Login is
// mounted at "/", so that is the URL to return to.
const LOGIN_PATH = "/studentERP/";

const handleAuthFailure = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("studentId");
    localStorage.removeItem("facultyId");

    const path = window.location.pathname;

    const alreadyOnLogin =
      path === LOGIN_PATH ||
      path === "/studentERP" ||
      path.includes("admin-login");

    if (!alreadyOnLogin) {
      window.location.href = LOGIN_PATH;
    }
  }

  return Promise.reject(error);
};

API.interceptors.response.use(
  (response) => response,
  handleAuthFailure
);

// Shared with src/main.jsx so the default axios instance
// gets the same 401 behaviour as this client.
export { handleAuthFailure };

export default API;
