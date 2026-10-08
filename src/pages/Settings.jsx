import { useEffect, useState } from "react";
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
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import useNotification from "../hooks/useNotification";

import {
  NOTIFICATION_CATEGORIES,
  useNotificationPreferences,
} from "../context/NotificationPreferencesContext";

import DigitalIdCard from "../components/DigitalIdCard";
import NotificationsManager from "../components/NotificationsManager";

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
    darkMode,
    toggleTheme,
  } = useTheme();

  const { unreadCount } = useNotification();

  const { preferences } = useNotificationPreferences();

  const enabledCategoryCount =
    NOTIFICATION_CATEGORIES.filter(
      (category) =>
        preferences.categories[category.key]
    ).length;


  // =====================================================
  // OTHER STATES
  // =====================================================

  const [fullscreen, setFullscreen] =
    useState(false);

  const [showIdCard, setShowIdCard] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);


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
  // CLOSE MODALS ON ESCAPE
  // =====================================================

  useEffect(() => {

    const handleEscape = (event) => {

      if (event.key !== "Escape") {
        return;
      }

      setShowIdCard(false);

      setShowNotifications(false);

    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };

  }, []);


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

              {darkMode ? (
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
                {preferences.enabled
                  ? `Alerting on ${enabledCategoryCount} of ${NOTIFICATION_CATEGORIES.length} areas`
                  : "All alerts are muted"}
              </p>

            </div>


            <button
              type="button"
              className="setting-btn setting-btn-notifications"
              onClick={() =>
                setShowNotifications(true)
              }
            >

              <FaBell />

              <span>
                Manage
              </span>

              {unreadCount > 0 && (
                <b className="setting-btn-badge">
                  {unreadCount}
                </b>
              )}

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

        <DigitalIdCard
          user={user}
          onClose={() =>
            setShowIdCard(false)
          }
        />

      )}


      {/* =====================================================
          NOTIFICATION MANAGER
      ===================================================== */}

      {showNotifications && (

        <NotificationsManager
          onClose={() =>
            setShowNotifications(false)
          }
        />

      )}

    </div>

  );
};

export default Settings;
