// src/pages/Assignments.jsx

import React, { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaCalendarAlt,
  FaBookOpen,
  FaClock,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import API from "../api";

import "./Assignments.css";

const Assignments = () => {
  const { user, loading: authLoading } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================
     LOGGED-IN STUDENT ID
  ========================================== */

  const studentId =
    user?.studentId ||
    localStorage.getItem("studentId") ||
    localStorage.getItem("rollNo") ||
    null;

  /* ==========================================
     LOAD ASSIGNMENTS
  ========================================== */

  useEffect(() => {
    const loadAssignments = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setLoading(false);
        setError("Please login to view your assignments.");
        return;
      }

      if (user.role !== "student") {
        setLoading(false);
        setError(
          "Only student accounts can view assignments."
        );
        return;
      }

      if (!studentId) {
        setLoading(false);
        setError(
          "Student ID is not available for this account."
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
          Get assignments for the
          logged-in student.

          Example:
          /api/assignments/student/STU001
        */

        const response = await API.get(
          `/assignments/student/${encodeURIComponent(studentId)}`
        );

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.assignments || [];

        setAssignments(data);

        /*
          Keep a local backup.
        */

        localStorage.setItem(
          "myAssignments",
          JSON.stringify(data)
        );
      } catch (err) {
        console.error(
          "Student assignment loading error:",
          err
        );

        /*
          Try local backup if server
          is temporarily unavailable.
        */

        try {
          const localData = JSON.parse(
            localStorage.getItem("myAssignments")
          );

          if (Array.isArray(localData)) {
            setAssignments(localData);
          } else {
            setAssignments([]);
          }
        } catch (localError) {
          console.error(
            "Local assignment loading error:",
            localError
          );

          setAssignments([]);
        }

        setError(
          err.response?.data?.message ||
            "Unable to load assignments from server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [authLoading, user, studentId]);

  /* ==========================================
     DATE HELPERS
  ========================================== */

  const getDueDate = (dueDate) => {
    if (!dueDate) {
      return "No due date";
    }

    return new Date(dueDate).toLocaleDateString();
  };

  const isExpired = (dueDate) => {
    if (!dueDate) {
      return false;
    }

    return new Date(dueDate) < new Date();
  };

  /* ==========================================
     LOADING
  ========================================== */

  if (loading || authLoading) {
    return (
      <div className="student-assignment-page">

        <div className="assignment-header">

          <h1>
            <FaClipboardList />
            My Assignments
          </h1>

          <p>
            Loading your assignments...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="student-assignment-page">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="assignment-header">

        <h1>
          <FaClipboardList />
          My Assignments
        </h1>

        <p>
          Assignments given by faculty
        </p>

      </div>


      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#fee2e2",
            color: "#991b1b",
            fontWeight: "600",
          }}
        >
          {error}
        </div>
      )}


      {/* ==========================================
          ASSIGNMENTS
      ========================================== */}

      {assignments.length === 0 ? (

        <div
          className="assignment-card"
          style={{
            textAlign: "center",
            padding: "40px",
          }}
        >

          <FaClipboardList
            style={{
              fontSize: "40px",
              marginBottom: "15px",
            }}
          />

          <h2>
            No Assignments
          </h2>

          <p>
            No assignments have been given
            to you yet.
          </p>

        </div>

      ) : (

        <div className="assignment-grid">

          {assignments.map((item) => {

            const assignmentId =
              item._id || item.id;

            const expired =
              isExpired(item.dueDate);

            return (

              <div
                className="assignment-card"
                key={assignmentId}
              >

                {/* ==================================
                    TITLE
                ================================== */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >

                  <FaClipboardList />

                  <h2>
                    {item.title}
                  </h2>

                </div>


                {/* ==================================
                    SUBJECT
                ================================== */}

                <h4>

                  <FaBookOpen
                    style={{
                      marginRight: "6px",
                    }}
                  />

                  Subject:{" "}
                  {item.subject}

                </h4>


                {/* ==================================
                    DESCRIPTION
                ================================== */}

                <p>
                  {item.description ||
                    "No description provided."}
                </p>


                {/* ==================================
                    DUE DATE
                ================================== */}

                <span>

                  <FaCalendarAlt
                    style={{
                      marginRight: "6px",
                    }}
                  />

                  Due Date:{" "}
                  {getDueDate(item.dueDate)}

                </span>


                {/* ==================================
                    STATUS
                ================================== */}

                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontWeight: "600",
                  }}
                >

                  <FaClock />

                  {expired
                    ? "Expired"
                    : "Active"}

                </div>

              </div>

            );
          })}

        </div>

      )}

    </div>
  );
};

export default Assignments;
