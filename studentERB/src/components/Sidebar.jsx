// src/components/Sidebar.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaHome,
  FaUserGraduate,
  FaClipboardCheck,
  FaChartLine,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaBook,
  FaBullhorn,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import "./Sidebar.css";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {

  const { user } = useAuth();
const dashboardPath =
  user?.role === "admin"
    ? "/admin-dashboard"
    : user?.role === "faculty"
    ? "/faculty-dashboard"
    : "/dashboard";

  const menuItems = [
    {
      title: "Dashboard",
      icon: <FaHome />,
      path: dashboardPath,
    },
    {
      title: "Attendance",
      icon: <FaClipboardCheck />,
      path: "/attendance",
    },
    {
      title: "Marks & GPA",
      icon: <FaChartLine />,
      path: "/marks",
    },
    {
      title: "Timetable",
      icon: <FaCalendarAlt />,
      path: "/timetable",
    },
    {
      title: "Fees",
      icon: <FaMoneyBillWave />,
      path: "/fees",
    },
    {
      title: "Library",
      icon: <FaBook />,
      path: "/library",
    },
    {
      title: "Notices",
      icon: <FaBullhorn />,
      path: "/notices",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];

  return (
    <aside className={sidebarOpen ? "sidebar open" : "sidebar collapsed"}>
      {/* Logo */}
      <div className="sidebar-logo">
        <FaUserGraduate className="logo-icon" />

        {sidebarOpen && (
          <div>
            <h2>NEXUS ERP</h2>
            <span>AI College Assistant</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <span className="menu-icon">{item.icon}</span>

            {sidebarOpen && (
              <span className="menu-title">{item.title}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="collapse-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;