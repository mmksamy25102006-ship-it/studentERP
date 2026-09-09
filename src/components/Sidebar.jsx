// src/components/Sidebar.jsx

import React, { useEffect } from "react";
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
  FaChalkboardTeacher,
  FaBuilding,
  FaFileAlt,
  FaChartBar,
} from "react-icons/fa";

import "./Sidebar.css";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  // =====================================================
  // SETTINGS PAGE → SIDEBAR TOGGLE
  // =====================================================

  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setSidebarOpen(event.detail.collapsed === false);
    };

    window.addEventListener(
      "sidebarToggle",
      handleSidebarToggle
    );

    return () => {
      window.removeEventListener(
        "sidebarToggle",
        handleSidebarToggle
      );
    };
  }, [setSidebarOpen]);


  // =====================================================
  // ADMIN MENU
  // =====================================================

  const adminMenuItems = [
    {
      title: "Dashboard",
      icon: <FaHome />,
      path: "/admin-dashboard",
    },
    {
      title: "Students",
      icon: <FaUserGraduate />,
      path: "/adminstudents",
    },
    {
      title: "Faculty",
      icon: <FaChalkboardTeacher />,
      path: "/adminfaculty",
    },
    {
      title: "Departments",
      icon: <FaBuilding />,
      path: "/admin/departments",
    },
    {
      title: "Courses",
      icon: <FaBook />,
      path: "/admincourses",
    },
    {
      title: "Examinations",
      icon: <FaClipboardCheck />,
      path: "/adminexams",
    },
    {
      title: "Results",
      icon: <FaChartBar />,
      path: "/admin/results",
    },
    {
      title: "Fees",
      icon: <FaMoneyBillWave />,
      path: "/admin/fees",
    },
    {
      title: "Reports",
      icon: <FaFileAlt />,
      path: "/adminreports",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];


  // =====================================================
  // FACULTY MENU
  // =====================================================

  const facultyMenuItems = [
    {
      title: "Dashboard",
      icon: <FaHome />,
      path: "/faculty-dashboard",
    },
    {
      title: "My Classes",
      icon: <FaChalkboardTeacher />,
      path: "/faculty/classes",
    },
    {
      title: "Attendance",
      icon: <FaClipboardCheck />,
      path: "/faculty/attendance",
    },
    {
      title: "Marks",
      icon: <FaChartLine />,
      path: "/faculty/marks",
    },
    {
      title: "Assignments",
      icon: <FaFileAlt />,
      path: "/faculty/assignments",
    },
    {
      title: "Timetable",
      icon: <FaCalendarAlt />,
      path: "/faculty/timetable",
    },
    {
      title: "Notices",
      icon: <FaBullhorn />,
      path: "/faculty/notices",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];


  // =====================================================
  // STUDENT MENU
  // =====================================================

  const studentMenuItems = [
    {
      title: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard",
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
      title: "Assignments",
      icon: <FaFileAlt />,
      path: "/assignments",
    },
    {
      title: "Timetable",
      icon: <FaCalendarAlt />,
      path: "/studenttimetable",
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


  // =====================================================
  // SELECT MENU BASED ON ROLE
  // =====================================================

  const menuItems =
    user?.role === "admin"
      ? adminMenuItems
      : user?.role === "faculty"
      ? facultyMenuItems
      : studentMenuItems;


  // =====================================================
  // SIDEBAR
  // =====================================================

  return (
    <aside
      className={
        sidebarOpen
          ? "sidebar open"
          : "sidebar collapsed"
      }
    >

      {/* =================================================
          LOGO
      ================================================= */}

      <div className="sidebar-logo">

      <div className="sidebar-logo-icon">
        <FaUserGraduate />
      </div>
        {sidebarOpen ? (
          <div>
            <h2>NEXUS ERP</h2>
            <span>AI College Assistant</span>
          </div>
        ) : (
          <div className="collapsed-logo">
            N
          </div>
        )}

      </div>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="sidebar-menu">

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >

            <span className="menu-icon">
              {item.icon}
            </span>

            {sidebarOpen && (
              <span className="menu-title">
                {item.title}
              </span>
            )}

          </NavLink>

        ))}

      </nav>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="sidebar-footer">

        <button
          type="button"
          className="collapse-btn"
          onClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
          title={
            sidebarOpen
              ? "Collapse Sidebar"
              : "Expand Sidebar"
          }
        >

          {sidebarOpen ? (
            <FaChevronLeft />
          ) : (
            <FaChevronRight />
          )}

        </button>

      </div>

    </aside>
  );
};

export default Sidebar;