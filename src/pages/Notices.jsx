import React, { useEffect, useState } from "react";
import {
  FaBullhorn,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";
import axios from "axios";
import "./Notices.css";

const Notices = () => {
  const [search, setSearch] = useState("");
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        "https://studenterp-5wuj.onrender.com/api/notifications"
      );

      setNotices(res.data);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(search.toLowerCase()) ||
      (notice.department || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="notices-page">

      <div className="notice-header">
        <h1>
          <FaBullhorn /> College Notices
        </h1>
        <p>Latest announcements and circulars</p>
      </div>

      <div className="search-box">
        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search notices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="notice-list">

        {loading ? (
          <div className="no-notice">Loading...</div>
        ) : filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div className="notice-card" key={notice._id}>

              <div className="notice-top">
                <h2>{notice.title}</h2>

                <span>
                  {notice.department || "General"}
                </span>
              </div>

              <p className="notice-date">
                <FaCalendarAlt />{" "}
                {new Date(
                  notice.createdAt
                ).toLocaleDateString()}
              </p>

              <p className="notice-description">
                {notice.message}
              </p>

            </div>
          ))
        ) : (
          <div className="no-notice">
            No notices found.
          </div>
        )}

      </div>

    </div>
  );
};

export default Notices;
