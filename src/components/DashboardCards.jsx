// src/components/DashboardCards.jsx

import React from "react";
import {
  FaClipboardCheck,
  FaBookOpen,
  FaChartLine,
  FaMoneyBillWave,
  FaBell,
  FaUserGraduate,
} from "react-icons/fa";
import "./DashboardCards.css";

const DashboardCards = () => {
  const cards = [
    {
      id: 1,
      title: "Attendance",
      value: "92%",
      icon: <FaClipboardCheck />,
      subtitle: "Overall Attendance",
      className: "attendance-card",
    },
    {
      id: 2,
      title: "CGPA",
      value: "8.74",
      icon: <FaChartLine />,
      subtitle: "Current Semester",
      className: "cgpa-card",
    },
    {
      id: 3,
      title: "Courses",
      value: "6",
      icon: <FaBookOpen />,
      subtitle: "Enrolled Subjects",
      className: "courses-card",
    },
    {
      id: 4,
      title: "Fees",
      value: "₹25,000",
      icon: <FaMoneyBillWave />,
      subtitle: "Pending Amount",
      className: "fees-card",
    },
    {
      id: 5,
      title: "Notifications",
      value: "8",
      icon: <FaBell />,
      subtitle: "Unread Notices",
      className: "notification-card",
    },
    {
      id: 6,
      title: "Students",
      value: "1,250",
      icon: <FaUserGraduate />,
      subtitle: "College Strength",
      className: "students-card",
    },
  ];

  return (
    <div className="dashboard-cards">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`dashboard-card ${card.className}`}
        >
          <div className="card-decoration"></div>

          <div className="card-content">

            {/* Card Header */}
            <div className="card-header">
              <div className="card-icon">
                {card.icon}
              </div>

              <div className="card-title">
                {card.title}
              </div>
            </div>

            {/* Main Value */}
            <div className="card-value">
              {card.value}
            </div>

            {/* Footer */}
            <div className="card-footer">
              <span>{card.subtitle}</span>

              <span className="card-arrow">
                →
              </span>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;