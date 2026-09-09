import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaMoon,
  FaSun,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCompress,
  FaIdCard,
  FaBell,
  FaSignOutAlt,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import "./Settings.css";


// =====================================================
// SETTINGS PAGE
// =====================================================

const Settings = ({
  sidebarOpen,
  setSidebarOpen,
}) => {

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const {
    theme,
    toggleTheme,
  } = useTheme();


  // =====================================================
  // OTHER STATES
  // =====================================================

  const [fullscreen, setFullscreen] =
    useState(false);

  const [showIdCard, setShowIdCard] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] =
    useState(
      localStorage.getItem(
        "notificationsEnabled"
      ) !== "false"
    );


  // =====================================================
  // SIDEBAR TOGGLE
  // =====================================================

  const handleSidebarToggle = () => {

    setSidebarOpen((prev) => {

      const newState = !prev;

      // Save sidebar state
      localStorage.setItem(
        "sidebarCollapsed",
        String(!newState)
      );

      return newState;

    });

  };


  // =====================================================
  // FULLSCREEN
  // =====================================================

  const handleFullscreen = async () => {

    try {

      if (!document.fullscreenElement) {

        await document.documentElement.requestFullscreen();

        setFullscreen(true);

      } else {

        await document.exitFullscreen();

        setFullscreen(false);

      }

    } catch (error) {

      console.error(
        "Fullscreen error:",
        error
      );

    }

  };


  // =====================================================
  // FULLSCREEN CHANGE LISTENER
  // =====================================================

  useEffect(() => {

    const handleFullscreenChange = () => {

      setFullscreen(
        !!document.fullscreenElement
      );

    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

    };

  }, []);


  // =====================================================
  // NOTIFICATION TOGGLE
  // =====================================================

  const handleNotificationToggle = () => {

    const newValue = !notifications;

    setNotifications(newValue);

    localStorage.setItem(
      "notificationsEnabled",
      String(newValue)
    );

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    const confirmLogout =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmLogout) {
      return;
    }

    logout();

    navigate("/", {
      replace: true,
    });

  };


  // =====================================================
  // USER ROLE
  // =====================================================

  const getRoleName = () => {

    if (!user?.role) {
      return "Student";
    }

    return (
      user.role.charAt(0).toUpperCase() +
      user.role.slice(1)
    );

  };


  // =====================================================
  // USER INITIALS
  // =====================================================

  const getInitials = () => {

    if (!user?.name) {
      return "U";
    }

    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="settings-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="settings-header">

        <h1>
          Settings
        </h1>

        <p>
          Personalize your NEXUS ERP experience
        </p>

      </div>


      {/* =================================================
          SETTINGS GRID
      ================================================= */}

      <div className="settings-grid">


        {/* =================================================
            APPEARANCE
        ================================================= */}

        <div className="settings-card appearance-card">

          <h2>
            Appearance
          </h2>


          {/* =================================================
              THEME
          ================================================= */}

          <div className="setting-row">

            <div className="setting-info">

              <h3>
                Theme
              </h3>

              <p>
                Switch between dark and light interface
              </p>

            </div>


            <button
              type="button"
              className="setting-btn"
              onClick={toggleTheme}
            >

              {theme === "dark" ? (
                <FaMoon />
              ) : (
                <FaSun />
              )}

              <span>
                Toggle
              </span>

            </button>

          </div>


          {/* =================================================
              SIDEBAR
          ================================================= */}

          <div className="setting-row">

            <div className="setting-info">

              <h3>
                Sidebar
              </h3>

              <p>
                {sidebarOpen
                  ? "Collapse sidebar to icons only"
                  : "Expand sidebar navigation"}
              </p>

            </div>


            <button
              type="button"
              className="setting-btn"
              onClick={handleSidebarToggle}
              title={
                sidebarOpen
                  ? "Collapse Sidebar"
                  : "Expand Sidebar"
              }
            >

              {sidebarOpen ? (
                <FaChevronLeft />
              ) : (
                <FaChevronRight />
              )}

              <span>
                Toggle
              </span>

            </button>

          </div>


          {/* =================================================
              FULLSCREEN
          ================================================= */}

          <div className="setting-row">

            <div className="setting-info">

              <h3>
                Fullscreen
              </h3>

              <p>
                Distraction-free full screen mode
              </p>

            </div>


            <button
              type="button"
              className="setting-btn"
              onClick={handleFullscreen}
              title={
                fullscreen
                  ? "Exit Fullscreen"
                  : "Enter Fullscreen"
              }
            >

              {fullscreen ? (
                <FaCompress />
              ) : (
                <FaExpand />
              )}

              <span>
                Toggle
              </span>

            </button>

          </div>

        </div>


        {/* =================================================
            ACCOUNT
        ================================================= */}

        <div className="settings-card account-card">

          <h2>
            Account
          </h2>


          {/* =================================================
              DIGITAL ID
          ================================================= */}

          <div className="setting-row">

            <div className="setting-info">

              <h3>
                Digital ID Card
              </h3>

              <p>
                View your QR-enabled student ID
              </p>

            </div>


            <button
              type="button"
              className="setting-btn"
              onClick={() =>
                setShowIdCard(true)
              }
            >

              <FaIdCard />

              <span>
                Open
              </span>

            </button>

          </div>


          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <div className="setting-row">

            <div className="setting-info">

              <h3>
                Notifications
              </h3>

              <p>
                Manage alert preferences
              </p>

            </div>


            <button
              type="button"
              className="setting-btn"
              onClick={() =>
                setShowNotifications(true)
              }
            >

              <FaBell />

              <span>
                Manage
              </span>

            </button>

          </div>


          {/* =================================================
              LOGOUT
          ================================================= */}

          <div className="setting-row logout-row">

            <div className="setting-info">

              <h3>
                Logout
              </h3>

              <p>
                Sign out of your account
              </p>

            </div>


            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >

              <FaSignOutAlt />

              <span>
                Logout
              </span>

            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          DIGITAL ID MODAL
      ===================================================== */}

      {showIdCard && (

        <div
          className="settings-modal-overlay"
          onClick={() =>
            setShowIdCard(false)
          }
        >

          <div
            className="digital-id-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* Close */}

            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setShowIdCard(false)
              }
            >

              <FaTimes />

            </button>


            {/* ID Header */}

            <div className="id-header">

              <div className="id-logo">
                N
              </div>

              <div>

                <h2>
                  NEXUS ERP
                </h2>

                <p>
                  Digital Identity Card
                </p>

              </div>

            </div>


            {/* Avatar */}

            <div className="id-avatar">

              {getInitials()}

            </div>


            {/* Name */}

            <h3 className="id-name">

              {user?.name || "User"}

            </h3>


            {/* Role */}

            <span className="id-role">

              {getRoleName()}

            </span>


            {/* Details */}

            <div className="id-details">

              <div>

                <span>
                  ID
                </span>

                <strong>
                  {user?.id || "N/A"}
                </strong>

              </div>


              <div>

                <span>
                  Email
                </span>

                <strong>
                  {user?.email || "N/A"}
                </strong>

              </div>

            </div>


            {/* QR */}

            <div className="fake-qr">

              <div className="qr-pattern">
                NEXUS
              </div>

              <small>
                Scan to verify identity
              </small>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          NOTIFICATION MODAL
      ===================================================== */}

      {showNotifications && (

        <div
          className="settings-modal-overlay"
          onClick={() =>
            setShowNotifications(false)
          }
        >

          <div
            className="notification-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* Close */}

            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setShowNotifications(false)
              }
            >

              <FaTimes />

            </button>


            {/* Title */}

            <div className="modal-title">

              <FaBell />

              <div>

                <h2>
                  Notifications
                </h2>

                <p>
                  Manage your notification preferences
                </p>

              </div>

            </div>


            {/* Notification Option */}

            <div className="notification-option">

              <div>

                <h3>
                  Enable Notifications
                </h3>

                <p>
                  Receive important ERP alerts and updates
                </p>

              </div>


              <button
                type="button"
                className={`switch ${
                  notifications
                    ? "active"
                    : ""
                }`}
                onClick={
                  handleNotificationToggle
                }
              >

                <span></span>

              </button>

            </div>


            {/* Status */}

            <div className="notification-status">

              {notifications ? (
                <>
                  <FaCheck />

                  Notifications are enabled
                </>
              ) : (
                <>
                  <FaTimes />

                  Notifications are disabled
                </>
              )}

            </div>


            {/* Done */}

            <button
              type="button"
              className="modal-done-btn"
              onClick={() =>
                setShowNotifications(false)
              }
            >
              Done
            </button>

          </div>

        </div>

      )}

    </div>

  );
};

export default Settings;
