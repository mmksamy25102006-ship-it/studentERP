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
  FaUserTie,
  FaFileSignature,
  FaUserCog,
  FaClipboardList,
  FaHourglassHalf,
  FaUniversity,
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
      // Leave approval for staff lives with the principal
      // now, not here. The admin keeps no queue of its own
      // and still reaches /hod/faculty-requests by URL if
      // it has to countersign the principal's own request.
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
      title: "Library",
      icon: <FaBook />,
      path: "/faculty/library",
    },
    {
      title: "My Leave",
      icon: <FaHourglassHalf />,
      path: "/faculty/myleave",
    },
    {
      title: "Approvals",
      icon: <FaFileSignature />,
      path: "/faculty/requests",
    },
    {
      title: "Profile",
      icon: <FaUserTie />,
      path: "/faculty/profile",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];


  // =====================================================
  // HEAD OF DEPARTMENT MENU
  //
  // The HOD is a faculty member first, so the HOD menu
  // starts from the faculty menu and swaps the entries
  // that an HOD does differently.
  // =====================================================

  const hodMenuItems = [
    {
      title: "HOD Dashboard",
      icon: <FaUserCog />,
      path: "/hod-dashboard",
    },
    {
      title: "Faculty Approvals",
      icon: <FaClipboardList />,
      path: "/hod/faculty-requests",
    },
    {
      title: "Student Approvals",
      icon: <FaFileSignature />,
      path: "/hod/student-requests",
    },
    {
      title: "My Department",
      icon: <FaBuilding />,
      path: "/hod/department",
    },
    {
      title: "My Leave",
      icon: <FaHourglassHalf />,
      path: "/faculty/myleave",
    },
    {
      title: "Profile",
      icon: <FaUserTie />,
      path: "/faculty/profile",
    },
    {
      title: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];


  // =====================================================
  // PRINCIPAL MENU
  //
  // The principal is a faculty member with the isPrincipal
  // flag, so the personal pages stay on the /faculty paths
  // they already share. Only the two pages that belong to
  // the office itself are new.
  // =====================================================

  const principalMenuItems = [
    {
      title: "Dashboard",
      icon: <FaUniversity />,
      path: "/principal-dashboard",
    },
    {
      title: "Leave Approvals",
      icon: <FaClipboardList />,
      path: "/principal/leave-approvals",
    },
    {
      title: "Notices",
      icon: <FaBullhorn />,
      path: "/faculty/notices",
    },
    {
      title: "Timetable",
      icon: <FaCalendarAlt />,
      path: "/faculty/timetable",
    },
    {
      title: "My Leave",
      icon: <FaHourglassHalf />,
      path: "/faculty/myleave",
    },
    {
      title: "Library",
      icon: <FaBook />,
      path: "/faculty/library",
    },
    {
      title: "Profile",
      icon: <FaUserTie />,
      path: "/faculty/profile",
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
      title: "Leave & Bonafide",
      icon: <FaFileSignature />,
      path: "/requests",
    },
    {
      title: "Profile",
      icon: <FaUserTie />,
      path: "/profile",
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

  // The role comes first, then the flags refine it. The
  // principal is tested before the HOD because the office
  // outranks a department, and an account may carry both
  // flags at once.
  const menuItems =
    user?.role === "admin"
      ? adminMenuItems
      : user?.role === "faculty"
        ? user?.isPrincipal
          ? principalMenuItems
          : user?.isHod
            ? hodMenuItems
            : facultyMenuItems
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
