import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaChalkboardTeacher,
  FaUserShield,
  FaEyeSlash,
  FaUserGraduate,
} from "react-icons/fa";

import axios from "axios";

import { useAuth } from "../context/AuthContext";

import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    role: "student",
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

      console.log(formData);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      const { token, user } = response.data;

      // Save through AuthContext
      login(user, token);

      // Clear login form
      setFormData({
        role: "student",
        email: "",
        password: "",
      });

      setShowPassword(false);

      alert("Login Successful");

      // Redirect based on role
      if (user.role === "student") {
        navigate("/dashboard");
      } else if (user.role === "faculty") {
        navigate("/faculty-dashboard");
      } else if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
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

      {/* Background Effects */}
      <div className="login-bg-grid"></div>
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      {/* Login Card */}
      <div className="login-card">

        {/* Logo */}
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
            AI STUDENT ASSISTANT · BRIGHT HORIZON
            <br />
            INSTITUTE OF TECHNOLOGY
          </p>

        </div>

        {/* Role Selector */}
        <div className="role-selector">

          <button
            type="button"
            className={`role-btn ${
              formData.role === "student" ? "active" : ""
            }`}
            onClick={() =>
              setFormData({
                ...formData,
                role: "student",
              })
            }
          >
            <FaUserGraduate />
            <span>Student</span>
          </button>

          <button
            type="button"
            className={`role-btn ${
              formData.role === "faculty" ? "active" : ""
            }`}
            onClick={() =>
              setFormData({
                ...formData,
                role: "faculty",
              })
            }
          >
            {/* <span className="role-icon">♟</span> */}
            <FaChalkboardTeacher />
            <span>Faculty</span>
          </button>

          <button
            type="button"
            className={`role-btn ${
              formData.role === "admin" ? "active" : ""
            }`}
            onClick={() =>
              setFormData({
                ...formData,
                role: "admin",
              })
            }
          >
            {/* <span className="role-icon">♟</span> */}
            <FaUserShield />
            <span>Admin</span>
          </button>

        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">

          {/* Email */}
          <div className="form-grouplogin">

            <label>Email Address</label>

            <div className="input-box-login">

              <FaEnvelope className="input-icon" />

              <input
                type="email"
                name="email"
                placeholder="you@nexus.edu"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />

            </div>

          </div>

          {/* Password */}
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

          {/* Remember + Forgot */}
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

          {/* Login Button */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Footer */}
        <div className="login-footer">
          Secure access — StudentERB Management System
        </div>

        <div className="copyright">
          © 2026 NEXUS ERP
        </div>

      </div>

    </div>
  );
};

export default Login;