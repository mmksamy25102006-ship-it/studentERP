import React, { useState } from "react";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./Exams.css";

const Exams = () => {
  const [exams] = useState([
    {
      id: 1,
      subject: "Database Management System",
      date: "10 Dec 2026",
      time: "09:00 AM - 12:00 PM",
      room: "Hall A1",
      status: "Upcoming",
    },
    {
      id: 2,
      subject: "Operating System",
      date: "12 Dec 2026",
      time: "09:00 AM - 12:00 PM",
      room: "Hall A2",
      status: "Upcoming",
    },
    {
      id: 3,
      subject: "Computer Networks",
      date: "15 Dec 2026",
      time: "01:00 PM - 04:00 PM",
      room: "Hall B1",
      status: "Upcoming",
    },
    {
      id: 4,
      subject: "Java Programming",
      date: "18 Dec 2026",
      time: "09:00 AM - 12:00 PM",
      room: "Lab-1",
      status: "Upcoming",
    },
    {
      id: 5,
      subject: "Artificial Intelligence",
      date: "20 Dec 2026",
      time: "01:00 PM - 04:00 PM",
      room: "Hall C1",
      status: "Upcoming",
    },
  ]);

  return (
    <div className="exams-page">
      <div className="page-header">
        <h1>
          <FaBookOpen /> Examination Schedule
        </h1>
        <p>Semester End Examination Timetable</p>
      </div>

      <div className="exam-grid">
        {exams.map((exam) => (
          <div className="exam-card" key={exam.id}>
            <div className="exam-top">
              <h2>{exam.subject}</h2>

              <span className="status">
                {exam.status}
              </span>
            </div>

            <div className="exam-info">
              <p>
                <FaCalendarAlt />
                {exam.date}
              </p>

              <p>
                <FaClock />
                {exam.time}
              </p>

              <p>
                <FaMapMarkerAlt />
                {exam.room}
              </p>
            </div>

            <button className="exam-btn">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Exams;