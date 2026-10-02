import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

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

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);


  // ========================================
  // FETCH NOTIFICATIONS FROM MONGODB
  // ========================================

  const fetchNotifications = async () => {

    try {

      const response = await API.get("/notifications");

      setNotifications(response.data);

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

    // Fetch immediately
    fetchNotifications();


    // Check for new notifications every 30 seconds
    const interval = setInterval(() => {

      fetchNotifications();

    }, 30000);


    // Cleanup interval
    return () => clearInterval(interval);

  }, [isAuthenticated]);


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
