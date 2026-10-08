import { useEffect, useState } from "react";
import {
  FaChalkboardTeacher,
  FaIdCard,
  FaUserTie,
  FaGraduationCap,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaPen,
  FaSave,
  FaTimes,
} from "react-icons/fa";

import API from "./../api";
import { useAuth } from "./../context/AuthContext";

import "./FacultyProfile.css";

const FacultyProfile = () => {
  const { user, loading: authLoading, updateUser } =
    useAuth();

  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Only these three are editable. Faculty ID, department,
  // designation and email come from the college office, so
  // the form does not offer them and the server ignores
  // anything else it is handed.
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    experience: "",
  });

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");

  useEffect(() => {
    // The identity comes from the login session, so wait for
    // AuthContext to finish restoring it before looking for
    // an ID. Reading storage during that window is how the
    // page ended up loading somebody else's record.
    if (authLoading) {
      return;
    }

    const facultyError = (message) => {
      setFaculty(null);
      setError(message);
      setLoading(false);
    };

    const fetchProfile = async () => {
      try {
        let facultyData = null;

        // 1. The signed-in account, identified by the token.
        //
        //    A facultyId is only a lookup key, not an
        //    identity: two accounts have shared one before,
        //    and the page then rendered somebody else
        //    entirely. The token always names the right row,
        //    even when the id in storage is stale or empty.
        try {
          const response = await API.get("/auth/profile");

          facultyData = response.data?.user || null;
        } catch (profileError) {
          console.error(
            "Auth Profile Error:",
            profileError
          );
        }

        // 2. Fallback for a session saved before this page
        //    switched over: resolve the stored facultyId.
        if (!facultyData) {
          const facultyId =
            user?.facultyId ||
            localStorage.getItem("facultyId") ||
            "";

          if (facultyId) {
            // Dedicated faculty profile endpoint
            try {
              const response = await API.get(
                `/faculty/${encodeURIComponent(facultyId)}`
              );

              facultyData = response.data?.faculty || null;
            } catch (endpointError) {
              console.error(
                "Faculty Profile Endpoint Error:",
                endpointError
              );
            }

            // Last resort: match inside the faculty list
            if (!facultyData) {
              const listResponse = await API.get(
                "/faculty"
              );

              const list = Array.isArray(
                listResponse.data
              )
                ? listResponse.data
                : listResponse.data?.faculty || [];

              const target = String(
                facultyId
              ).toLowerCase();

              facultyData =
                list.find(
                  (item) =>
                    String(item.facultyId || "")
                      .toLowerCase() === target
                ) || null;
            }
          }
        }

        if (!facultyData) {
          facultyError(
            "Unable to identify the signed-in account. Sign out and sign in again."
          );

          return;
        }

        setFaculty(facultyData);
        setError("");
        setLoading(false);
      } catch (fetchError) {
        console.error(
          "Faculty Profile Error:",
          fetchError
        );

        facultyError(
          "Unable to load your faculty information"
        );
      }
    };

    fetchProfile();
  }, [authLoading, user?.facultyId]);

  // ===================================================
  // EDITING
  // ===================================================

  const startEdit = () => {
    setForm({
      name: faculty?.name || "",
      phone: faculty?.phone || "",
      experience: faculty?.experience || "",
    });

    setNotice("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setNotice("");
    setNoticeType("success");
  };

  const onField = (field) => (event) => {
    const value = event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (noticeType === "error" && value.trim()) {
      setNotice("");
      setNoticeType("success");
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setNoticeType("error");
      setNotice("Full name is required");
      return;
    }

    setSaving(true);

    try {
      const response = await API.put("/faculty/me", {
        name,
        phone: form.phone.trim(),
        experience: form.experience.trim(),
      });

      const saved = response.data?.faculty || {};

      setFaculty((current) => ({
        ...current,
        ...saved,
      }));

      setEditing(false);
      setNoticeType("success");
      setNotice(
        response.data?.message || "Profile updated"
      );

      // Keep the sidebar and header in step without a
      // re-login.
      updateUser({
        name: saved.name || name,
        phone: saved.phone ?? form.phone.trim(),
      });
    } catch (saveError) {
      console.error(
        "Faculty Profile Save Error:",
        saveError
      );

      setNoticeType("error");
      setNotice(
        saveError.response?.data?.message ||
          "Unable to save your changes"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  if (loading || authLoading) {
    return (
      <div className="faculty-profile-page">
        <div className="faculty-profile-loading">
          Loading Profile...
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="faculty-profile-page">
        <div className="faculty-profile-error">
          <FaExclamationCircle />

          <h2>Faculty Profile Not Found</h2>

          <p>{error}</p>
        </div>
      </div>
    );
  }

  const isActive = faculty.isActive !== false;

  return (
    <div className="faculty-profile-page">

      {/* HEADER */}
      <div className="faculty-profile-cover">

        <div className="faculty-profile-avatar-large">
          <FaChalkboardTeacher />
        </div>

        <div className="faculty-profile-main-info">
          <h1>
            {editing ? form.name || faculty.name : faculty.name}
          </h1>

          <p>
            <FaIdCard />
            {faculty.facultyId || "Not Provided"}
          </p>

          <div className="faculty-profile-badges">
            <span className="faculty-profile-status">
              {isActive
                ? "Active Faculty"
                : "Inactive Faculty"}
            </span>

            {faculty.designation && (
              <span className="faculty-profile-designation">
                {faculty.designation}
              </span>
            )}
          </div>
        </div>

        {!editing && (
          <button
            type="button"
            className="faculty-profile-edit-btn"
            onClick={startEdit}
          >
            <FaPen />
            Edit Profile
          </button>
        )}

      </div>

      {notice && (
        <div
          className={`faculty-profile-notice ${noticeType}`}
        >
          {noticeType === "error" ? (
            <FaExclamationCircle />
          ) : (
            <FaCheckCircle />
          )}

          <span>{notice}</span>

          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice("")}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* INFORMATION */}
      <div className="faculty-profile-content">

        <div className="faculty-profile-section">

          <div className="faculty-section-title">
            <FaIdCard />
            <h2>
              {editing
                ? "Edit Profile"
                : "Faculty Information"}
            </h2>
          </div>

          {editing ? (
            <form
              className="faculty-profile-form"
              onSubmit={saveProfile}
            >
              <label>
                <span>Full Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={onField("name")}
                  placeholder="Your full name"
                  disabled={saving}
                />
              </label>

              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={onField("phone")}
                  placeholder="Contact number"
                  disabled={saving}
                />
              </label>

              <label>
                <span>Experience</span>
                <input
                  type="text"
                  value={form.experience}
                  onChange={onField("experience")}
                  placeholder="e.g. 8 years"
                  disabled={saving}
                />
              </label>

              <p className="faculty-profile-form-note">
                Faculty ID, department, designation and
                email are issued by the college office and
                cannot be changed here.
              </p>

              <div className="faculty-profile-form-actions">
                <button
                  type="button"
                  className="faculty-profile-cancel-btn"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="faculty-profile-save-btn"
                  disabled={saving}
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="faculty-profile-grid">

              <div className="faculty-profile-info-card">
                <FaIdCard />

                <div>
                  <span>Faculty ID</span>
                  <strong>
                    {faculty.facultyId || "Not Provided"}
                  </strong>
                </div>
              </div>

              <div className="faculty-profile-info-card">
                <FaUserTie />

                <div>
                  <span>Full Name</span>
                  <strong>
                    {faculty.name || "Not Provided"}
                  </strong>
                </div>
              </div>

              <div className="faculty-profile-info-card">
                <FaGraduationCap />

                <div>
                  <span>Department</span>
                  <strong>
                    {faculty.department || "Not Provided"}
                  </strong>
                </div>
              </div>

              <div className="faculty-profile-info-card">
                <FaBriefcase />

                <div>
                  <span>Designation</span>
                  <strong>
                    {faculty.designation || "Not Provided"}
                  </strong>
                </div>
              </div>

              <div className="faculty-profile-info-card">
                <FaClock />

                <div>
                  <span>Experience</span>
                  <strong>
                    {faculty.experience || "Not Provided"}
                  </strong>
                </div>
              </div>

              <div className="faculty-profile-info-card">
                <FaEnvelope />

                <div>
                  <span>Email</span>
                  <strong>
                    {faculty.email || "Not Provided"}
                  </strong>
                </div>
              </div>

              <div className="faculty-profile-info-card">
                <FaPhone />

                <div>
                  <span>Phone</span>
                  <strong>
                    {faculty.phone || "Not Provided"}
                  </strong>
                </div>
              </div>

              <div className="faculty-profile-info-card">
                {isActive ? (
                  <FaCheckCircle />
                ) : (
                  <FaExclamationCircle />
                )}

                <div>
                  <span>Account Status</span>
                  <strong>
                    {isActive ? "Active" : "Inactive"}
                  </strong>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default FacultyProfile;
