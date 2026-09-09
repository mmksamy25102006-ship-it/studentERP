import React, {
  createContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";


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

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);


  // ========================================
  // FETCH NOTIFICATIONS FROM MONGODB
  // ========================================

  const fetchNotifications = async () => {

    try {

      const response = await axios.get(API_URL);

      setNotifications(response.data);

    } catch (error) {

      console.error(
        "Failed to fetch notifications:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // ========================================
  // INITIAL LOAD + AUTOMATIC REFRESH
  // ========================================

  useEffect(() => {

    // Fetch immediately
    fetchNotifications();


    // Check for new notifications every 30 seconds
    const interval = setInterval(() => {

      fetchNotifications();

    }, 30000);


    // Cleanup interval
    return () => clearInterval(interval);

  }, []);


  // ========================================
  // ADD NOTIFICATION
  // ========================================

  const addNotification = async (notification) => {

    try {

      const response = await axios.post(
        API_URL,
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

      const response = await axios.put(
        `${API_URL}/${id}/read`
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

      await axios.put(
        `${API_URL}/read-all`
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
