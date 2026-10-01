import React, { useEffect, useState } from "react";
import axios from "axios";
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
} from "react-icons/fa";

import "./FacultyProfile.css";

const API_URL = "https://studenterp-5wuj.onrender.com/api";

const FacultyProfile = () => {
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const facultyError = (message) => {
      setFaculty(null);
      setError(message);
    };

    const fetchProfile = async () => {
      try {
        // Faculty identity from auth storage
        let facultyId =
          localStorage.getItem("facultyId") || "";

        if (!facultyId) {
          try {
            const savedUser = JSON.parse(
              localStorage.getItem("user") || "{}"
            );

            facultyId = savedUser.facultyId || "";
          } catch {
            facultyError("Unable to read saved login data");
            return;
          }
        }

        if (!facultyId) {
          facultyError("No faculty ID found for this login");
          return;
        }

        let facultyData = null;

        // Primary: dedicated faculty profile endpoint
        try {
          const response = await axios.get(
            `${API_URL}/faculty/${encodeURIComponent(facultyId)}`
          );

          facultyData = response.data?.faculty || null;
        } catch (endpointError) {
          console.error(
            "Faculty Profile Endpoint Error:",
            endpointError
          );
        }

        // Fallback: match inside the faculty list
        if (!facultyData) {
          const listResponse = await axios.get(
            `${API_URL}/faculty`
          );

          const list = Array.isArray(listResponse.data)
            ? listResponse.data
            : listResponse.data?.faculty || [];

          const target = String(facultyId).toLowerCase();

          facultyData =
            list.find(
              (item) =>
                String(item.facultyId || "")
                  .toLowerCase() === target
            ) || null;
        }

        if (!facultyData) {
          facultyError(
            "Faculty profile not found for this ID"
          );

          return;
        }

        setFaculty(facultyData);
        setError("");
      } catch (fetchError) {
        console.error("Faculty Profile Error:", fetchError);

        facultyError(
          "Unable to load your faculty information"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
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
          <h1>{faculty.name}</h1>

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

      </div>

      {/* INFORMATION */}
      <div className="faculty-profile-content">

        <div className="faculty-profile-section">

          <div className="faculty-section-title">
            <FaIdCard />
            <h2>Faculty Information</h2>
          </div>

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

        </div>

      </div>

    </div>
  );
};

export default FacultyProfile;
