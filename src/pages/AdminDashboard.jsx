import React, { useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaMoneyBillWave,
  FaUniversity,
  FaBell,
  FaFileSignature,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import API from "./../api";

import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [fees, setFees] = useState([]);

  // HOD leave that needs an admin countersignature. An HOD
  // may not approve their own request, so this is the admin's
  // only queue. hodOnly keeps it off ordinary faculty leave,
  // which the department HOD handles.
  const [hodLeavePending, setHodLeavePending] = useState(null);


  /* =========================
        LOAD DATA
  ========================= */

  useEffect(() => {
    const loadData = () => {
      const studentData =
        JSON.parse(localStorage.getItem("students")) || [];

      const facultyData =
        JSON.parse(localStorage.getItem("faculty")) || [];

      const courseData =
        JSON.parse(localStorage.getItem("courses")) || [];

      const feeData =
        JSON.parse(localStorage.getItem("fees")) || [];

      setStudents(studentData);
      setFaculty(facultyData);
      setCourses(courseData);
      setFees(feeData);
    };

    loadData();

    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);


  /* =========================
        HOD LEAVE QUEUE
  ========================= */

  useEffect(() => {
    const loadHodLeave = async () => {
      try {
        // The stats route already reports a pending count,
        // so it needs no status filter. hodOnly scopes it to
        // the HOD leave the admin has to countersign.
        const { data } = await API.get(
          "/faculty-requests/stats",
          { params: { hodOnly: "true" } }
        );

        setHodLeavePending(
          Number(data?.stats?.pending ?? 0)
        );
      } catch {
        // Older backend or network failure. Stay quiet
        // rather than showing a wrong number as fact.
        setHodLeavePending(null);
      }
    };

    loadHodLeave();
  }, []);


  /* =========================
        FEE CALCULATION
  ========================= */

  const totalFees = fees.reduce(
    (sum, item) => sum + Number(item.paidFee || 0),
    0
  );


  /* =========================
        DASHBOARD CARDS
  ========================= */

  const cards = [
    {
      title: "Students",
      value: students.length,
      icon: <FaUserGraduate />,
      className: "students-card",
    },
    {
      title: "Faculty",
      value: faculty.length,
      icon: <FaChalkboardTeacher />,
      className: "faculty-card",
    },
    {
      title: "Courses",
      value: courses.length,
      icon: <FaBook />,
      className: "courses-card",
    },
    {
      title: "Fee Collection",
      value: `₹${totalFees.toLocaleString("en-IN")}`,
      icon: <FaMoneyBillWave />,
      className: "fees-card",
    },
    {
      title: "HOD Leave Pending",
      value:
        hodLeavePending === null
          ? "-"
          : hodLeavePending,
      icon: <FaFileSignature />,
      className: `hod-leave-card ${
        hodLeavePending > 0 ? "hod-leave-pending" : ""
      }`,
      hint: "Needs your approval",
      onClick: () => navigate("/hod/faculty-requests"),
    },
  ];


  /* =========================
        RECENT STUDENTS
  ========================= */

  const recentStudents =
    students.slice(-5).reverse();


  /* =========================
        ANNOUNCEMENTS
  ========================= */

  const notices = [
    "Admissions open for 2026-2027.",
    "Faculty meeting on Friday at 3 PM.",
    "ERP Server Maintenance on Sunday.",
    "Semester Examination starts next month.",
  ];


  return (
    <div className="admin-dashboard">

      {/* =========================
            HEADER
      ========================= */}

      <div className="admin-header">

        <div className="admin-header-content">

          <div className="admin-header-icon">
            <FaUniversity />
          </div>

          <div>
            <h1>Admin Dashboard</h1>

            <p>
              College ERP Management System
            </p>
          </div>

        </div>

        <div className="admin-header-badge">
          Administrator
        </div>

      </div>


      {/* =========================
            STAT CARDS
      ========================= */}

      <div className="dashboard-cards">

        {cards.map((card, index) => (

          <div
            className={`card ${card.className}`}
            key={index}
            onClick={card.onClick}
            role={
              card.onClick ? "button" : undefined
            }
            tabIndex={
              card.onClick ? 0 : undefined
            }
            onKeyDown={
              card.onClick
                ? (event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      card.onClick();
                    }
                  }
                : undefined
            }
          >

            <div className="card-decoration"></div>

            <div className="icon">
              {card.icon}
            </div>

            <div className="card-content">

              <h2>
                {card.value}
              </h2>

              <p>
                {card.title}
              </p>

              {card.hint && (
                <span className="card-hint">
                  {card.hint}
                </span>
              )}

            </div>

          </div>

        ))}

      </div>


      {/* =========================
            MAIN GRID
      ========================= */}

      <div className="dashboard-grid">

        {/* =========================
              RECENT STUDENTS
        ========================= */}

        <div className="table-card">

          <div className="section-heading-admin">

            <div className="section-icon students-heading-admin">
              <FaUserGraduate />
            </div>

            <div>
              <h2>Recent Students</h2>

              <p>
                Recently added students
              </p>
            </div>

          </div>


          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Register No</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                </tr>
              </thead>

              <tbody>

                {recentStudents.length > 0 ? (

                  recentStudents.map(
                    (student, index) => (

                      <tr
                        key={
                          student.id ||
                          student.regNo ||
                          index
                        }
                      >

                        <td className="student-id">
                          {student.regNo ||
                            student.id ||
                            "-"}
                        </td>

                        <td>
                          {student.name || "-"}
                        </td>

                        <td>
                          {student.department || "-"}
                        </td>

                        <td>
                          {student.semester ||
                            student.year ||
                            "-"}
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="4"
                      className="empty-state"
                    >
                      No students available
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* =========================
              ANNOUNCEMENTS
        ========================= */}

        <div className="notice-card">

          <div className="section-heading">

            <div className="section-icon notification-heading">
              <FaBell />
            </div>

            <div>
              <h2>Announcements</h2>

              <p>
                Latest college updates
              </p>
            </div>

          </div>


          <ul>

            {notices.map(
              (notice, index) => (

                <li key={index}>

                  <span className="notice-dot"></span>

                  <span>
                    {notice}
                  </span>

                </li>

              )
            )}

          </ul>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
