import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaCalendarCheck,
  FaAward,
  FaUserGraduate,
  FaStickyNote,
  FaClock,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaFileSignature,
  FaClipboardCheck,
} from "react-icons/fa";

import API from "./../../api";
import useAuth from "./../../hooks/useAuth";
import { formatDate } from "./../../utils/format";

import "./FacultyRequests.css";

const PAGE_SIZE = 8;

const FacultyRequests = () => {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    leave: 0,
    bonafide: 0,
  });

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  const [tab, setTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // ===================================================
  // NOTICE
  // ===================================================

  const notify = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => setMessage(""), 4000);

    return () => clearTimeout(timer);
  }, [message]);

  // ===================================================
  // LOAD
  // ===================================================

  const load = useCallback(async () => {
    try {
      const params = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (tab !== "all") {
        params.type = tab;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const [listResponse, statsResponse] = await Promise.all([
        API.get("/requests", { params }),
        API.get("/requests/stats"),
      ]);

      setRequests(listResponse.data?.requests || []);
      setStats(statsResponse.data?.stats || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        leave: 0,
        bonafide: 0,
      });
    } catch (error) {
      console.error("Faculty Requests Error:", error);

      notify(
        "Failed to load requests. Make sure the backend is deployed.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [tab, statusFilter, search]);

  // ===================================================
  // APPROVE / REJECT
  // ===================================================

  const handleAction = async (request, status) => {
    const trimmedRemark = remark.trim();

    if (status === "rejected" && !trimmedRemark) {
      setRemarkError(
        "A remark is required when rejecting a request"
      );

      return;
    }

    if (
      status === "approved" &&
      !window.confirm(
        `Approve ${
          request.type === "leave"
            ? "this leave request"
            : "this bonafide request"
        }?${
          request.type === "bonafide"
            ? " A certificate number will be generated."
            : ""
        }`
      )
    ) {
      return;
    }

    setWorking(true);

    try {
      await API.put(`/requests/${request._id}/status`, {
        status,
        facultyRemark: trimmedRemark,
        facultyId: user?.facultyId || user?.id || "",
        facultyName: user?.name || "",
      });

      notify(
        status === "approved"
          ? "Request approved successfully"
          : "Request rejected successfully"
      );

      setSelected(null);
      setRemark("");
      setRemarkError("");

      await load();
    } catch (error) {
      console.error("Request Action Error:", error);

      notify(
        error.response?.data?.message ||
          "Failed to update request",
        "error"
      );
    } finally {
      setWorking(false);
    }
  };

  // ===================================================
  // PAGINATION
  // ===================================================

  const totalPages = Math.max(
    1,
    Math.ceil(requests.length / PAGE_SIZE)
  );

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return requests.slice(start, start + PAGE_SIZE);
  }, [requests, page]);

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

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return (
        <span className="fr-status approved">
          <FaCheckCircle />
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="fr-status rejected">
          <FaTimesCircle />
          Rejected
        </span>
      );
    }

    if (status === "cancelled") {
      return (
        <span className="fr-status cancelled">
          <FaStickyNote />
          Cancelled
        </span>
      );
    }

    return (
      <span className="fr-status pending">
        <FaClock />
        Pending
      </span>
    );
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="fr-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="fr-header">
        <h1>
          <FaClipboardCheck />
          Request Approvals
        </h1>

        <p>
          Review student leave applications and bonafide
          certificate requests
        </p>
      </div>


      {message && (
        <div className={`fr-notice ${messageType}`}>
          {messageType === "error" ? (
            <FaExclamationTriangle />
          ) : (
            <FaCheckCircle />
          )}
          {message}
        </div>
      )}


      {/* ===================================================
          STATS
      =================================================== */}

      <div className="fr-stats">

        <div className="fr-stat-card">
          <div className="fr-stat-icon pending">
            <FaClock />
          </div>

          <div>
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
        </div>

        <div className="fr-stat-card">
          <div className="fr-stat-icon approved">
            <FaCheckCircle />
          </div>

          <div>
            <span>Approved</span>
            <strong>{stats.approved}</strong>
          </div>
        </div>

        <div className="fr-stat-card">
          <div className="fr-stat-icon rejected">
            <FaTimesCircle />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{stats.rejected}</strong>
          </div>
        </div>

        <div className="fr-stat-card">
          <div className="fr-stat-icon leave">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Leave Requests</span>
            <strong>{stats.leave}</strong>
          </div>
        </div>

        <div className="fr-stat-card">
          <div className="fr-stat-icon bonafide">
            <FaAward />
          </div>

          <div>
            <span>Bonafides</span>
            <strong>{stats.bonafide}</strong>
          </div>
        </div>

        <div className="fr-stat-card">
          <div className="fr-stat-icon total">
            <FaFileSignature />
          </div>

          <div>
            <span>Total</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

      </div>


      {/* ===================================================
          FILTERS
      =================================================== */}

      <div className="fr-filters">

        <div className="fr-tabs">

          <button
            className={tab === "all" ? "active" : ""}
            onClick={() => setTab("all")}
          >
            All
          </button>

          <button
            className={tab === "leave" ? "active" : ""}
            onClick={() => setTab("leave")}
          >
            <FaCalendarCheck />
            Leave
          </button>

          <button
            className={tab === "bonafide" ? "active" : ""}
            onClick={() => setTab("bonafide")}
          >
            <FaAward />
            Bonafide
          </button>
        </div>

        <div className="fr-filter-right">

          <div className="fr-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search student, ID or reason"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="fr-select">
            <FaFilter />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

        </div>
      </div>


      {/* ===================================================
          TABLE
      =================================================== */}

      {loading ? (
        <div className="fr-loading">
          <FaSyncAlt className="fr-spin" />
          Loading requests...
        </div>
      ) : pageItems.length === 0 ? (
        <div className="fr-empty">
          <FaClipboardCheck />
          <span>No requests found</span>
          <small>
            Try a different filter or search term
          </small>
        </div>
      ) : (
        <div className="fr-table-wrap">
          <table className="fr-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Type</th>
                <th>Details</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {pageItems.map((request) => (
                <tr key={request._id}>

                  <td>
                    <div className="fr-student">
                      <div className="fr-avatar">
                        {(request.studentName || "S")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {request.studentName ||
                            "Unknown"}
                        </strong>

                        <span>
                          {request.studentId}
                          {request.department
                            ? ` • ${request.department}`
                            : ""}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`fr-type ${
                        request.type === "leave"
                          ? "leave"
                          : "bonafide"
                      }`}
                    >
                      {request.type === "leave" ? (
                        <FaCalendarCheck />
                      ) : (
                        <FaAward />
                      )}
                      {request.type === "leave"
                        ? request.leaveType
                        : request.certificateType ||
                          "Bonafide"}
                    </span>
                  </td>

                  <td>
                    {request.type === "leave" ? (
                      <div className="fr-detail">
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
                      <div className="fr-detail">
                        <strong>
                          {request.purpose || "-"}
                        </strong>

                        {request.certificateNumber && (
                          <span className="fr-cert">
                            {request.certificateNumber}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td>
                    <span className="fr-date">
                      {formatDate(request.createdAt)}
                    </span>
                  </td>

                  <td>
                    {getStatusBadge(request.status)}
                  </td>

                  <td>
                    <button
                      className="fr-review-btn"
                      onClick={() => {
                        setSelected(request);
                        setRemark(
                          request.facultyRemark || ""
                        );
                        setRemarkError("");
                      }}
                    >
                      <FaEye />
                      Review
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {/* ===================================================
          PAGINATION
      =================================================== */}

      {!loading && requests.length > PAGE_SIZE && (
        <div className="fr-pagination">

          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <FaChevronLeft />
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <FaChevronRight />
          </button>
        </div>
      )}


      {/* ===================================================
          REVIEW MODAL
      =================================================== */}

      {selected && (
        <div
          className="fr-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="fr-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fr-modal-head">

              <div
                className={`fr-modal-icon ${
                  selected.type === "leave"
                    ? "leave"
                    : "bonafide"
                }`}
              >
                {selected.type === "leave" ? (
                  <FaCalendarCheck />
                ) : (
                  <FaAward />
                )}
              </div>

              <div>
                <h2>
                  {selected.type === "leave"
                    ? "Leave Request"
                    : "Bonafide Request"}
                </h2>

                <p>
                  Applied on{" "}
                  {formatDate(selected.createdAt)}
                </p>
              </div>

              {getStatusBadge(selected.status)}

            </div>


            <div className="fr-modal-grid">

              <div className="fr-modal-detail">
                <span>
                  <FaUserGraduate />
                  Student
                </span>
                <strong>
                  {selected.studentName || "-"}{" "}
                  ({selected.studentId})
                </strong>
              </div>

              <div className="fr-modal-detail">
                <span>Department</span>
                <strong>
                  {selected.department || "-"}
                  {selected.year
                    ? ` - Year ${selected.year}`
                    : ""}
                </strong>
              </div>

              {selected.type === "leave" ? (
                <>
                  <div className="fr-modal-detail">
                    <span>Leave Type</span>
                    <strong>
                      {selected.leaveType}
                    </strong>
                  </div>

                  <div className="fr-modal-detail">
                    <span>Duration</span>
                    <strong>
                      {leaveDays(selected)} day(s)
                    </strong>
                  </div>

                  <div className="fr-modal-detail span2">
                    <span>Dates</span>
                    <strong>
                      {formatDate(
                        selected.fromDate
                      )}{" "}
                      -{" "}
                      {formatDate(selected.toDate)}
                    </strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="fr-modal-detail">
                    <span>
                      Certificate Type
                    </span>
                    <strong>
                      {selected.certificateType ||
                        "Bonafide"}
                    </strong>
                  </div>

                  <div className="fr-modal-detail">
                    <span>Purpose</span>
                    <strong>
                      {selected.purpose || "-"}
                    </strong>
                  </div>

                  {selected.certificateNumber && (
                    <div className="fr-modal-detail span2">
                      <span>
                        Certificate Number
                      </span>
                      <strong className="fr-cert">
                        {selected.certificateNumber}
                      </strong>
                    </div>
                  )}
                </>
              )}

              <div className="fr-modal-detail span2">
                <span>
                  <FaStickyNote />
                  Student Reason
                </span>
                <strong>
                  {selected.reason}
                </strong>
              </div>

            </div>


            {/* -----------------------------------------
                FACULTY REMARK
            ----------------------------------------- */}

            {selected.status === "pending" ? (
              <div className="fr-remark-field">
                <label>
                  Faculty Remark{" "}
                  <span>
                    (required to reject)
                  </span>
                </label>

                <textarea
                  rows="3"
                  placeholder="Add a remark for the student"
                  value={remark}
                  onChange={(e) => {
                    setRemark(e.target.value);

                    if (e.target.value.trim()) {
                      setRemarkError("");
                    }
                  }}
                />

                {remarkError && (
                  <small className="fr-error">
                    {remarkError}
                  </small>
                )}
              </div>
            ) : (
              selected.facultyRemark && (
                <div className="fr-final-remark">
                  <span>
                    <FaUserGraduate />
                    Faculty Remark
                  </span>

                  <p>
                    {selected.facultyRemark}
                  </p>

                  {selected.actionedByName && (
                    <small>
                      {selected.actionedByName}{" "}
                      -{" "}
                      {formatDate(
                        selected.actionedAt
                      )}
                    </small>
                  )}
                </div>
              )
            )}


            {/* -----------------------------------------
                ACTIONS
            ----------------------------------------- */}

            {selected.status === "pending" ? (
              <div className="fr-modal-actions">

                <button
                  className="fr-reject-btn"
                  onClick={() =>
                    handleAction(selected, "rejected")
                  }
                  disabled={working}
                >
                  <FaTimesCircle />
                  Reject
                </button>

                <button
                  className="fr-approve-btn"
                  onClick={() =>
                    handleAction(selected, "approved")
                  }
                  disabled={working}
                >
                  <FaCheckCircle />
                  Approve
                </button>

              </div>
            ) : (
              <div className="fr-modal-actions">
                <button
                  className="fr-close-btn"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyRequests;
