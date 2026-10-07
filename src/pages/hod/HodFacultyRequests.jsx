// src/pages/hod/HodFacultyRequests.jsx
//
// The Head of Department approves leave and permission
// requests from faculty members. The server scopes the
// list to the HOD's own department.

import {
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
  FaKey,
  FaUserTie,
  FaStickyNote,
  FaClock,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardList,
} from "react-icons/fa";

import API from "./../../api";
import useAuth from "./../../hooks/useAuth";
import { formatDate } from "./../../utils/format";

// The fr-* classes are defined once in the faculty
// requests stylesheet and shared with this page.
import "./../faculty/FacultyRequests.css";

const PAGE_SIZE = 8;

const HodFacultyRequests = () => {
  const { user } = useAuth();

  // An admin countersigns HOD leave, since an HOD may not
  // approve their own request and there is no second HOD
  // for them to hand it to.
  const isAdmin = user?.role === "admin";

  // The principal signs in as faculty with the isPrincipal
  // flag. They sit above every department, so unlike the
  // admin they are shown the whole queue rather than only
  // the HOD leave that needs countersigning.
  const isPrincipal =
    user?.role === "faculty" &&
    user?.isPrincipal === true;

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    leave: 0,
    permission: 0,
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

      // The admin queue is HOD leave only, so the countersign
      // does not quietly take over the department HOD's work.
      if (isAdmin) {
        params.hodOnly = "true";
      }

      const statsParams = isAdmin
        ? { hodOnly: "true" }
        : undefined;

      const [listResponse, statsResponse] = await Promise.all([
        API.get("/faculty-requests", { params }),
        API.get("/faculty-requests/stats", {
          params: statsParams,
        }),
      ]);

      setRequests(listResponse.data?.requests || []);
      setStats(
        statsResponse.data?.stats || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          leave: 0,
          permission: 0,
        }
      );
    } catch (error) {
      console.error("HOD Faculty Requests Error:", error);

      notify(
        error.response?.status === 403
          ? isAdmin || isPrincipal
            ? "This account cannot review faculty leave."
            : "This account does not have Head of Department access."
          : error.response?.data?.message ||
            "Failed to load requests. Make sure the backend is deployed.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter, search, isAdmin, isPrincipal]);

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
        `Approve this ${request.type} request for ${
          request.facultyName || request.facultyId
        }?`
      )
    ) {
      return;
    }

    setWorking(true);

    try {
      // HOD identity is read from the JWT on the server,
      // so it is not sent from the browser.
      await API.put(
        `/faculty-requests/${request._id}/status`,
        {
          status,
          hodRemark: trimmedRemark,
        }
      );

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
      console.error("HOD Request Action Error:", error);

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

  // The server refuses to let an HOD process their own
  // request. The row is marked here so the button is
  // disabled rather than failing after the click.
  const isOwnRequest = (request) =>
    String(request.facultyId || "").trim().toUpperCase() ===
    String(user?.facultyId || "").trim().toUpperCase();

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
          <FaClipboardList />
          Faculty Approvals
        </h1>

        <p>
          {isPrincipal
            ? "Review leave and permission requests from every faculty member across all departments, including HOD leave that needs countersigning"
            : isAdmin
              ? "Review leave and permission requests from every faculty member, including HOD leave that needs countersigning"
              : "Review leave and permission requests from faculty members in your department"}
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
            <span>Leaves</span>
            <strong>{stats.leave}</strong>
          </div>
        </div>

        <div className="fr-stat-card">
          <div className="fr-stat-icon bonafide">
            <FaKey />
          </div>

          <div>
            <span>Permissions</span>
            <strong>{stats.permission}</strong>
          </div>
        </div>

        <div className="fr-stat-card">
          <div className="fr-stat-icon total">
            <FaClipboardList />
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
            className={tab === "permission" ? "active" : ""}
            onClick={() => setTab("permission")}
          >
            <FaKey />
            Permission
          </button>
        </div>

        <div className="fr-filter-right">

          <div className="fr-search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search faculty, ID or reason"
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
          <FaClipboardList />
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
                <th>Faculty</th>
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
                      <div className="fr-detail">
                        <strong>
                          {formatDate(request.fromDate)} -{" "}
                          {formatDate(request.toDate)}
                        </strong>

                        <span>
                          {leaveDays(request)} day(s)
                        </span>
                      </div>
                    ) : (
                      <div className="fr-detail">
                        <strong>Single day</strong>

                        <span>
                          {formatDate(
                            request.createdAt
                          )}
                        </span>
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
                    {request.status === "pending" &&
                    isOwnRequest(request) ? (
                      <span
                        className="fr-review-btn disabled"
                        title="You cannot approve your own request"
                      >
                        <FaExclamationTriangle />
                        Your request
                      </span>
                    ) : (
                      <button
                        className="fr-review-btn"
                        onClick={() => {
                          setSelected(request);
                          setRemark(request.hodRemark || "");
                          setRemarkError("");
                        }}
                      >
                        <FaEye />
                        Review
                      </button>
                    )}
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
                      : "permission"
                  }`}
                >
                {selected.type === "leave" ? (
                  <FaCalendarCheck />
                ) : (
                  <FaKey />
                )}
              </div>

              <div>
                <h2>
                  {selected.type === "leave"
                    ? "Leave Request"
                    : "Permission Request"}
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
                  <FaUserTie />
                  Faculty
                </span>
                <strong>
                  {selected.facultyName || "-"} (
                  {selected.facultyId})
                </strong>
              </div>

              <div className="fr-modal-detail">
                <span>Department</span>
                <strong>
                  {selected.department || "-"}
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
                      {formatDate(selected.fromDate)} -{" "}
                      {formatDate(selected.toDate)}
                    </strong>
                  </div>
                </>
              ) : (
                <div className="fr-modal-detail span2">
                  <span>Permission Type</span>
                  <strong>
                    {selected.permissionType || "-"}
                  </strong>
                </div>
              )}

              <div className="fr-modal-detail span2">
                <span>
                  <FaStickyNote />
                  Faculty Reason
                </span>
                <strong>
                  {selected.reason}
                </strong>
              </div>

            </div>


            {/* -----------------------------------------
                HOD REMARK
            ----------------------------------------- */}

            {selected.status === "pending" ? (
              <div className="fr-remark-field">
                <label>
                  HOD Remark{" "}
                  <span>
                    (required to reject)
                  </span>
                </label>

                <textarea
                  rows="3"
                  placeholder="Add a remark for the faculty member"
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
              selected.hodRemark && (
                <div className="fr-final-remark">
                  <span>
                    <FaUserTie />
                    HOD Remark
                  </span>

                  <p>
                    {selected.hodRemark}
                  </p>

                  {selected.actionedByName && (
                    <small>
                      {selected.actionedByName} -{" "}
                      {formatDate(selected.actionedAt)}
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

export default HodFacultyRequests;
