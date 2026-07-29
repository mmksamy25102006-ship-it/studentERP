import React, { useState } from "react";
import {
  FaBullhorn,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";
import "./Notices.css";

const Notices = () => {
  const [search, setSearch] = useState("");

  const [notices] = useState([
    {
      id: 1,
      title: "Semester Examination Schedule",
      date: "20 July 2026",
      category: "Examination",
      description:
        "The End Semester Examination timetable has been published. Students are advised to check the exam portal regularly.",
    },
    {
      id: 2,
      title: "Placement Training Program",
      date: "18 July 2026",
      category: "Placement",
      description:
        "Mandatory placement training begins next Monday in Seminar Hall 2.",
    },
    {
      id: 3,
      title: "Library Book Return",
      date: "15 July 2026",
      category: "Library",
      description:
        "Students must return borrowed books before 30 July to avoid fines.",
    },
    {
      id: 4,
      title: "Holiday Notice",
      date: "12 July 2026",
      category: "General",
      description:
        "The college will remain closed on Friday due to a public holiday.",
    },
    {
      id: 5,
      title: "Internal Assessment",
      date: "10 July 2026",
      category: "Academic",
      description:
        "Internal Assessment II will commence from next week as per the department schedule.",
    },
  ]);

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(search.toLowerCase()) ||
      notice.category.toLowerCase().includes(search.toLowerCase())
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
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <div className="notice-card" key={notice.id}>

              <div className="notice-top">
                <h2>{notice.title}</h2>

                <span>{notice.category}</span>
              </div>

              <p className="notice-date">
                <FaCalendarAlt /> {notice.date}
              </p>

              <p className="notice-description">
                {notice.description}
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