import React, { useState } from "react";
import {
  FaBookOpen,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaBook,
  FaBuilding,
  FaGraduationCap,
  FaUserTie,
  FaLayerGroup,
} from "react-icons/fa";
import "./Courses.css";

const initialCourses = [
  {
    id: "CS301",
    name: "Database Management System",
    department: "CSE",
    credits: 4,
    semester: 5,
    faculty: "Dr. R. Kumar",
  },
  {
    id: "CS302",
    name: "Operating System",
    department: "CSE",
    credits: 4,
    semester: 5,
    faculty: "Mrs. Priya",
  },
  {
    id: "CS303",
    name: "Computer Networks",
    department: "CSE",
    credits: 3,
    semester: 5,
    faculty: "Mr. Arun",
  },
  {
    id: "CS304",
    name: "Java Programming",
    department: "IT",
    credits: 4,
    semester: 4,
    faculty: "Ms. Meena",
  },
];

const emptyForm = {
  id: "",
  name: "",
  department: "",
  credits: "",
  semester: "",
  faculty: "",
};

const Courses = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  /* =========================
        OPEN ADD MODAL
  ========================= */

  const handleAddCourse = () => {
    setEditingCourse(null);

    setFormData({
      id: "",
      name: "",
      department: "",
      credits: "",
      semester: "",
      faculty: "",
    });

    setErrors({});
    setShowModal(true);
  };

  /* =========================
        OPEN EDIT MODAL
  ========================= */

  const handleEditCourse = (course) => {
    setEditingCourse(course);

    setFormData({
      id: course.id,
      name: course.name,
      department: course.department,
      credits: course.credits,
      semester: course.semester,
      faculty: course.faculty,
    });

    setErrors({});
    setShowModal(true);
  };

  /* =========================
        CLOSE MODAL
  ========================= */

  const closeModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setFormData(emptyForm);
    setErrors({});
  };

  /* =========================
        FORM CHANGE
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /* =========================
        VALIDATION
  ========================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = "Course code is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required";
    }

    if (!formData.department) {
      newErrors.department = "Please select department";
    }

    if (!formData.credits) {
      newErrors.credits = "Please select credits";
    }

    if (!formData.semester) {
      newErrors.semester = "Please select semester";
    }

    if (!formData.faculty) {
      newErrors.faculty = "Please select faculty";
    }

    /* Check duplicate course code */

    const duplicate = courses.some(
      (course) =>
        course.id.toLowerCase() === formData.id.toLowerCase() &&
        (!editingCourse || course.id !== editingCourse.id)
    );

    if (duplicate) {
      newErrors.id = "Course code already exists";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================
        SAVE COURSE
  ========================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const updatedCourse = {
      ...formData,
      id: formData.id.toUpperCase(),
      credits: Number(formData.credits),
      semester: Number(formData.semester),
    };

    if (editingCourse) {
      setCourses((prev) =>
        prev.map((course) =>
          course.id === editingCourse.id
            ? updatedCourse
            : course
        )
      );
    } else {
      setCourses((prev) => [...prev, updatedCourse]);
    }

    closeModal();
  };

  /* =========================
        DELETE COURSE
  ========================= */

  const handleDelete = (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmDelete) return;

    setCourses((prev) =>
      prev.filter((course) => course.id !== id)
    );
  };

  /* =========================
        SEARCH
  ========================= */

  const filteredCourses = courses.filter((course) => {
    const query = search.toLowerCase();

    return (
      course.id.toLowerCase().includes(query) ||
      course.name.toLowerCase().includes(query) ||
      course.department.toLowerCase().includes(query) ||
      course.faculty.toLowerCase().includes(query)
    );
  });

  return (
    <div className="courses-page">

      {/* =========================
            HEADER
      ========================= */}

      <div className="courses-toolbar">

        <div className="courses-toolbar-left">

          <h1>
            <FaBookOpen />
            Course Management
          </h1>

          <p>
            Manage all college courses efficiently
          </p>

        </div>

        <div className="courses-toolbar-right">

          <div className="courses-count">

            <span>Total Courses</span>

            <strong>
              {courses.length}
            </strong>

          </div>

          <button
            className="courses-add-btn"
            onClick={handleAddCourse}
          >
            <FaPlus />
            Add Course
          </button>

        </div>

      </div>

      {/* =========================
            SEARCH
      ========================= */}

      <div className="courses-search-container">

        <FaSearch className="courses-search-icon" />

        <input
          type="text"
          placeholder="Search by Course Code, Name, Department or Faculty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            type="button"
            className="courses-clear-search"
            onClick={() => setSearch("")}
          >
            <FaTimes />
          </button>
        )}

      </div>

      {/* =========================
            TABLE
      ========================= */}

      <div className="courses-table-card">

        <div className="courses-table-wrapper">

          <table className="courses-table">

            <thead>

              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Department</th>
                <th>Credits</th>
                <th>Semester</th>
                <th>Faculty</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {filteredCourses.map((course) => (

                <tr key={course.id}>

                  {/* COURSE CODE */}

                  <td>
                    <span className="course-code">
                      {course.id}
                    </span>
                  </td>

                  {/* COURSE NAME */}

                  <td>

                    <div className="course-name-cell">

                      <div className="course-icon">
                        <FaBook />
                      </div>

                      <span>
                        {course.name}
                      </span>

                    </div>

                  </td>

                  {/* DEPARTMENT */}

                  <td>

                    <span className="course-dept-badge">
                      {course.department}
                    </span>

                  </td>

                  {/* CREDITS */}

                  <td>

                    <span className="course-credit-badge">
                      {course.credits} Credits
                    </span>

                  </td>

                  {/* SEMESTER */}

                  <td>

                    <span className="course-semester-badge">
                      Semester {course.semester}
                    </span>

                  </td>

                  {/* FACULTY */}

                  <td>

                    <div className="course-faculty">

                      <div className="faculty-mini-avatar">
                        {course.faculty
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span>
                        {course.faculty}
                      </span>

                    </div>

                  </td>

                  {/* ACTION */}

                  <td>

                    <div className="course-action-buttons">

                      <button
                        className="course-edit-btn"
                        onClick={() =>
                          handleEditCourse(course)
                        }
                        title="Edit Course"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="course-delete-btn"
                        onClick={() =>
                          handleDelete(
                            course.id,
                            course.name
                          )
                        }
                        title="Delete Course"
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              {/* EMPTY */}

              {filteredCourses.length === 0 && (

                <tr>

                  <td
                    colSpan="7"
                    className="courses-no-data"
                  >

                    <div className="courses-empty-content">

                      <FaSearch />

                      <h3>
                        No Courses Found
                      </h3>

                      <p>
                        No course records match your
                        search.
                      </p>

                      {search && (
                        <button
                          onClick={() => setSearch("")}
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

      {/* =========================
            ADD / EDIT MODAL
      ========================= */}

      {showModal && (

        <div
          className="courses-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="courses-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="courses-modal-header">

              <div className="courses-modal-title">

                <div className="courses-modal-icon">

                  {editingCourse ? (
                    <FaEdit />
                  ) : (
                    <FaBookOpen />
                  )}

                </div>

                <div>

                  <h2>
                    {editingCourse
                      ? "Edit Course"
                      : "Add Course"}
                  </h2>

                  <p>
                    {editingCourse
                      ? "Update course information"
                      : "Enter new course information"}
                  </p>

                </div>

              </div>

              <button
                className="courses-modal-close"
                onClick={closeModal}
                type="button"
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

            <form
              className="courses-form"
              onSubmit={handleSubmit}
            >

              <div className="courses-form-grid">

                {/* COURSE CODE */}

                <div className="courses-form-group">

                  <label>
                    <FaBook />
                    Course Code
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="id"
                    placeholder="Example: CS305"
                    value={formData.id}
                    onChange={handleChange}
                    className={
                      errors.id
                        ? "courses-input-error"
                        : ""
                    }
                  />

                  {errors.id && (
                    <small className="courses-error">
                      {errors.id}
                    </small>
                  )}

                </div>

                {/* COURSE NAME */}

                <div className="courses-form-group">

                  <label>
                    <FaBookOpen />
                    Course Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter course name"
                    value={formData.name}
                    onChange={handleChange}
                    className={
                      errors.name
                        ? "courses-input-error"
                        : ""
                    }
                  />

                  {errors.name && (
                    <small className="courses-error">
                      {errors.name}
                    </small>
                  )}

                </div>

                {/* DEPARTMENT */}

                <div className="courses-form-group">

                  <label>
                    <FaBuilding />
                    Department
                    <span>*</span>
                  </label>

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={
                      errors.department
                        ? "courses-input-error"
                        : ""
                    }
                  >

                    <option value="">
                      Select Department
                    </option>

                    <option value="CSE">
                      Computer Science
                    </option>

                    <option value="IT">
                      Information Technology
                    </option>

                    <option value="ECE">
                      Electronics & Communication
                    </option>

                    <option value="MECH">
                      Mechanical
                    </option>

                    <option value="CIVIL">
                      Civil
                    </option>

                    <option value="AI">
                      Artificial Intelligence
                    </option>

                    <option value="DS">
                      Data Science
                    </option>

                  </select>

                  {errors.department && (
                    <small className="courses-error">
                      {errors.department}
                    </small>
                  )}

                </div>

                {/* CREDITS */}

                <div className="courses-form-group">

                  <label>
                    <FaLayerGroup />
                    Credits
                    <span>*</span>
                  </label>

                  <select
                    name="credits"
                    value={formData.credits}
                    onChange={handleChange}
                    className={
                      errors.credits
                        ? "courses-input-error"
                        : ""
                    }
                  >

                    <option value="">
                      Select Credits
                    </option>

                    <option value="1">
                      1 Credit
                    </option>

                    <option value="2">
                      2 Credits
                    </option>

                    <option value="3">
                      3 Credits
                    </option>

                    <option value="4">
                      4 Credits
                    </option>

                    <option value="5">
                      5 Credits
                    </option>

                    <option value="6">
                      6 Credits
                    </option>

                  </select>

                  {errors.credits && (
                    <small className="courses-error">
                      {errors.credits}
                    </small>
                  )}

                </div>

                {/* SEMESTER */}

                <div className="courses-form-group">

                  <label>
                    <FaGraduationCap />
                    Semester
                    <span>*</span>
                  </label>

                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className={
                      errors.semester
                        ? "courses-input-error"
                        : ""
                    }
                  >

                    <option value="">
                      Select Semester
                    </option>

                    {[1, 2, 3, 4, 5, 6, 7, 8].map(
                      (sem) => (
                        <option
                          key={sem}
                          value={sem}
                        >
                          Semester {sem}
                        </option>
                      )
                    )}

                  </select>

                  {errors.semester && (
                    <small className="courses-error">
                      {errors.semester}
                    </small>
                  )}

                </div>

                {/* FACULTY */}

                <div className="courses-form-group">

                  <label>
                    <FaUserTie />
                    Faculty
                    <span>*</span>
                  </label>

                  <select
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    className={
                      errors.faculty
                        ? "courses-input-error"
                        : ""
                    }
                  >

                    <option value="">
                      Select Faculty
                    </option>

                    <option value="Dr. R. Kumar">
                      Dr. R. Kumar
                    </option>

                    <option value="Mrs. Priya">
                      Mrs. Priya
                    </option>

                    <option value="Mr. Arun">
                      Mr. Arun
                    </option>

                    <option value="Dr. Rajesh">
                      Dr. Rajesh
                    </option>

                    <option value="Ms. Meena">
                      Ms. Meena
                    </option>

                  </select>

                  {errors.faculty && (
                    <small className="courses-error">
                      {errors.faculty}
                    </small>
                  )}

                </div>

              </div>

              {/* FOOTER */}

              <div className="courses-modal-footer">

                <button
                  type="button"
                  className="courses-cancel-btn"
                  onClick={closeModal}
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="courses-save-btn"
                >
                  <FaSave />

                  {editingCourse
                    ? "Update Course"
                    : "Save Course"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Courses;
