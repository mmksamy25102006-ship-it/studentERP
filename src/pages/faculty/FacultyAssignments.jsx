// src/pages/faculty/FacultyAssignments.jsx

import React, { useEffect, useState } from "react";

import {
  FaPlus,
  FaClipboardList,
  FaBookOpen,
  FaCalendarAlt,
  FaAlignLeft,
  FaTrash,
  FaArrowRight,
  FaUsers,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import API from "../../api";

import "./FacultyAssignments.css";

const FacultyAssignments = () => {
  const { user, loading: authLoading } = useAuth();

  const [assignment, setAssignment] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
  });

  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================
     FACULTY ID
  ========================================== */

  const facultyId =
    user?.facultyId ||
    localStorage.getItem("facultyId") ||
    null;

  /* ==========================================
     LOAD ASSIGNMENTS + STUDENTS
  ========================================== */

  useEffect(() => {
    const loadData = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setLoading(false);
        setStudentsLoading(false);
        setError("Please login to manage assignments.");
        return;
      }

      if (user.role !== "faculty") {
        setLoading(false);
        setStudentsLoading(false);
        setError(
          "Only faculty accounts can manage assignments."
        );
        return;
      }

      if (!facultyId) {
        setLoading(false);
        setStudentsLoading(false);
        setError(
          "Faculty ID is not available for this account."
        );
        return;
      }

      try {
        setLoading(true);
        setStudentsLoading(true);
        setError("");

        /* ==========================================
           LOAD FACULTY ASSIGNMENTS
        ========================================== */

        const assignmentResponse = await API.get(
          `/assignments/faculty/${encodeURIComponent(
            facultyId
          )}`
        );

        const assignmentData = Array.isArray(
          assignmentResponse.data
        )
          ? assignmentResponse.data
          : assignmentResponse.data?.assignments || [];

        setAssignments(assignmentData);

        localStorage.setItem(
          "assignments",
          JSON.stringify(assignmentData)
        );

        /* ==========================================
           LOAD STUDENTS
        ========================================== */

        const studentResponse = await API.get("/students");

        const studentData = Array.isArray(
          studentResponse.data
        )
          ? studentResponse.data
          : studentResponse.data?.students || [];

        setStudents(studentData);
      } catch (err) {
        console.error("Assignment loading error:", err);

        /* ==========================================
           LOCAL ASSIGNMENT BACKUP
        ========================================== */

        try {
          const localData = JSON.parse(
            localStorage.getItem("assignments")
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

        setStudents([]);

        setError(
          err.response?.data?.message ||
            "Unable to load assignments or students from server."
        );
      } finally {
        setLoading(false);
        setStudentsLoading(false);
      }
    };

    loadData();
  }, [authLoading, user, facultyId]);

  /* ==========================================
     FORM CHANGE
  ========================================== */

  const handleChange = (e) => {
    setAssignment({
      ...assignment,
      [e.target.name]: e.target.value,
    });
  };

  /* ==========================================
     STUDENT ID
  ========================================== */

  const getStudentId = (student) => {
    return (
      student.studentId ||
      student.rollNo ||
      student.id ||
      student._id
    );
  };

  /* ==========================================
     STUDENT SELECTION
  ========================================== */

  const handleStudentSelection = (studentId) => {
    setSelectedStudents((previous) => {
      if (previous.includes(studentId)) {
        return previous.filter(
          (id) => id !== studentId
        );
      }

      return [...previous, studentId];
    });
  };

  const selectAllStudents = () => {
    const allStudentIds = students
      .map((student) => getStudentId(student))
      .filter(Boolean);

    setSelectedStudents(allStudentIds);
  };

  const clearSelectedStudents = () => {
    setSelectedStudents([]);
  };

  /* ==========================================
     CREATE ASSIGNMENT
  ========================================== */

  const addAssignment = async () => {
    if (
      !assignment.title.trim() ||
      !assignment.subject.trim() ||
      !assignment.dueDate
    ) {
      alert("Please fill all required details");
      return;
    }

    if (!facultyId) {
      alert("Faculty ID is not available.");
      return;
    }

    if (selectedStudents.length === 0) {
      alert(
        "Please select at least one student for this assignment."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const newAssignmentData = {
        title: assignment.title.trim(),
        subject: assignment.subject.trim(),
        description: assignment.description.trim(),
        dueDate: assignment.dueDate,

        facultyId: facultyId,
        facultyName: user?.name || "",

        studentIds: selectedStudents,
      };

      const response = await API.post(
        "/assignments",
        newAssignmentData
      );

      const createdAssignment =
        response.data?.assignment ||
        response.data;

      const updatedAssignments = [
        ...assignments,
        createdAssignment,
      ];

      setAssignments(updatedAssignments);

      localStorage.setItem(
        "assignments",
        JSON.stringify(updatedAssignments)
      );

      /* Clear form */

      setAssignment({
        title: "",
        subject: "",
        description: "",
        dueDate: "",
      });

      /* Clear selected students */

      setSelectedStudents([]);

      alert("Assignment Created Successfully");
    } catch (err) {
      console.error(
        "Assignment creation error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create assignment."
      );

      alert("Failed to create assignment");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================
     DELETE ASSIGNMENT
  ========================================== */

  const deleteAssignment = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await API.delete(
        `/assignments/${encodeURIComponent(id)}`
      );

      const updatedAssignments =
        assignments.filter(
          (item) =>
            (item._id || item.id) !== id
        );

      setAssignments(updatedAssignments);

      localStorage.setItem(
        "assignments",
        JSON.stringify(updatedAssignments)
      );
    } catch (err) {
      console.error(
        "Assignment deletion error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete assignment."
      );

      alert("Failed to delete assignment");
    } finally {
      setDeletingId(null);
    }
  };

  /* ==========================================
     ACTIVE ASSIGNMENTS
  ========================================== */

  const activeAssignments = assignments.filter(
    (item) => {
      if (!item.dueDate) {
        return false;
      }

      return (
        new Date(item.dueDate) >=
        new Date()
      );
    }
  ).length;

  /* ==========================================
     LOADING
  ========================================== */

  if (loading || authLoading) {
    return (
      <div className="assignment-page">

        <div className="assignment-header">

          <div>

            <div className="assignment-breadcrumb">
              Faculty Dashboard
              <FaArrowRight />
              Assignments
            </div>

            <h1>
              <span className="header-icon">
                <FaClipboardList />
              </span>

              Assignments
            </h1>

            <p>
              Loading your assignments...
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="assignment-page">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="assignment-header">

        <div>

          <div className="assignment-breadcrumb">
            Faculty Dashboard
            <FaArrowRight />
            Assignments
          </div>

          <h1>

            <span className="header-icon">
              <FaClipboardList />
            </span>

            Assignments

          </h1>

          <p>
            Create, manage and track assignments
            for your students.
          </p>

        </div>

        <div className="assignment-count">

          <span>
            Total Assignments
          </span>

          <strong>
            {assignments.length}
          </strong>

        </div>

      </div>


      {/* ==========================================
          ERROR MESSAGE
      ========================================== */}

      {error && (
        <div className="assignment-error">
          {error}
        </div>
      )}


      {/* ==========================================
          CREATE SECTION
      ========================================== */}

      <div className="assignment-layout">

        {/* FORM */}

        <div className="assignment-form-card">

          <div className="section-title">

            <div className="section-icon">
              <FaPlus />
            </div>

            <div>

              <h2>
                Create New Assignment
              </h2>

              <p>
                Add a new task for your students
              </p>

            </div>

          </div>


          <div className="form-content">

            {/* TITLE */}

            <div className="input-group">

              <label>
                Assignment Title
                <span>*</span>
              </label>

              <div className="input-wrapper">

                <FaClipboardList />

                <input
                  name="title"
                  placeholder="Enter assignment title"
                  value={assignment.title}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* SUBJECT */}

            <div className="input-group">

              <label>
                Subject
                <span>*</span>
              </label>

              <div className="input-wrapper">

                <FaBookOpen />

                <input
                  name="subject"
                  placeholder="Enter subject name"
                  value={assignment.subject}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* DESCRIPTION */}

            <div className="input-group">

              <label>
                Description
              </label>

              <div className="textarea-wrapper">

                <FaAlignLeft />

                <textarea
                  name="description"
                  placeholder="Write assignment instructions..."
                  value={assignment.description}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* DATE */}

            <div className="input-group">

              <label>
                Due Date
                <span>*</span>
              </label>

              <div className="input-wrapper">

                <FaCalendarAlt />

                <input
                  type="date"
                  name="dueDate"
                  value={assignment.dueDate}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* ==========================================
                STUDENT SELECTION
            ========================================== */}

            <div className="input-group">

              <label>
                Assign To Students
                <span>*</span>
              </label>

              <div className="student-selection">

                {/* SELECTION HEADER */}

                <div className="student-selection-header">

                  <div className="student-selection-count">

                    <FaUsers />

                    <span>
                      {selectedStudents.length} student
                      {selectedStudents.length !== 1
                        ? "s"
                        : ""}{" "}
                      selected
                    </span>

                  </div>


                  <div className="student-selection-actions">

                    <button
                      type="button"
                      onClick={selectAllStudents}
                      className="student-action-btn"
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={clearSelectedStudents}
                      className="student-action-btn"
                    >
                      Clear
                    </button>

                  </div>

                </div>


                {/* STUDENTS */}

                {studentsLoading ? (

                  <p className="student-message">
                    Loading students...
                  </p>

                ) : students.length === 0 ? (

                  <p className="student-message">
                    No students found. Please add
                    students first.
                  </p>

                ) : (

                  <div className="student-list">

                    {students.map((student) => {

                      const studentId =
                        getStudentId(student);

                      if (!studentId) {
                        return null;
                      }

                      const isSelected =
                        selectedStudents.includes(
                          studentId
                        );

                      return (

                        <label
                          key={studentId}
                          className={`student-option ${
                            isSelected
                              ? "selected"
                              : ""
                          }`}
                        >

                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleStudentSelection(
                                studentId
                              )
                            }
                          />

                          <div className="student-option-info">

                            <strong>
                              {student.name ||
                                "Unnamed Student"}
                            </strong>

                            <span>
                              Student ID:{" "}
                              {studentId}
                            </span>

                          </div>

                        </label>

                      );
                    })}

                  </div>

                )}

              </div>

            </div>


            {/* CREATE BUTTON */}

            <button
              className="create-assignment-btn"
              onClick={addAssignment}
              disabled={
                saving ||
                selectedStudents.length === 0
              }
            >

              <FaPlus />

              {saving
                ? "Creating..."
                : "Create Assignment"}

            </button>

          </div>

        </div>


        {/* ==========================================
            INFO CARD
        ========================================== */}

        <div className="assignment-info-card">

          <div className="info-glow"></div>

          <div className="info-icon">
            <FaClipboardList />
          </div>

          <h3>
            Assignment Management
          </h3>

          <p>
            Create assignments and make them
            available to selected students through
            their dashboard.
          </p>

          <div className="info-stats">

            <div>

              <strong>
                {assignments.length}
              </strong>

              <span>
                Created
              </span>

            </div>

            <div>

              <strong>
                {activeAssignments}
              </strong>

              <span>
                Active
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ==========================================
          ASSIGNMENT LIST
      ========================================== */}

      <div className="assignment-list-section">

        <div className="list-header">

          <div>

            <h2>
              Created Assignments
            </h2>

            <p>
              Manage assignments created
              for your students
            </p>

          </div>

          <div className="list-badge">

            {assignments.length}
            {" "}
            Assignments

          </div>

        </div>


        {assignments.length === 0 ? (

          /* EMPTY */

          <div className="empty-assignment">

            <div className="empty-icon">
              <FaClipboardList />
            </div>

            <h3>
              No assignments yet
            </h3>

            <p>
              Create your first assignment
              using the form above.
            </p>

          </div>

        ) : (

          /* ASSIGNMENT GRID */

          <div className="assignment-grid">

            {assignments.map((item) => {

              const assignmentId =
                item._id || item.id;

              const isExpired =
                new Date(item.dueDate) <
                new Date();

              return (

                <div
                  className="assignment-card"
                  key={assignmentId}
                >

                  <div className="card-top">

                    <div className="subject-icon">
                      <FaBookOpen />
                    </div>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteAssignment(
                          assignmentId
                        )
                      }
                      disabled={
                        deletingId ===
                        assignmentId
                      }
                      title="Delete Assignment"
                    >

                      <FaTrash />

                    </button>

                  </div>


                  <div className="assignment-card-content">

                    <span className="subject-tag">
                      {item.subject}
                    </span>

                    <h3>
                      {item.title}
                    </h3>

                    <p className="assignment-description">

                      {item.description ||
                        "No description provided for this assignment."}

                    </p>

                  </div>


                  <div className="assignment-card-footer">

                    <div className="due-date">

                      <FaCalendarAlt />

                      <div>

                        <span>
                          Due Date
                        </span>

                        <strong>
                          {item.dueDate}
                        </strong>

                      </div>

                    </div>


                    <span
                      className={
                        isExpired
                          ? "assignment-status expired"
                          : "assignment-status active"
                      }
                    >

                      {isExpired
                        ? "Expired"
                        : "Active"}

                    </span>

                  </div>

                </div>

              );
            })}

          </div>

        )}

      </div>

    </div>
  );
};

export default FacultyAssignments;