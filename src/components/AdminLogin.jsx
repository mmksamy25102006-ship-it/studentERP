import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import axios from "axios";

import { useAuth } from "../context/AuthContext";

import "./Login.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: formData.email,
        password: formData.password,
        role: "admin",
      };

      console.log("Admin login payload:", { email: payload.email, role: payload.role });

      const response = await axios.post(
        "https://studenterp-5wuj.onrender.com/api/auth/login",
        payload
      );

      const { token, user } = response.data;

      login(user, token);

      setFormData({
        email: "",
        password: "",
      });

      setShowPassword(false);

      alert("Login Successful");

      navigate("/admin-dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-bg-grid"></div>
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      <div className="login-card">

        <div className="login-header">

          <div className="nexus-logo">

            <div className="logo-ring logo-ring-one"></div>

            <div className="logo-ring logo-ring-two"></div>

            <div className="logo-center"></div>

          </div>

          <h1>
            student<span>ERB</span>
          </h1>

          <p>
            ADMIN PORTAL
            <br />
            BRIGHT HORIZON INSTITUTE OF TECHNOLOGY
          </p>

        </div>

        <form onSubmit={handleLogin} className="login-form">

          <div className="form-grouplogin">

            <label>Email Address</label>

            <div className="input-box-login">

              <FaEnvelope className="input-icon" />

              <input
                type="email"
                name="email"
                placeholder="admin@nexus.edu"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />

            </div>

          </div>

          <div className="form-grouplogin">

            <label>Password</label>

            <div className="input-box-login">

              <FaLock className="input-icon" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />

              <span
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>

            </div>

          </div>

          <div className="login-options">

            <label className="remember-me">

              <input type="checkbox" />

              <span>Remember me</span>

            </label>

            <button
              type="button"
              className="forgot-password"
            >
              Forgot Password?
            </button>

          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="login-footer">
          Secure access — Admin Management Portal
        </div>

        <div className="copyright">
          © 2026 NEXUS ERP
        </div>

      </div>

    </div>
  );
};

export default AdminLogin;

