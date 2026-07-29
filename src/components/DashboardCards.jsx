// src/components/DashboardCards.jsx

import React from "react";
import {
  FaUserGraduate,
  FaClipboardCheck,
  FaBookOpen,
  FaChartLine,
  FaMoneyBillWave,
  FaBell,
} from "react-icons/fa";
import "./DashboardCards.css";

const DashboardCards = () => {
  const cards = [
    {
      id: 1,
      title: "Attendance",
      value: "92%",
      icon: <FaClipboardCheck />,
      color: "#4CAF50",
      subtitle: "Overall Attendance",
    },
    {
      id: 2,
      title: "CGPA",
      value: "8.74",
      icon: <FaChartLine />,
      color: "#3F51B5",
      subtitle: "Current Semester",
    },
    {
      id: 3,
      title: "Courses",
      value: "6",
      icon: <FaBookOpen />,
      color: "#FF9800",
      subtitle: "Enrolled Subjects",
    },
    {
      id: 4,
      title: "Fees",
      value: "₹25,000",
      icon: <FaMoneyBillWave />,
      color: "#E91E63",
      subtitle: "Pending Amount",
    },
    {
      id: 5,
      title: "Notifications",
      value: "8",
      icon: <FaBell />,
      color: "#9C27B0",
      subtitle: "Unread Notices",
    },
    {
      id: 6,
      title: "Students",
      value: "1,250",
      icon: <FaUserGraduate />,
      color: "#00BCD4",
      subtitle: "College Strength",
    },
  ];

  return (
    <div className="dashboard-cards">
      {cards.map((card) => (
        <div className="dashboard-card" key={card.id}>
          <div className="card-top">
            <div
              className="card-icon"
              style={{ backgroundColor: card.color }}
            >
              {card.icon}
            </div>

            <div className="card-info">
              <h4>{card.title}</h4>
              <h2>{card.value}</h2>
            </div>
          </div>

          <div className="card-bottom">
            <p>{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;