// src/pages/hod/HodDepartment.jsx
//
// The faculty list for the HOD's own department. The
// server scopes it, so this page cannot be pointed at
// another department.

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaUsers,
  FaSearch,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChalkboardTeacher,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaExclamationCircle,
  FaBuilding,
} from "react-icons/fa";

import API from "./../../api";
import useAuth from "./../../hooks/useAuth";

import "./HodDepartment.css";

const HodDepartment = () => {
  const { user } = useAuth();

  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const department = user?.department || "";

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
      const response = await API.get(
        "/faculty/department/mine"
      );

      setFaculty(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Department Faculty Error:", error);

      notify(
        error.response?.status === 403
          ? "This account does not have Head of Department access."
          : error.response?.data?.message ||
            "Failed to load department faculty",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ===================================================
  // FILTER
  // ===================================================

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return faculty;
    }

    return faculty.filter((person) => {
      return (
        (person.name || "").toLowerCase().includes(term) ||
        (person.facultyId || "")
          .toLowerCase()
          .includes(term) ||
        (person.designation || "")
          .toLowerCase()
          .includes(term) ||
        (person.email || "")
          .toLowerCase()
          .includes(term)
      );
    });
  }, [faculty, search]);

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="hd-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="hd-header">
        <div>
          <h1>
            <FaBuilding />
            My Department
          </h1>

          <p>
            {department
              ? `Faculty members in ${department}`
              : "No department is set on your account"}
          </p>
        </div>

        <div className="hd-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search name, ID or designation"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>


      {message && (
        <div className={`hd-notice ${messageType}`}>
          {messageType === "error" ? (
            <FaExclamationTriangle />
          ) : (
            <FaExclamationCircle />
          )}
          {message}
        </div>
      )}


      {/* ===================================================
          LIST
      =================================================== */}

      {loading ? (
        <div className="hd-loading">
          <FaSyncAlt className="hd-spin" />
          Loading faculty...
        </div>
      ) : filtered.length === 0 ? (
        <div className="hd-empty">
          <FaChalkboardTeacher />
          <span>No faculty found</span>
          <small>
            {search.trim()
              ? "Try a different search term"
              : "No faculty are assigned to this department yet"}
          </small>
        </div>
      ) : (
        <div className="hd-grid">

          {filtered.map((person) => (
            <div
              className="hd-card"
              key={person._id}
            >

              <div className="hd-card-top">

                <div className="hd-avatar">
                  {(person.name || "F")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="hd-card-heading">
                  <strong>
                    {person.name || "Unknown"}
                  </strong>

                  <span>
                    {person.designation ||
                      "Faculty Member"}
                  </span>
                </div>

                {person.isHod && (
                  <span className="hd-badge">HOD</span>
                )}

              </div>


              <div className="hd-card-details">

                <div>
                  <span>
                    <FaIdCard />
                    Faculty ID
                  </span>
                  <strong>
                    {person.facultyId || "-"}
                  </strong>
                </div>

                {person.experience && (
                  <div>
                    <span>Experience</span>
                    <strong>
                      {person.experience}
                    </strong>
                  </div>
                )}

                {person.email && (
                  <div>
                    <span>
                      <FaEnvelope />
                      Email
                    </span>
                    <strong>
                      {person.email}
                    </strong>
                  </div>
                )}

                {person.phone && (
                  <div>
                    <span>
                      <FaPhone />
                      Phone
                    </span>
                    <strong>
                      {person.phone}
                    </strong>
                  </div>
                )}

              </div>

            </div>
          ))}

        </div>
      )}


      {/* ===================================================
          FOOTER COUNT
      =================================================== */}

      {!loading && faculty.length > 0 && (
        <div className="hd-count">
          <FaUsers />
          Showing {filtered.length} of {faculty.length}{" "}
          faculty members
        </div>
      )}

    </div>
  );
};

export default HodDepartment;
