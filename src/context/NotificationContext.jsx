import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import { useNotificationPreferences } from "./NotificationPreferencesContext";

import API from "./../api";


// ========================================
// CREATE CONTEXT
// ========================================

const NotificationContext = createContext();


// ========================================
// API URL
// ========================================

const API_URL = "https://studenterp-5wuj.onrender.com/api/notifications";


// ========================================
// PROVIDER
// ========================================

export const NotificationProvider = ({ children }) => {

  const { isAuthenticated } = useAuth();

  /*
  ========================================
  NOTIFICATION PREFERENCES

  The Settings > Notifications manager writes these.
  "notificationsEnabled" used to be the only flag and
  nothing ever read it back, so the master switch is now
  taken from the preferences store.
  ========================================
  */

  const { preferences, notify } =
    useNotificationPreferences();

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  /*
  Ids already alerted, so the 30 second poll returning the
  same unread notice does not fire another alert on every
  tick.
  */

  const alertedIdsRef = useRef(new Set());


  // ========================================
  // FETCH NOTIFICATIONS FROM MONGODB
  // ========================================

  const fetchNotifications = async () => {

    try {

      const response = await API.get("/notifications");

      setNotifications(response.data);

      /*
      Raise alerts for anything unread that has not been
      announced yet. `notify` applies the channel, sound
      and category rules from Settings.
      */

      const fresh = (Array.isArray(response.data)
        ? response.data
        : []
      ).filter((item) => {
        if (item.read !== false) {
          return false;
        }

        if (alertedIdsRef.current.has(item._id)) {
          return false;
        }

        alertedIdsRef.current.add(item._id);

        return true;
      });

      if (fresh.length > 0) {
        notify(fresh);
      }

    } catch (error) {

      // A 401 before login (the login page has no token)
      // is expected and not something to log. Everything
      // else is a real failure.
      if (error.response?.status !== 401) {
        console.error(
          "Failed to fetch notifications:",
          error
        );
      }

    } finally {

      setLoading(false);

    }

  };


  // ========================================
  // INITIAL LOAD + AUTOMATIC REFRESH
  // ========================================

  useEffect(() => {

    // The provider wraps the login page, which has no
    // token, so the notifications endpoint would answer
    // 401 and spam the console every 30 seconds. Only
    // poll while someone is signed in.
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    // The master switch in Settings > Notifications.
    // While it is off, hold no data and stop polling so
    // the app is not hitting the endpoint for something
    // the user muted.
    if (!preferences.enabled) {
      setNotifications([]);
      setLoading(false);

      alertedIdsRef.current.clear();

      return;
    }

    // Fetch immediately
    fetchNotifications();


    // Check for new notifications every 30 seconds
    const interval = setInterval(() => {

      fetchNotifications();

    }, 30000);


    // Cleanup interval
    return () => clearInterval(interval);

  }, [isAuthenticated, preferences.enabled, notify]);


  // ========================================
  // ADD NOTIFICATION
  // ========================================

  const addNotification = async (notification) => {

    try {

      const response = await API.post(
        "/notifications",
        {
          ...notification,
          read: false,
        }
      );


      // Add new notification to the top
      setNotifications((prev) => [
        response.data,
        ...prev,
      ]);


    } catch (error) {

      console.error(
        "Failed to add notification:",
        error
      );

    }

  };


  // ========================================
  // MARK ONE NOTIFICATION AS READ
  // ========================================

  const markAsRead = async (id) => {

    try {

      const response = await API.put(
        `/notifications/${id}/read`
      );


      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? response.data
            : item
        )
      );


    } catch (error) {

      console.error(
        "Failed to mark notification as read:",
        error
      );

    }

  };


  // ========================================
  // MARK ALL NOTIFICATIONS AS READ
  // ========================================

  const markAllAsRead = async () => {

    try {

      await API.put(
        "/notifications/read-all"
      );


      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          read: true,
        }))
      );


    } catch (error) {

      console.error(
        "Failed to mark all notifications as read:",
        error
      );

    }

  };


  // ========================================
  // REMOVE NOTIFICATION
  // ========================================

  const removeNotification = (id) => {

    setNotifications((prev) =>
      prev.filter(
        (item) => item._id !== id
      )
    );

  };


  // ========================================
  // CLEAR ALL NOTIFICATIONS
  // ========================================

  const clearNotifications = () => {

    setNotifications([]);

  };


  // ========================================
  // UNREAD COUNT
  // ========================================

  const unreadCount = notifications.filter(
    (item) => item.read === false
  ).length;


  // ========================================
  // PROVIDER
  // ========================================

  return (

    <NotificationContext.Provider
      value={{

        notifications,

        loading,

        addNotification,

        markAsRead,

        markAllAsRead,

        removeNotification,

        clearNotifications,

        unreadCount,

        fetchNotifications,

      }}
    >

      {children}

    </NotificationContext.Provider>

  );

};


export default NotificationContext;
