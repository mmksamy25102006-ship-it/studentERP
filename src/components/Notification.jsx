import { useEffect, useState } from "react";
import axios from "axios";
import "./Notification.css";

function StudentNotification() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await axios.get(
        "https://studenterp-5wuj.onrender.com/api/notifications"
      );

      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  return (
    <div className="student-notification">

      {/* =========================
          HEADER
      ========================= */}
      <div className="notification-header">
        <h2>Notice Board</h2>

        <p>
          Latest announcements, events, circulars & updates
        </p>
      </div>

      {/* =========================
          NOTIFICATION LIST
      ========================= */}
      <div className="notification-list">

        {notifications.map((item) => (
          <div
            className="notice-card"
            key={item._id}
          >

            {/* =========================
                ICON
            ========================= */}
            <div className="notice-icon">
              <span>🔔</span>
            </div>

            {/* =========================
                CONTENT
            ========================= */}
            <div className="notice-content">

              <h3>
                {item.title}
              </h3>

              <small>
                {new Date(item.createdAt).toLocaleString()}
              </small>

              <p>
                {item.message}
              </p>

            </div>

            {/* =========================
                BADGE
            ========================= */}
            <div className="notice-badge">
              <span>Notice</span>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default StudentNotification;
