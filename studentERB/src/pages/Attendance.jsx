// src/pages/Attendance.jsx

import React, { useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import "./Attendance.css";

const Attendance = () => {
  const [attendance] = useState([
    {
      subject: "Database Management System",
      attended: 42,
      total: 45,
    },
    {
      subject: "Operating System",
      attended: 39,
      total: 45,
    },
    {
      subject: "Computer Networks",
      attended: 41,
      total: 45,
    },
    {
      subject: "Java Programming",
      attended: 43,
      total: 45,
    },
    {
      subject: "Software Engineering",
      attended: 40,
      total: 45,
    },
    {
      subject: "Artificial Intelligence",
      attended: 38,
      total: 45,
    },
  ]);

  const percentage = (attended, total) =>
    ((attended / total) * 100).toFixed(1);

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <h1>
          <FaCalendarAlt /> Attendance Report
        </h1>
        <p>Semester Attendance Details</p>
      </div>

      <div className="attendance-summary">
        <div className="summary-card">
          <h2>Overall Attendance</h2>
          <h1>92%</h1>
        </div>

        <div className="summary-card">
          <h2>Total Classes</h2>
          <h1>270</h1>
        </div>

        <div className="summary-card">
          <h2>Classes Attended</h2>
          <h1>248</h1>
        </div>
      </div>

      <div className="attendance-table-card">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Attended</th>
              <th>Total</th>
              <th>%</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((item, index) => (
              <tr key={index}>
                <td>{item.subject}</td>
                <td>{item.attended}</td>
                <td>{item.total}</td>
                <td>{percentage(item.attended, item.total)}%</td>

                <td>
                  {percentage(item.attended, item.total) >= 75 ? (
                    <span className="present">
                      <FaCheckCircle /> Eligible
                    </span>
                  ) : (
                    <span className="absent">
                      <FaTimesCircle /> Shortage
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;