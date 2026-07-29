import React, { useState } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import "./Notification.css";

const Notification = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Attendance Updated",
      message: "Your attendance has been updated successfully.",
      time: "10 mins ago",
    },
    {
      id: 2,
      type: "info",
      title: "Exam Schedule",
      message: "Semester exam timetable has been published.",
      time: "1 hour ago",
    },
    {
      id: 3,
      type: "warning",
      title: "Fee Reminder",
      message: "Your semester fee payment is due this week.",
      time: "Yesterday",
    },
  ]);

  const removeNotification = (id) => {
    setNotifications(
      notifications.filter((item) => item.id !== id)
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="success" />;

      case "warning":
        return <FaExclamationCircle className="warning" />;

      default:
        return <FaInfoCircle className="info" />;
    }
  };

  return (
    <div className="notification-card">

      <div className="notification-header">
        <h2>
          <FaBell /> Notifications
        </h2>
      </div>

      <div className="notification-list">

        {notifications.length === 0 ? (
          <div className="empty">
            No Notifications
          </div>
        ) : (
          notifications.map((item) => (
            <div
              className="notification-item"
              key={item.id}
            >
              <div className="notification-icon">
                {getIcon(item.type)}
              </div>

              <div className="notification-content">
                <h4>{item.title}</h4>
                <p>{item.message}</p>
                <span>{item.time}</span>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  removeNotification(item.id)
                }
              >
                <FaTimes />
              </button>
            </div>
          ))
        )}

      </div>

    </div>
  );
};

export default Notification;