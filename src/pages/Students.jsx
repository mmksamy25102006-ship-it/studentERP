import React, { useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaExclamationTriangle,
} from "react-icons/fa";
import API from "../api";
import "./Students.css";

const initialFormData = {
  studentId: "",
  name: "",
  department: "CSE",
  year: "I",
  cgpa: "",
  phone: "",
};

const Students = () => {
  // ==============================
  // STATE
  // ==============================

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  // ==============================
  // FETCH STUDENTS
  // ==============================

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/students");

      console.log("Students API response:", response.data);

      // Backend returns an array
      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else if (Array.isArray(response.data.students)) {
        setStudents(response.data.students);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("FETCH STUDENTS ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load students. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ==============================
  // SEARCH
  // ==============================

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    return (
      student.studentId?.toLowerCase().includes(searchText) ||
      student.name?.toLowerCase().includes(searchText) ||
      student.department?.toLowerCase().includes(searchText)
    );
  });

  // ==============================
  // FORM INPUT
  // ==============================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // OPEN ADD MODAL
  // ==============================

  const handleAddStudent = () => {
    setEditingStudent(null);
    setFormData(initialFormData);
    setError("");
    setShowModal(true);
  };

  // ==============================
  // OPEN EDIT MODAL
  // ==============================

  const handleEditStudent = (student) => {
    setEditingStudent(student);

    setFormData({
      studentId: student.studentId || "",
      name: student.name || "",
      department: student.department || "CSE",
      year: student.year || "I",
      cgpa: student.cgpa ?? "",
      phone: student.phone || "",
    });

    setError("");
    setShowModal(true);
  };

  // ==============================
  // CLOSE MODAL
  // ==============================

  const handleCloseModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingStudent(null);
    setFormData(initialFormData);
    setError("");
  };

  // ==============================
  // SUBMIT ADD / EDIT
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      // Convert values into backend-friendly format
      const studentData = {
        studentId: formData.studentId.trim().toUpperCase(),

        name: formData.name.trim(),

        department: formData.department.trim().toUpperCase(),

        // Convert "I Year" -> "I"
        year: formData.year
          .replace(/\s*Year\s*/i, "")
          .trim()
          .toUpperCase(),

        cgpa: Number(formData.cgpa),

        phone: formData.phone.trim(),
      };

      console.log("Sending student data:", studentData);

      // ==========================
      // UPDATE
      // ==========================

      if (editingStudent) {
        const response = await API.put(
          `/students/${editingStudent._id}`,
          studentData
        );

        console.log("UPDATE RESPONSE:", response.data);

        // Update local list immediately
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student._id === editingStudent._id
              ? response.data.student
              : student
          )
        );
      }

      // ==========================
      // ADD
      // ==========================

      else {
        const response = await API.post("/students", studentData);

        console.log("ADD RESPONSE:", response.data);

        // Add new student to the beginning
        if (response.data.student) {
          setStudents((prevStudents) => [
            response.data.student,
            ...prevStudents,
          ]);
        } else {
          // Fallback: reload from database
          await fetchStudents();
        }
      }

      // Close modal
      setShowModal(false);
      setEditingStudent(null);
      setFormData(initialFormData);
      setError("");
    } catch (err) {
      console.error("SAVE STUDENT ERROR:", err);

      console.error("Backend response:", err.response?.data);

      // Show actual backend error
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save student. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // OPEN DELETE MODAL
  // ==============================

  const handleDeleteClick = (student) => {
    setDeletingStudent(student);
    setError("");
    setShowDeleteModal(true);
  };

  // ==============================
  // CLOSE DELETE MODAL
  // ==============================

  const handleCloseDeleteModal = () => {
    if (submitting) return;

    setShowDeleteModal(false);
    setDeletingStudent(null);
    setError("");
  };

  // ==============================
  // DELETE STUDENT
  // ==============================

  const handleDeleteStudent = async () => {
    if (!deletingStudent?._id) return;

    try {
      setSubmitting(true);
      setError("");

      console.log("Deleting student:", deletingStudent._id);

      const response = await API.delete(
        `/students/${deletingStudent._id}`
      );

      console.log("DELETE RESPONSE:", response.data);

      // Remove from UI
      setStudents((prevStudents) =>
        prevStudents.filter(
          (student) => student._id !== deletingStudent._id
        )
      );

      setShowDeleteModal(false);
      setDeletingStudent(null);
    } catch (err) {
      console.error("DELETE STUDENT ERROR:", err);

      console.error("Backend response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete student. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // FORMAT CGPA
  // ==============================

  const formatCGPA = (cgpa) => {
    const value = Number(cgpa);

    if (Number.isNaN(value)) {
      return "0.00";
    }

    return value.toFixed(2);
  };

  // ==============================
  // PAGE
  // ==============================

  return (
    <div className="students-page">

      {/* =========================================
          TOP TOOLBAR
      ========================================= */}

      <div className="top-toolbar">

        {/* TITLE */}

        <div className="students-title">
          <div className="students-title-icon">
            <FaUserGraduate />
          </div>

          <div>
            <h1>Student Management</h1>
            <p>Manage student records efficiently</p>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="toolbar-right">

          <div className="student-count">
            <span>Total Students:</span>
            <strong>{students.length}</strong>
          </div>

          <button
            type="button"
            className="add-student-btn"
            onClick={handleAddStudent}
          >
            <FaPlus />
            <span>Add Student</span>
          </button>

        </div>
      </div>

      {/* =========================================
          SEARCH
      ========================================= */}

      <div className="search-container">

        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search by Student ID, Name or Department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            type="button"
            className="search-clear"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}

      </div>

      {/* =========================================
          ERROR MESSAGE
      ========================================= */}

      {error && !showModal && !showDeleteModal && (
        <div className="students-error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* =========================================
          TABLE
      ========================================= */}

      <div className="students-table-wrapper">

        <table className="students-table">

          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>CGPA</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {/* LOADING */}

            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="no-data"
                >
                  Loading students...
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (

              /* NO STUDENTS */

              <tr>
                <td
                  colSpan="7"
                  className="no-data"
                >
                  {search
                    ? "No students match your search."
                    : "No students found."}
                </td>
              </tr>

            ) : (

              /* STUDENTS */

              filteredStudents.map((student) => (

                <tr key={student._id}>

                  <td>
                    <strong>
                      {student.studentId}
                    </strong>
                  </td>

                  <td>
                    {student.name}
                  </td>

                  <td>
                    <span className="department-badge">
                      {student.department}
                    </span>
                  </td>

                  <td>
                    {student.year}
                  </td>

                  <td>
                    <span className="cgpa-badge">
                      {formatCGPA(student.cgpa)}
                    </span>
                  </td>

                  <td>
                    {student.phone}
                  </td>

                  <td>

                    <div className="action-buttons">

                      {/* EDIT */}

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() =>
                          handleEditStudent(student)
                        }
                        title="Edit Student"
                      >
                        <FaEdit />
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() =>
                          handleDeleteClick(student)
                        }
                        title="Delete Student"
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

      {/* =========================================
          ADD / EDIT MODAL
      ========================================= */}

      {showModal && (
        <div
          className="student-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >

          <div
            className="student-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="student-modal-header">

              <div>
                <h2>
                  {editingStudent
                    ? "Edit Student"
                    : "Add Student"}
                </h2>

                <p>
                  {editingStudent
                    ? "Update the student details below"
                    : "Enter the student details below"}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                disabled={submitting}
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="student-form"
            >

              <div className="student-form-grid">

                {/* STUDENT ID */}

                <div className="form-group">

                  <label htmlFor="studentId">
                    Student ID
                  </label>

                  <input
                    id="studentId"
                    type="text"
                    name="studentId"
                    placeholder="Example: CSE001"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                    maxLength="20"
                    disabled={submitting}
                  />

                </div>

                {/* NAME */}

                <div className="form-group">

                  <label htmlFor="name">
                    Student Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter student name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    maxLength="100"
                    disabled={submitting}
                  />

                </div>

                {/* DEPARTMENT */}

                <div className="form-group">

                  <label htmlFor="department">
                    Department
                  </label>

                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="AI & DS">
                      AI &amp; DS
                    </option>
                  </select>

                </div>

                {/* YEAR */}

                <div className="form-group">

                  <label htmlFor="year">
                    Year
                  </label>

                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    disabled={submitting}
                  >
                    <option value="I">
                      I Year
                    </option>

                    <option value="II">
                      II Year
                    </option>

                    <option value="III">
                      III Year
                    </option>

                    <option value="IV">
                      IV Year
                    </option>
                  </select>

                </div>

                {/* CGPA */}

                <div className="form-group">

                  <label htmlFor="cgpa">
                    CGPA
                  </label>

                  <input
                    id="cgpa"
                    type="number"
                    name="cgpa"
                    placeholder="Example: 8.74"
                    value={formData.cgpa}
                    onChange={handleInputChange}
                    required
                    min="0"
                    max="10"
                    step="0.01"
                    disabled={submitting}
                  />

                </div>

                {/* PHONE */}

                <div className="form-group">

                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="10 digit phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    maxLength="10"
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    disabled={submitting}
                  />

                </div>

              </div>

              {/* MODAL ERROR */}

              {error && (
                <div className="modal-error">
                  <FaExclamationTriangle />
                  <span>{error}</span>
                </div>
              )}

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={submitting}
                >

                  {submitting ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave />
                      {editingStudent
                        ? "Update Student"
                        : "Add Student"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =========================================
          DELETE CONFIRMATION MODAL
      ========================================= */}

      {showDeleteModal && deletingStudent && (
        <div
          className="student-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDeleteModal();
            }
          }}
        >

          <div
            className="student-modal delete-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >

            {/* HEADER */}

            <div className="student-modal-header">

              <div>
                <h2>Delete Student</h2>

                <p>
                  This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseDeleteModal}
                disabled={submitting}
              >
                <FaTimes />
              </button>

            </div>

            {/* CONTENT */}

            <div className="delete-content">

              <div className="delete-warning-icon">
                <FaExclamationTriangle />
              </div>

              <p>
                Are you sure you want to delete this student?
              </p>

              <div className="delete-student-info">

                <strong>
                  {deletingStudent.name}
                </strong>

                <span>
                  {deletingStudent.studentId}
                </span>

              </div>

            </div>

            {/* DELETE ERROR */}

            {error && (
              <div className="modal-error">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            )}

            {/* ACTIONS */}

            <div className="modal-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={handleCloseDeleteModal}
                disabled={submitting}
              >
                <FaTimes />
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-btn"
                onClick={handleDeleteStudent}
                disabled={submitting}
              >

                {submitting ? (
                  <>
                    <span className="button-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash />
                    Delete Student
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Students;