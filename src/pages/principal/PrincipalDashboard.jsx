import { useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaMoneyBillWave,
  FaUniversity,
  FaBell,
  FaFileSignature,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import API from "./../../api";

// The admin layout is role agnostic once the class names are
// ignored, so it is shared rather than copied. Nothing here
// renders with the word "admin" in it except the classes.
import "./../AdminDashboard.css";

const PrincipalDashboard = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [fees, setFees] = useState([]);

  // Every faculty leave awaiting a decision, HOD leave
  // included. Unlike the admin, whose queue is narrowed to
  // HOD leave only, the principal is shown the lot.
  const [leavePending, setLeavePending] = useState(null);

  const [pendingRequests, setPendingRequests] = useState(
    []
  );


  /* =========================
        LOAD DATA
  ========================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentRes, facultyRes, feeRes] =
          await Promise.all([
            API.get("/students"),
            API.get("/faculty"),
            API.get("/fees"),
          ]);

        // /students returns a bare array.
        setStudents(
          Array.isArray(studentRes.data)
            ? studentRes.data
            : []
        );

        // /faculty returns a bare array.
        setFaculty(
          Array.isArray(facultyRes.data)
            ? facultyRes.data
            : []
        );

        // /fees returns { success, fees }.
        setFees(
          Array.isArray(feeRes.data?.fees)
            ? feeRes.data.fees
            : []
        );
      } catch {
        // Backend unavailable. Keep the dashboard usable
        // with empty states instead of crashing.
        setStudents([]);
        setFaculty([]);
        setFees([]);
      }
    };

    loadData();
  }, []);


  /* =========================
        LEAVE QUEUE
  ========================= */

  useEffect(() => {
    const loadLeave = async () => {
      try {
        // No hodOnly: the principal's queue is the whole
        // college, and the stats route already reports a
        // pending count so no status filter is needed there.
        const [statsRes, listRes] = await Promise.all([
          API.get("/faculty-requests/stats"),
          API.get("/faculty-requests", {
            params: { status: "pending" },
          }),
        ]);

        setLeavePending(
          Number(statsRes.data?.stats?.pending ?? 0)
        );

        setPendingRequests(
          Array.isArray(listRes.data?.requests)
            ? listRes.data.requests
            : []
        );
      } catch {
        // Older backend or network failure. Stay quiet
        // rather than showing a wrong number as fact.
        setLeavePending(null);
        setPendingRequests([]);
      }
    };

    loadLeave();
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
      title: "Fee Collection",
      value: `₹${totalFees.toLocaleString("en-IN")}`,
      icon: <FaMoneyBillWave />,
      className: "fees-card",
    },
    {
      title: "Leave Pending",
      value:
        leavePending === null ? "-" : leavePending,
      icon: <FaFileSignature />,
      className: `hod-leave-card ${
        leavePending > 0 ? "hod-leave-pending" : ""
      }`,
      hint: "Needs your approval",
      onClick: () => navigate("/principal/leave-approvals"),
    },
  ];


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
            <h1>Principal Dashboard</h1>

            <p>
              College ERP Management System
            </p>
          </div>

        </div>

        <div className="admin-header-badge">
          Principal
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
              PENDING LEAVE
        ========================= */}

        <div className="table-card">

          <div className="section-heading-admin">

            <div className="section-icon students-heading-admin">
              <FaFileSignature />
            </div>

            <div>
              <h2>Pending Leave</h2>

              <p>
                Faculty and HOD requests awaiting your decision
              </p>
            </div>

          </div>


          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th>Department</th>
                </tr>
              </thead>

              <tbody>

                {pendingRequests.length > 0 ? (

                  pendingRequests
                    .slice(0, 5)
                    .map((request, index) => (

                      <tr
                        key={request._id || index}
                      >

                        <td className="student-id">
                          {request.facultyName ||
                            request.facultyId ||
                            "-"}
                        </td>

                        <td>
                          {request.type === "leave"
                            ? request.leaveType || "Leave"
                            : "Permission"}
                        </td>

                        <td>
                          {request.fromDate
                            ? `${request.fromDate} to ${
                                request.toDate || "-"
                              }`
                            : "-"}
                        </td>

                        <td>
                          {request.department || "-"}
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
                      No pending leave requests
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {pendingRequests.length > 5 && (

            <button
              type="button"
              className="card-hint"
              style={{ margin: "12px 24px 20px" }}
              onClick={() =>
                navigate("/principal/leave-approvals")
              }
            >
              View all {leavePending ?? ""} pending requests
            </button>

          )}

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

export default PrincipalDashboard;
