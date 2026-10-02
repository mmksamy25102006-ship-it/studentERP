// src/pages/faculty/FacultyLeave.jsx
//
// Faculty apply for leave or permission. Requests go to
// the Head of Department, who reviews them on the HOD
// approvals page.

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaCalendarCheck,
  FaKey,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSyncAlt,
  FaExclamationTriangle,
  FaPaperPlane,
  FaBan,
  FaUserTie,
  FaStickyNote,
  FaEye,
  FaTimes,
} from "react-icons/fa";

import API from "./../../api";
import useAuth from "./../../hooks/useAuth";
import { formatDate } from "./../../utils/format";

// The rq-* classes this page uses are defined once in the
// student requests stylesheet. Both pages show the same
// layout, so the rules are shared rather than duplicated.
import "../Requests.css";

const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Event Leave",
  "Emergency Leave",
  "Maternity Leave",
  "Earned Leave",
];

const PERMISSION_TYPES = [
  "On Duty",
  "Work From Home",
  "Late Arrival",
  "Early Departure",
  "Official Tour",
];

const EMPTY_FORM = {
  type: "leave",
  leaveType: "Casual Leave",
  fromDate: "",
  toDate: "",
  permissionType: "On Duty",
  reason: "",
};

const FacultyLeave = () => {
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState("leave");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [selected, setSelected] = useState(null);

  const facultyId = user?.facultyId || "";

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
  // LOAD REQUESTS
  // ===================================================

  const loadRequests = useCallback(async () => {
    if (!facultyId) {
      setLoading(false);

      return;
    }

    try {
      const response = await API.get("/faculty-requests/mine");

      setRequests(response.data?.requests || []);
    } catch (error) {
      console.error("Faculty Leave Load Error:", error);

      notify(
        error.response?.data?.message ||
          "Failed to load your requests. Redeploy the backend to enable them.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // ===================================================
  // FORM
  // ===================================================

  const today = new Date().toISOString().slice(0, 10);

  const validate = () => {
    const next = {};

    if (!form.reason.trim()) {
      next.reason = "Reason is required";
    } else if (form.reason.trim().length < 10) {
      next.reason = "Reason must be at least 10 characters";
    }

    if (form.type === "leave") {
      if (!form.fromDate) {
        next.fromDate = "From date is required";
      }

      if (!form.toDate) {
        next.toDate = "To date is required";
      }

      if (
        form.fromDate &&
        form.toDate &&
        form.toDate < form.fromDate
      ) {
        next.toDate = "To date cannot be before from date";
      }
    }

    if (
      form.type === "permission" &&
      !form.permissionType
    ) {
      next.permissionType = "Permission type is required";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    if (!facultyId) {
      notify("No faculty ID found for this login", "error");

      return;
    }

    setSaving(true);

    try {
      // Faculty identity is read from the JWT on the
      // server, so it is not sent from the browser.
      await API.post("/faculty-requests", {
        type: form.type,
        leaveType: form.leaveType,
        fromDate: form.fromDate,
        toDate: form.toDate,
        permissionType: form.permissionType,
        reason: form.reason.trim(),
      });

      notify(
        form.type === "leave"
          ? "Leave request sent to the Head of Department"
          : "Permission request sent to the Head of Department"
      );

      setForm({
        ...EMPTY_FORM,
        type: form.type,
      });

      setErrors({});

      await loadRequests();
    } catch (error) {
      console.error("Create Faculty Request Error:", error);

      notify(
        error.response?.data?.message ||
          "Failed to submit request",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // CANCEL
  // ===================================================

  const handleCancel = async (request) => {
    if (
      !window.confirm("Cancel this pending request?")
    ) {
      return;
    }

    setSaving(true);

    try {
      await API.patch(
        `/faculty-requests/${request._id}/cancel`
      );

      notify("Request cancelled");

      await loadRequests();
    } catch (error) {
      console.error("Cancel Faculty Request Error:", error);

      notify(
        error.response?.data?.message ||
          "Failed to cancel request",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // STATS
  // ===================================================

  const counts = useMemo(() => {
    return {
      pending: requests.filter(
        (item) => item.status === "pending"
      ).length,
      approved: requests.filter(
        (item) => item.status === "approved"
      ).length,
      rejected: requests.filter(
        (item) => item.status === "rejected"
      ).length,
      leave: requests.filter(
        (item) => item.type === "leave"
      ).length,
      permission: requests.filter(
        (item) => item.type === "permission"
      ).length,
    };
  }, [requests]);

  const filtered = useMemo(() => {
    return requests.filter((item) => {
      const matchesType = item.type === tab;
      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      return matchesType && matchesStatus;
    });
  }, [requests, tab, statusFilter]);

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
        <span className="rq-status approved">
          <FaCheckCircle />
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="rq-status rejected">
          <FaTimesCircle />
          Rejected
        </span>
      );
    }

    if (status === "cancelled") {
      return (
        <span className="rq-status cancelled">
          <FaBan />
          Cancelled
        </span>
      );
    }

    return (
      <span className="rq-status pending">
        <FaClock />
        Pending
      </span>
    );
  };

  // ===================================================
  // RENDER
  // ===================================================

  if (loading) {
    return (
      <div className="rq-page">
        <div className="rq-status-box">
          <FaSyncAlt className="rq-spin" />
          Loading requests...
        </div>
      </div>
    );
  }

  return (
    <div className="rq-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="rq-header">
        <h1>
          <FaClock />
          My Leave &amp; Permission
        </h1>

        <p>
          Apply for leave or permission. Requests go to the
          Head of Department for approval
        </p>
      </div>


      {message && (
        <div className={`rq-notice ${messageType}`}>
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

      <div className="rq-stats">

        <div className="rq-stat-card">
          <div className="rq-stat-icon pending">
            <FaClock />
          </div>

          <div>
            <span>Pending</span>
            <strong>{counts.pending}</strong>
          </div>
        </div>

        <div className="rq-stat-card">
          <div className="rq-stat-icon approved">
            <FaCheckCircle />
          </div>

          <div>
            <span>Approved</span>
            <strong>{counts.approved}</strong>
          </div>
        </div>

        <div className="rq-stat-card">
          <div className="rq-stat-icon rejected">
            <FaTimesCircle />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{counts.rejected}</strong>
          </div>
        </div>

        <div className="rq-stat-card">
          <div className="rq-stat-icon leave">
            <FaCalendarCheck />
          </div>

          <div>
            <span>Leaves</span>
            <strong>{counts.leave}</strong>
          </div>
        </div>

        <div className="rq-stat-card">
          <div className="rq-stat-icon bonafide">
            <FaKey />
          </div>

          <div>
            <span>Permissions</span>
            <strong>{counts.permission}</strong>
          </div>
        </div>

      </div>


      {/* ===================================================
          APPLY FORM
      =================================================== */}

      <div className="rq-apply">

        <div className="rq-apply-header">
          <FaPlus />
          <h2>New Request</h2>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="rq-type-toggle">

            <button
              type="button"
              className={
                form.type === "leave" ? "active" : ""
              }
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  type: "leave",
                }))
              }
            >
              <FaCalendarCheck />
              Leave
            </button>

            <button
              type="button"
              className={
                form.type === "permission" ? "active" : ""
              }
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  type: "permission",
                }))
              }
            >
              <FaKey />
              Permission
            </button>

          </div>


          {form.type === "leave" ? (
            <div className="rq-form-grid">

              <div className="rq-field">
                <label>Leave Type</label>

                <select
                  value={form.leaveType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      leaveType: e.target.value,
                    }))
                  }
                >
                  {LEAVE_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rq-field">
                <label>From Date</label>

                <input
                  type="date"
                  min={today}
                  value={form.fromDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      fromDate: e.target.value,
                    }))
                  }
                />

                {errors.fromDate && (
                  <small className="rq-error">
                    {errors.fromDate}
                  </small>
                )}
              </div>

              <div className="rq-field">
                <label>To Date</label>

                <input
                  type="date"
                  min={form.fromDate || today}
                  value={form.toDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      toDate: e.target.value,
                    }))
                  }
                />

                {errors.toDate && (
                  <small className="rq-error">
                    {errors.toDate}
                  </small>
                )}
              </div>

            </div>
          ) : (
            <div className="rq-form-grid">

              <div className="rq-field">
                <label>Permission Type</label>

                <select
                  value={form.permissionType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      permissionType: e.target.value,
                    }))
                  }
                >
                  {PERMISSION_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          )}


          <div className="rq-field">
            <label>Reason</label>

            <textarea
              rows="3"
              placeholder="Explain your request in at least 10 characters"
              value={form.reason}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
            />

            {errors.reason && (
              <small className="rq-error">
                {errors.reason}
              </small>
            )}
          </div>


          <button
            type="submit"
            className="rq-submit"
            disabled={saving}
          >
            <FaPaperPlane />
            {saving
              ? "Submitting..."
              : form.type === "leave"
              ? "Apply for Leave"
              : "Request Permission"}
          </button>

        </form>
      </div>


      {/* ===================================================
          MY REQUESTS
      =================================================== */}

      <div className="rq-list-section">

        <div className="rq-list-header">

          <div className="rq-tabs">

            <button
              className={tab === "leave" ? "active" : ""}
              onClick={() => setTab("leave")}
            >
              <FaCalendarCheck />
              Leave
              <span className="rq-count">
                {counts.leave}
              </span>
            </button>

            <button
              className={
                tab === "permission" ? "active" : ""
              }
              onClick={() => setTab("permission")}
            >
              <FaKey />
              Permission
              <span className="rq-count">
                {counts.permission}
              </span>
            </button>
          </div>


          <div className="rq-filter">
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


        {filtered.length === 0 ? (
          <div className="rq-empty">
            <FaClock />
            <span>
              No {tab} requests yet.
            </span>
            <small>
              Use the form above to submit one.
            </small>
          </div>
        ) : (
          <div className="rq-cards">

            {filtered.map((request) => (
              <div
                className="rq-card"
                key={request._id}
              >

                <div className="rq-card-top">
                  <div className="rq-card-icon">
                    {request.type === "leave" ? (
                      <FaCalendarCheck />
                    ) : (
                      <FaKey />
                    )}
                  </div>

                  <div className="rq-card-heading">
                    <strong>
                      {request.type === "leave"
                        ? request.leaveType
                        : request.permissionType}
                    </strong>

                    <span>
                      Applied on{" "}
                      {formatDate(request.createdAt)}
                    </span>
                  </div>

                  {getStatusBadge(request.status)}
                </div>


                <div className="rq-card-details">

                  {request.type === "leave" ? (
                    <>
                      <div>
                        <span>
                          <FaClock />
                          Duration
                        </span>
                        <strong>
                          {leaveDays(request)}{" "}
                          day(s)
                        </strong>
                      </div>

                      <div>
                        <span>
                          <FaCalendarCheck />
                          Dates
                        </span>
                        <strong>
                          {formatDate(
                            request.fromDate
                          )}{" "}
                          -{" "}
                          {formatDate(request.toDate)}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <div>
                      <span>
                        <FaKey />
                        Permission Type
                      </span>
                      <strong>
                        {request.permissionType}
                      </strong>
                    </div>
                  )}

                </div>


                <div className="rq-reason">
                  <span>
                    <FaStickyNote />
                    Reason
                  </span>

                  <p>{request.reason}</p>
                </div>


                {request.hodRemark && (
                  <div className="rq-remark">
                    <span>
                      <FaUserTie />
                      HOD Remark
                    </span>

                    <p>{request.hodRemark}</p>
                  </div>
                )}


                <div className="rq-card-actions">

                  <button
                    className="rq-view-btn"
                    onClick={() => setSelected(request)}
                  >
                    <FaEye />
                    Details
                  </button>

                  {request.status === "pending" && (
                    <button
                      className="rq-cancel-btn"
                      onClick={() =>
                        handleCancel(request)
                      }
                      disabled={saving}
                    >
                      <FaBan />
                      Cancel
                    </button>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </div>


      {/* ===================================================
          DETAILS MODAL
      =================================================== */}

      {selected && (
        <div
          className="rq-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="rq-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="rq-modal-close"
              onClick={() => setSelected(null)}
            >
              <FaTimes />
            </button>

            <div
              className={`rq-modal-icon ${
                selected.type === "leave"
                  ? "leave"
                  : "bonafide"
              }`}
            >
              {selected.type === "leave" ? (
                <FaCalendarCheck />
              ) : (
                <FaKey />
              )}
            </div>

            <h2>
              {selected.type === "leave"
                ? "Leave Request"
                : "Permission Request"}
            </h2>

            <p className="rq-modal-sub">
              Applied on{" "}
              {formatDate(selected.createdAt)}
            </p>

            <div className="rq-modal-status">
              {getStatusBadge(selected.status)}
            </div>

            <div className="rq-modal-details">

              {selected.type === "leave" ? (
                <>
                  <div className="rq-detail">
                    <span>Leave Type</span>
                    <strong>
                      {selected.leaveType}
                    </strong>
                  </div>

                  <div className="rq-detail">
                    <span>From Date</span>
                    <strong>
                      {formatDate(selected.fromDate)}
                    </strong>
                  </div>

                  <div className="rq-detail">
                    <span>To Date</span>
                    <strong>
                      {formatDate(selected.toDate)}
                    </strong>
                  </div>

                  <div className="rq-detail">
                    <span>Duration</span>
                    <strong>
                      {leaveDays(selected)} day(s)
                    </strong>
                  </div>
                </>
              ) : (
                <div className="rq-detail">
                  <span>Permission Type</span>
                  <strong>
                    {selected.permissionType}
                  </strong>
                </div>
              )}

              <div className="rq-detail span2">
                <span>Reason</span>
                <strong>
                  {selected.reason}
                </strong>
              </div>

              {selected.hodRemark && (
                <div className="rq-detail span2">
                  <span>HOD Remark</span>
                  <strong>
                    {selected.hodRemark}
                  </strong>
                </div>
              )}

              {selected.actionedByName && (
                <div className="rq-detail span2">
                  <span>Actioned By</span>
                  <strong>
                    {selected.actionedByName}{" "}
                    (
                    {formatDate(selected.actionedAt)}
                    )
                  </strong>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyLeave;
