// src/main.jsx

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";

import App from "./App";
import { handleAuthFailure } from "./api";

import "./index.css";

// =====================================================
// GLOBAL AUTH HEADER
//
// Several pages call the API with the default axios
// instance instead of the shared API client in
// src/api.js. Attaching the token here means those
// calls are authenticated too, so the backend can
// require a login on every route.
// =====================================================

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Mirrors the 401 handler in src/api.js for the calls
// made with the default axios instance.
axios.interceptors.response.use(
  (response) => response,
  handleAuthFailure
);


ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <App />
  </StrictMode>
);
