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
import { useAuth } from "./../../context/AuthContext";
import { resolveRequesterRole } from "./../../utils/facultyRoles";

// The admin layout is role agnostic once the class names are
// ignored, so it is shared rather than copied. Nothing here
// renders with the word "admin" in it except the classes.
import "./../AdminDashboard.css";

const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [fees, setFees] = useState([]);

  // Every pending request except the principal's own. Their
  // own leave cannot be approved by them, so it would only
  // ever be a dead row here; it stays visible on the
  // approvals page, marked "Your request".
  const [leavePending, setLeavePending] = useState(null);

  const [pendingRequests, setPendingRequests] = useState(
    []
  );

  const ownId = String(
    user?.facultyId || ""
  )
    .trim()
    .toUpperCase();

  // The row's role comes from the backend when it annotates
  // the request; until then the faculty list fetched for the
  // cards settles it. HOD leave is the only kind this portal
  // approves, so the table has to name which rows are HOD
  // leave.
  const requesterRoleMap = {};
  faculty.forEach((member) => {
    const key = String(member.facultyId || "")
      .trim()
      .toUpperCase();

    if (key) {
      requesterRoleMap[key] = member.isPrincipal
        ? "principal"
        : member.isHod
          ? "hod"
          : "faculty";
    }
  });

  const roleLabel = (request) => {
    const role = resolveRequesterRole(
      request,
      requesterRoleMap
    );

    return role === "principal"
      ? "Principal"
      : role === "hod"
        ? "HOD"
        : "Faculty";
  };


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
    // Wait for AuthContext so ownId is settled and the
    // list is filtered exactly once.
    if (loading) {
      return;
    }

    const loadLeave = async () => {
      try {
        const listRes = await API.get("/faculty-requests", {
          params: { status: "pending" },
        });

        const all = Array.isArray(listRes.data?.requests)
          ? listRes.data.requests
          : [];

        const others = all.filter(
          (request) =>
            String(request.facultyId || "")
              .trim()
              .toUpperCase() !== ownId
        );

        // One source for both the card and the table so the
        // number above and the rows below can never disagree.
        setLeavePending(others.length);
        setPendingRequests(others);
      } catch {
        setLeavePending(null);
        setPendingRequests([]);
      }
    };

    loadLeave();
  }, [loading, ownId]);


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
      hint: "Open the approval queue",
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
                  <th>Role</th>
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
                          {roleLabel(request)}
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
                      colSpan="5"
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
