import React, { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaMoon,
  FaSun,
  FaBell,
  FaSave,
} from "react-icons/fa";
import "./Settings.css";

const Settings = () => {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    password: "",
  });

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    alert("Settings Saved Successfully!");
  };

  return (
    <div className="settings-page">

      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account preferences</p>
      </div>

      <div className="settings-card">

        <div className="input-group">
          <label>
            <FaUser />
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>
            <FaEnvelope />
            Email
          </label>

          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>
            <FaLock />
            New Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Enter new password"
            value={user.password}
            onChange={handleChange}
          />
        </div>

        <div className="toggle-row">
          <div>
            {darkMode ? <FaMoon /> : <FaSun />}
            <span> Dark Mode</span>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-row">
          <div>
            <FaBell />
            <span> Notifications</span>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() =>
                setNotifications(!notifications)
              }
            />
            <span className="slider"></span>
          </label>
        </div>

        <button
          className="save-btn"
          onClick={handleSave}
        >
          <FaSave />
          Save Settings
        </button>

      </div>

    </div>
  );
};

export default Settings;