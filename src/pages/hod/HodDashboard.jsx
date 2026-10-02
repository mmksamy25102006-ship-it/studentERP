// src/pages/hod/HodDashboard.jsx
//
// Department overview for the Head of Department. Every
// number comes from a real endpoint, scoped server side
// to the HOD's own department.

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  FaChalkboardTeacher,
  FaClock,
  FaCheckCircle,
  FaCalendarCheck,
  FaKey,
  FaClipboardList,
  FaFileSignature,
  FaUserTie,
  FaSyncAlt,
  FaExclamationTriangle,
  FaArrowRight,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import API from "./../../api";
import useAuth from "./../../hooks/useAuth";
import { formatDate } from "./../../utils/format";

import "./HodDashboard.css";

const EMPTY_FACULTY_STATS = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  leave: 0,
  permission: 0,
};

const EMPTY_STUDENT_STATS = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  leave: 0,
  bonafide: 0,
};

const HodDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [facultyCount, setFacultyCount] = useState(0);
  const [facultyStats, setFacultyStats] = useState(
    EMPTY_FACULTY_STATS
  );
  const [studentStats, setStudentStats] = useState(
    EMPTY_STUDENT_STATS
  );
  const [recent, setRecent] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const department = user?.department || "";

  // ===================================================
  // LOAD
  // ===================================================

  const load = useCallback(async () => {
    try {
      const [
        departmentResponse,
        facultyStatsResponse,
        studentStatsResponse,
        recentResponse,
      ] = await Promise.all([
        API.get("/faculty/department/mine"),
        API.get("/faculty-requests/stats"),
        API.get("/requests/stats"),
        API.get("/faculty-requests", {
          params: { status: "pending" },
        }),
      ]);

      const departmentFaculty = Array.isArray(
        departmentResponse.data
      )
        ? departmentResponse.data
        : [];

      setFacultyCount(departmentFaculty.length);

      setFacultyStats(
        facultyStatsResponse.data?.stats ||
          EMPTY_FACULTY_STATS
      );

      setStudentStats(
        studentStatsResponse.data?.stats || EMPTY_STUDENT_STATS
      );

      setRecent(
        (recentResponse.data?.requests || []).slice(0, 5)
      );
    } catch (error) {
      console.error("HOD Dashboard Error:", error);

      setMessage(
        error.response?.status === 403
          ? "This account does not have Head of Department access."
          : error.response?.data?.message ||
            "Some dashboard data could not be loaded. Make sure the backend is deployed."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ===================================================
  // HELPERS
  // ===================================================

  const leaveDays = (request) => {
    if (!request.fromDate || !request.toDate) {
      return 0;
    }

    const start = new Date(request.fromDate);
    const end = new Date(request.toDate);

    return (
      Math.round(
        (end - start) / (24 * 60 * 60 * 1000)
      ) + 1
    );
  };

  const totalPending =
    facultyStats.pending + studentStats.pending;

  // ===================================================
  // RENDER
  // ===================================================

  if (loading) {
    return (
      <div className="hod-page">
        <div className="hod-loading">
          <FaSyncAlt className="hod-spin" />
          Loading your department...
        </div>
      </div>
    );
  }

  return (
    <div className="hod-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="hod-header">
        <div className="hod-greeting">
          <h1>
            <FaUserTie />
            Welcome, {user?.name || "HOD"}
          </h1>

          <p>
            {department
              ? `Head of Department - ${department}`
              : "Head of Department"}
          </p>
        </div>

        {totalPending > 0 && (
          <button
            type="button"
            className="hod-alert"
            onClick={() => navigate("/hod/faculty-requests")}
          >
            <FaClock />
            {totalPending} request
            {totalPending === 1 ? "" : "s"} awaiting
            approval
            <FaArrowRight />
          </button>
        )}
      </div>


      {message && (
        <div className="hod-notice">
          <FaExclamationTriangle />
          {message}
        </div>
      )}


      {/* ===================================================
          STAT CARDS
      =================================================== */}

      <div className="hod-stats">

        <div className="hod-stat-card">
          <div className="hod-stat-icon faculty">
            <FaChalkboardTeacher />
          </div>

          <div>
            <span>Faculty in Dept</span>
            <strong>{facultyCount}</strong>
          </div>
        </div>

        <div className="hod-stat-card">
          <div className="hod-stat-icon pending">
            <FaClock />
          </div>

          <div>
            <span>Faculty Pending</span>
            <strong>{facultyStats.pending}</strong>
          </div>
        </div>

        <div className="hod-stat-card">
          <div className="hod-stat-icon approved">
            <FaCheckCircle />
          </div>

          <div>
            <span>Faculty Approved</span>
            <strong>{facultyStats.approved}</strong>
          </div>
        </div>

        <div className="hod-stat-card">
          <div className="hod-stat-icon leave">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Leaves Filed</span>
            <strong>{facultyStats.leave}</strong>
          </div>
        </div>

        <div className="hod-stat-card">
          <div className="hod-stat-icon permission">
            <FaKey />
          </div>

          <div>
            <span>Permissions</span>
            <strong>{facultyStats.permission}</strong>
          </div>
        </div>

        <div className="hod-stat-card">
          <div className="hod-stat-icon student">
            <FaFileSignature />
          </div>

          <div>
            <span>Student Pending</span>
            <strong>{studentStats.pending}</strong>
          </div>
        </div>

      </div>


      {/* ===================================================
          SHORTCUTS
      =================================================== */}

      <div className="hod-actions">

        <button
          type="button"
          className="hod-action-card"
          onClick={() => navigate("/hod/faculty-requests")}
        >
          <div className="hod-action-icon">
            <FaClipboardList />
          </div>

          <div className="hod-action-body">
            <strong>Faculty Approvals</strong>
            <span>
              Review leave and permission from your
              department
            </span>
          </div>

          <span className="hod-action-count">
            {facultyStats.pending}
          </span>
        </button>

        <button
          type="button"
          className="hod-action-card"
          onClick={() => navigate("/hod/student-requests")}
        >
          <div className="hod-action-icon student">
            <FaFileSignature />
          </div>

          <div className="hod-action-body">
            <strong>Student Approvals</strong>
            <span>
              Review student leave and bonafide
              requests
            </span>
          </div>

          <span className="hod-action-count student">
            {studentStats.pending}
          </span>
        </button>

        <button
          type="button"
          className="hod-action-card"
          onClick={() => navigate("/hod/department")}
        >
          <div className="hod-action-icon dept">
            <FaChalkboardTeacher />
          </div>

          <div className="hod-action-body">
            <strong>My Department</strong>
            <span>
              See everyone in {department || "your dept"}
            </span>
          </div>

          <span className="hod-action-count dept">
            {facultyCount}
          </span>
        </button>

      </div>


      {/* ===================================================
          PENDING FACULTY REQUESTS
      =================================================== */}

      <div className="hod-section">

        <div className="hod-section-header">
          <h2>
            <FaClipboardList />
            Pending Faculty Requests
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/hod/faculty-requests")
            }
          >
            View all
            <FaArrowRight />
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="hod-empty">
            <FaCheckCircle />
            <span>Nothing waiting on you</span>
            <small>
              All faculty requests in your department
              have been reviewed
            </small>
          </div>
        ) : (
          <div className="hod-table-wrap">
            <table className="hod-table">
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Applied On</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {recent.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <div className="hod-person">
                        <div className="hod-avatar">
                          {(request.facultyName || "F")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {request.facultyName ||
                              "Unknown"}
                          </strong>

                          <span>
                            {request.facultyId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`hod-type ${
                          request.type === "leave"
                            ? "leave"
                            : "permission"
                        }`}
                      >
                        {request.type === "leave" ? (
                          <FaCalendarCheck />
                        ) : (
                          <FaKey />
                        )}
                        {request.type === "leave"
                          ? request.leaveType
                          : request.permissionType ||
                            "Permission"}
                      </span>
                    </td>

                    <td>
                      {request.type === "leave" ? (
                        <div className="hod-detail">
                          <strong>
                            {formatDate(
                              request.fromDate
                            )}{" "}
                            -{" "}
                            {formatDate(request.toDate)}
                          </strong>

                          <span>
                            {leaveDays(request)} day(s)
                          </span>
                        </div>
                      ) : (
                        <div className="hod-detail">
                          <strong>Single day</strong>

                          <span>
                            {request.reason.slice(0, 40)}
                          </span>
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="hod-date">
                        {formatDate(request.createdAt)}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="hod-review-btn"
                        onClick={() =>
                          navigate("/hod/faculty-requests")
                        }
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

export default HodDashboard;
