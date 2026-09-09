import React, { useEffect, useState } from "react";
import "./Result.css";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaChartLine,
  FaUserGraduate,
} from "react-icons/fa";

const emptyForm = {
  regNo: "",
  name: "",
  department: "",
  semester: "",
  tamil: "",
  english: "",
  maths: "",
  science: "",
  social: "",
};

export default function Result() {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editIndex, setEditIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  /* =========================
        LOAD RESULTS
  ========================= */

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("results")) || [];
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load results:", error);
      setResults([]);
    }
  }, []);

  /* =========================
        SAVE RESULTS
  ========================= */

  useEffect(() => {
    localStorage.setItem("results", JSON.stringify(results));
  }, [results]);

  /* =========================
        FORM CHANGE
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
        RESET FORM
  ========================= */

  const resetForm = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setShowForm(false);
  };

  /* =========================
        OPEN ADD FORM
  ========================= */

  const openAddForm = () => {
    setForm(emptyForm);
    setEditIndex(null);
    setShowForm(true);
  };

  /* =========================
        CALCULATE RESULT
  ========================= */

  const calculate = () => {
    const marks = [
      Number(form.tamil),
      Number(form.english),
      Number(form.maths),
      Number(form.science),
      Number(form.social),
    ];

    const total = marks.reduce((a, b) => a + b, 0);

    const percentage = ((total / 500) * 100).toFixed(2);

    let grade = "";

    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    else grade = "F";

    const status = marks.every((mark) => mark >= 35)
      ? "Pass"
      : "Fail";

    return {
      total,
      percentage,
      grade,
      status,
    };
  };

  /* =========================
        SAVE RESULT
  ========================= */

  const saveResult = () => {
    if (
      !form.regNo.trim() ||
      !form.name.trim() ||
      !form.department.trim() ||
      !form.semester ||
      form.tamil === "" ||
      form.english === "" ||
      form.maths === "" ||
      form.science === "" ||
      form.social === ""
    ) {
      alert("Please fill all fields.");
      return;
    }

    const marks = [
      Number(form.tamil),
      Number(form.english),
      Number(form.maths),
      Number(form.science),
      Number(form.social),
    ];

    if (
      marks.some(
        (mark) => Number.isNaN(mark) || mark < 0 || mark > 100
      )
    ) {
      alert("Each subject mark must be between 0 and 100.");
      return;
    }

    const semester = Number(form.semester);

    if (semester < 1 || semester > 8) {
      alert("Semester must be between 1 and 8.");
      return;
    }

    const duplicate = results.some(
      (result, index) =>
        result.regNo?.toLowerCase() ===
          form.regNo.trim().toLowerCase() &&
        index !== editIndex
    );

    if (duplicate) {
      alert("Register Number already exists.");
      return;
    }

    const calculated = calculate();

    const student = {
      regNo: form.regNo.trim().toUpperCase(),
      name: form.name.trim(),
      department: form.department.trim().toUpperCase(),
      semester,
      tamil: Number(form.tamil),
      english: Number(form.english),
      maths: Number(form.maths),
      science: Number(form.science),
      social: Number(form.social),
      ...calculated,
    };

    if (editIndex !== null) {
      setResults((prev) =>
        prev.map((item, index) =>
          index === editIndex ? student : item
        )
      );
    } else {
      setResults((prev) => [...prev, student]);
    }

    resetForm();
  };

  /* =========================
        EDIT RESULT
  ========================= */

  const editResult = (index) => {
    const student = results[index];

    setForm({
      regNo: student.regNo || "",
      name: student.name || "",
      department: student.department || "",
      semester: student.semester || "",
      tamil: student.tamil ?? "",
      english: student.english ?? "",
      maths: student.maths ?? "",
      science: student.science ?? "",
      social: student.social ?? "",
    });

    setEditIndex(index);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================
        DELETE RESULT
  ========================= */

  const deleteResult = (index) => {
    const student = results[index];

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${student.name}'s result?`
    );

    if (!confirmDelete) return;

    setResults((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /* =========================
        SEARCH
  ========================= */

  const filtered = results.filter((result) => {
    const query = search.toLowerCase().trim();

    return (
      result.name?.toLowerCase().includes(query) ||
      result.regNo?.toLowerCase().includes(query) ||
      result.department?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="result-page">

      {/* =========================
              HEADER
      ========================= */}

      <div className="result-header">

        <div className="result-title">

          <div className="result-title-icon">
            <FaChartLine />
          </div>

          <div>
            <h1>Student Result Management</h1>

            <p>
              Manage student marks, grades and academic results
            </p>
          </div>

        </div>

        <div className="result-summary">

          <div className="result-summary-icon">
            <FaUserGraduate />
          </div>

          <div>
            <span>Total Students</span>
            <strong>{results.length}</strong>
          </div>

        </div>

      </div>

      {/* =========================
              ADD BUTTON
      ========================= */}

      {!showForm && (
        <div className="add-result-wrapper">

          <button
            className="add-result-btn"
            onClick={openAddForm}
          >
            <FaPlus />
            Add Student Result
          </button>

        </div>
      )}

      {/* =========================
              FORM
      ========================= */}

      {showForm && (
        <div className="result-form-card">

          <div className="result-form-header">

            <div>
              <h2>
                {editIndex !== null
                  ? "Edit Student Result"
                  : "Add Student Result"}
              </h2>

              <p>
                Enter student information and subject marks
              </p>
            </div>

            <button
              className="close-form-btn"
              onClick={resetForm}
              type="button"
              aria-label="Close form"
            >
              <FaTimes />
            </button>

          </div>

          <div className="result-form-grid">

            {/* Register Number */}

            <div className="result-field">
              <label>Register Number</label>

              <input
                name="regNo"
                type="text"
                placeholder="Example: 22CS001"
                value={form.regNo}
                onChange={handleChange}
              />
            </div>

            {/* Student Name */}

            <div className="result-field">
              <label>Student Name</label>

              <input
                name="name"
                type="text"
                placeholder="Enter student name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {/* Department */}

            <div className="result-field">
              <label>Department</label>

              <input
                name="department"
                type="text"
                placeholder="Example: CSE"
                value={form.department}
                onChange={handleChange}
              />
            </div>

            {/* Semester */}

            <div className="result-field">
              <label>Semester</label>

              <input
                name="semester"
                type="number"
                min="1"
                max="8"
                placeholder="1 - 8"
                value={form.semester}
                onChange={handleChange}
              />
            </div>

            {/* Subject Title */}

            <div className="marks-title">
              <span>Subject Marks</span>
              <small>Enter marks from 0 to 100</small>
            </div>

            {/* Tamil */}

            <div className="result-field">
              <label>Tamil</label>

              <input
                type="number"
                name="tamil"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={form.tamil}
                onChange={handleChange}
              />
            </div>

            {/* English */}

            <div className="result-field">
              <label>English</label>

              <input
                type="number"
                name="english"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={form.english}
                onChange={handleChange}
              />
            </div>

            {/* Mathematics */}

            <div className="result-field">
              <label>Mathematics</label>

              <input
                type="number"
                name="maths"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={form.maths}
                onChange={handleChange}
              />
            </div>

            {/* Science */}

            <div className="result-field">
              <label>Science</label>

              <input
                type="number"
                name="science"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={form.science}
                onChange={handleChange}
              />
            </div>

            {/* Social */}

            <div className="result-field">
              <label>Social Science</label>

              <input
                type="number"
                name="social"
                min="0"
                max="100"
                placeholder="0 - 100"
                value={form.social}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* FORM ACTIONS */}

          <div className="result-form-actions">

            <button
              className="cancel-result-btn"
              onClick={resetForm}
              type="button"
            >
              <FaTimes />
              Cancel
            </button>

            <button
              className="save-result-btn"
              onClick={saveResult}
              type="button"
            >
              <FaSave />

              {editIndex !== null
                ? "Update Result"
                : "Save Result"}
            </button>

          </div>

        </div>
      )}

      {/* =========================
              SEARCH
      ========================= */}

      <div className="result-search-card">

        <FaSearch className="result-search-icon" />

        <input
          type="text"
          placeholder="Search by Register Number, Student Name or Department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            className="clear-result-search"
            onClick={() => setSearch("")}
            type="button"
            aria-label="Clear search"
          >
            <FaTimes />
          </button>
        )}

      </div>

      {/* =========================
              TABLE CARD
      ========================= */}

      <div className="result-table-card">

        <div className="result-table-heading">

          <div>
            <h2>Student Results</h2>

            <p>
              Showing {filtered.length} of {results.length} students
            </p>
          </div>

        </div>

        <div className="result-table-wrapper">

          <table className="result-table">

            <thead>
              <tr>
                <th>Reg No</th>
                <th>Name</th>
                <th>Department</th>
                <th>Sem</th>
                <th>Total</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filtered.length > 0 ? (

                filtered.map((student) => {

                  const actualIndex = results.findIndex(
                    (item) =>
                      item.regNo === student.regNo
                  );

                  return (
                    <tr key={student.regNo}>

                      <td>
                        <span className="reg-badge">
                          {student.regNo}
                        </span>
                      </td>

                      <td>
                        <div className="student-name-cell">

                          <div className="student-avatar">
                            {student.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <span>
                            {student.name}
                          </span>

                        </div>
                      </td>

                      <td>
                        <span className="department-badge">
                          {student.department}
                        </span>
                      </td>

                      <td>
                        <span className="semester-badge">
                          Sem {student.semester}
                        </span>
                      </td>

                      <td>
                        <strong className="total-mark">
                          {student.total}/500
                        </strong>
                      </td>

                      <td>
                        <strong className="percentage">
                          {student.percentage}%
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`grade-badge grade-${student.grade?.replace(
                            "+",
                            "plus"
                          )}`}
                        >
                          {student.grade}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            student.status === "Pass"
                              ? "result-pass"
                              : "result-fail"
                          }
                        >
                          {student.status}
                        </span>
                      </td>

                      <td>

                        <div className="result-actions">

                          <button
                            className="result-edit-btn"
                            onClick={() =>
                              editResult(actualIndex)
                            }
                            title="Edit Result"
                            type="button"
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="result-delete-btn"
                            onClick={() =>
                              deleteResult(actualIndex)
                            }
                            title="Delete Result"
                            type="button"
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="result-no-data"
                  >

                    <div className="result-empty-content">

                      <div className="result-empty-icon">
                        <FaSearch />
                      </div>

                      <h3>
                        No Results Found
                      </h3>

                      <p>
                        No student records match your search.
                      </p>

                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          type="button"
                        >
                          Clear Search
                        </button>
                      )}

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
