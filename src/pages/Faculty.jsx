import React, { useEffect, useState } from "react";

import {
  FaChalkboardTeacher,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaBriefcase,
  FaClock,
  FaIdCard,
} from "react-icons/fa";

import "./Faculty.css";
import API from "../api";

// =====================================================
// EMPTY FORM
// =====================================================

const emptyForm = {
  id: "",
  name: "",
  department: "",
  designation: "",
  experience: "",
  email: "",
};

// =====================================================
// FACULTY COMPONENT
// =====================================================

const Faculty = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [faculty, setFaculty] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingFaculty, setEditingFaculty] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  // =====================================================
  // FETCH FACULTY FROM DATABASE
  // =====================================================

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);

      const response = await API.get("/faculty");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.faculty || [];

      const formattedFaculty = data.map((item) => ({
        ...item,

        // MongoDB facultyId -> UI id
        id: item.facultyId || item.id || "",
      }));

      setFaculty(formattedFaculty);
    } catch (error) {
      console.error("Fetch Faculty Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load faculty records from database"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GENERATE NEXT FACULTY ID
  // =====================================================

  const generateNextFacultyId = () => {
    const numbers = faculty
      .map((item) =>
        parseInt(
          String(item.id || "").replace(/^FAC/i, ""),
          10
        )
      )
      .filter(Number.isFinite);

    const nextNumber =
      numbers.length > 0
        ? Math.max(...numbers) + 1
        : 1;

    return `FAC${String(nextNumber).padStart(3, "0")}`;
  };

  // =====================================================
  // OPEN ADD FACULTY MODAL
  // =====================================================

  const handleAddFaculty = () => {
    setEditingFaculty(null);

    setFormData({
      id: generateNextFacultyId(),
      name: "",
      department: "",
      designation: "",
      experience: "",
      email: "",
    });

    setErrors({});

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT FACULTY MODAL
  // =====================================================

  const handleEditFaculty = (item) => {
    setEditingFaculty(item);

    setFormData({
      id: item.facultyId || item.id || "",
      name: item.name || "",
      department: item.department || "",
      designation: item.designation || "",
      experience: item.experience || "",
      email: item.email || "",
    });

    setErrors({});

    setShowModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);

    setEditingFaculty(null);

    setFormData(emptyForm);

    setErrors({});
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

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

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Faculty name is required";
    }

    if (!formData.department) {
      newErrors.department =
        "Please select a department";
    }

    if (!formData.designation) {
      newErrors.designation =
        "Please select a designation";
    }

    if (!formData.experience.trim()) {
      newErrors.experience =
        "Experience is required";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // SAVE FACULTY
  // ADD + UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      // =================================================
      // UPDATE EXISTING FACULTY
      // =================================================

      if (editingFaculty) {
        const response = await API.put(
          `/faculty/${editingFaculty._id}`,
          {
            facultyId: formData.id,
            name: formData.name.trim(),
            email: formData.email.trim(),
            department: formData.department,
            designation: formData.designation,
            experience: formData.experience.trim(),
          }
        );

        const updatedFaculty =
          response.data.faculty;

        const formattedFaculty = {
          ...updatedFaculty,

          id:
            updatedFaculty.facultyId ||
            updatedFaculty.id ||
            "",
        };

        setFaculty((prev) =>
          prev.map((item) =>
            item._id === editingFaculty._id
              ? formattedFaculty
              : item
          )
        );

        alert("Faculty updated successfully");
      }

      // =================================================
      // ADD NEW FACULTY
      // =================================================

      else {
        const response = await API.post(
          "/faculty",
          {
            facultyId: formData.id,
            name: formData.name.trim(),
            email: formData.email.trim(),
            department: formData.department,
            designation: formData.designation,
            experience:
              formData.experience.trim(),
          }
        );

        const newFaculty =
          response.data.faculty;

        const formattedFaculty = {
          ...newFaculty,

          id:
            newFaculty.facultyId ||
            newFaculty.id ||
            "",
        };

        setFaculty((prev) => [
          ...prev,
          formattedFaculty,
        ]);

        alert(
          "Faculty added successfully\n\n" +
            "Default login password: Faculty@123"
        );
      }

      closeModal();
    } catch (error) {
      console.error(
        "Save Faculty Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to save faculty"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE FACULTY
  // =====================================================

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/faculty/${id}`);

      setFaculty((prev) =>
        prev.filter(
          (item) => item._id !== id
        )
      );

      alert("Faculty deleted successfully");
    } catch (error) {
      console.error(
        "Delete Faculty Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete faculty"
      );
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredFaculty = faculty.filter(
    (item) => {
      const query = search.toLowerCase();

      return (
        String(item.name || "")
          .toLowerCase()
          .includes(query) ||
        String(item.department || "")
          .toLowerCase()
          .includes(query) ||
        String(item.id || "")
          .toLowerCase()
          .includes(query) ||
        String(item.designation || "")
          .toLowerCase()
          .includes(query)
      );
    }
  );

  // =====================================================
  // RETURN UI
  // =====================================================

  return (
    <div className="faculty-page">

      {/* =========================
          TOP TOOLBAR
      ========================= */}

      <div className="top-toolbar">

        <div className="toolbar-left">

          <h1>
            <FaChalkboardTeacher />
            Faculty Management
          </h1>

          <p>
            Manage faculty records efficiently
          </p>

        </div>

        <div className="toolbar-right">

          <div className="faculty-count">

            <span>Total Faculty</span>

            <strong>
              {faculty.length}
            </strong>

          </div>

          <button
            className="add-btn"
            onClick={handleAddFaculty}
            type="button"
          >
            <FaPlus />
            Add Faculty
          </button>

        </div>

      </div>

      {/* =========================
          SEARCH BAR
      ========================= */}

      <div className="search-container">

        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search by Faculty ID, Name, Department or Designation..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {search && (
          <button
            className="clear-search"
            onClick={() => setSearch("")}
            type="button"
            title="Clear search"
          >
            <FaTimes />
          </button>
        )}

      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="faculty-table">

        <table>

          <thead>

            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Experience</th>
              <th>Email</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {/* =====================
                LOADING
            ===================== */}

            {loading && (
              <tr>

                <td
                  colSpan="7"
                  className="no-data"
                >

                  <div className="no-data-content">

                    <FaSearch />

                    <h3>
                      Loading Faculty...
                    </h3>

                    <p>
                      Fetching faculty records
                      from database.
                    </p>

                  </div>

                </td>

              </tr>
            )}

            {/* =====================
                FACULTY DATA
            ===================== */}

            {!loading &&
              filteredFaculty.map(
                (item) => (

                  <tr
                    key={item._id}
                  >

                    {/* ID */}

                    <td>

                      <span className="faculty-id">
                        {item.id}
                      </span>

                    </td>

                    {/* NAME */}

                    <td>

                      <div className="faculty-name">

                        <div className="faculty-avatar">

                          {item.name
                            .charAt(0)
                            .toUpperCase()}

                        </div>

                        <span>
                          {item.name}
                        </span>

                      </div>

                    </td>

                    {/* DEPARTMENT */}

                    <td>

                      <span className="dept-badge">
                        {item.department}
                      </span>

                    </td>

                    {/* DESIGNATION */}

                    <td>

                      <span className="designation-badge">
                        {item.designation}
                      </span>

                    </td>

                    {/* EXPERIENCE */}

                    <td>

                      <span className="experience-text">
                        {item.experience}
                      </span>

                    </td>

                    {/* EMAIL */}

                    <td>

                      <span className="email-text">
                        {item.email}
                      </span>

                    </td>

                    {/* ACTION */}

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEditFaculty(
                              item
                            )
                          }
                          title="Edit Faculty"
                          type="button"
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(
                              item._id,
                              item.name
                            )
                          }
                          title="Delete Faculty"
                          type="button"
                        >
                          <FaTrash />
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            {/* =====================
                NO DATA
            ===================== */}

            {!loading &&
              filteredFaculty.length ===
                0 && (

                <tr>

                  <td
                    colSpan="7"
                    className="no-data"
                  >

                    <div className="no-data-content">

                      <FaSearch />

                      <h3>
                        No Faculty Found
                      </h3>

                      <p>
                        {search
                          ? "No faculty records match your search."
                          : "No faculty records available in the database."}
                      </p>

                      {search && (
                        <button
                          onClick={() =>
                            setSearch("")
                          }
                          className="reset-search"
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

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="faculty-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div className="modal-title">

                <div className="modal-icon">

                  {editingFaculty ? (
                    <FaEdit />
                  ) : (
                    <FaUser />
                  )}

                </div>

                <div>

                  <h2>
                    {editingFaculty
                      ? "Edit Faculty"
                      : "Add Faculty"}
                  </h2>

                  <p>
                    {editingFaculty
                      ? "Update faculty information"
                      : "Enter faculty information"}
                  </p>

                </div>

              </div>

              <button
                className="close-btn"
                onClick={closeModal}
                type="button"
                title="Close"
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

            <form
              className="faculty-form"
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                {/* FACULTY ID */}

                <div className="form-group">

                  <label>
                    <FaIdCard />
                    Faculty ID
                  </label>

                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    disabled
                    className="disabled-input"
                  />

                  <small>
                    Faculty ID is automatically
                    generated.
                  </small>

                </div>

                {/* NAME */}

                <div className="form-group">

                  <label>
                    <FaUser />
                    Faculty Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter faculty name"
                    value={formData.name}
                    onChange={handleChange}
                    className={
                      errors.name
                        ? "input-error"
                        : ""
                    }
                  />

                  {errors.name && (
                    <small className="error-message">
                      {errors.name}
                    </small>
                  )}

                </div>

                {/* DEPARTMENT */}

                <div className="form-group">

                  <label>
                    <FaBuilding />
                    Department
                    <span>*</span>
                  </label>

                  <select
                    name="department"
                    value={
                      formData.department
                    }
                    onChange={handleChange}
                    className={
                      errors.department
                        ? "input-error"
                        : ""
                    }
                  >

                    <option value="">
                      Select Department
                    </option>

                    <option value="Computer Science">
                      Computer Science
                    </option>

                    <option value="Information Technology">
                      Information Technology
                    </option>

                    <option value="Electronics">
                      Electronics
                    </option>

                    <option value="Mechanical">
                      Mechanical
                    </option>

                    <option value="Civil">
                      Civil
                    </option>

                    <option value="Artificial Intelligence">
                      Artificial Intelligence
                    </option>

                    <option value="Data Science">
                      Data Science
                    </option>

                  </select>

                  {errors.department && (
                    <small className="error-message">
                      {errors.department}
                    </small>
                  )}

                </div>

                {/* DESIGNATION */}

                <div className="form-group">

                  <label>
                    <FaBriefcase />
                    Designation
                    <span>*</span>
                  </label>

                  <select
                    name="designation"
                    value={
                      formData.designation
                    }
                    onChange={handleChange}
                    className={
                      errors.designation
                        ? "input-error"
                        : ""
                    }
                  >

                    <option value="">
                      Select Designation
                    </option>

                    <option value="Professor">
                      Professor
                    </option>

                    <option value="Associate Professor">
                      Associate Professor
                    </option>

                    <option value="Assistant Professor">
                      Assistant Professor
                    </option>

                    <option value="Lecturer">
                      Lecturer
                    </option>

                    <option value="HOD">
                      Head of Department
                    </option>

                  </select>

                  {errors.designation && (
                    <small className="error-message">
                      {errors.designation}
                    </small>
                  )}

                </div>

                {/* EXPERIENCE */}

                <div className="form-group">

                  <label>
                    <FaClock />
                    Experience
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="experience"
                    placeholder="Example: 5 Years"
                    value={
                      formData.experience
                    }
                    onChange={handleChange}
                    className={
                      errors.experience
                        ? "input-error"
                        : ""
                    }
                  />

                  {errors.experience && (
                    <small className="error-message">
                      {errors.experience}
                    </small>
                  )}

                </div>

                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    <FaEnvelope />
                    Email Address
                    <span>*</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="faculty@nexus.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className={
                      errors.email
                        ? "input-error"
                        : ""
                    }
                  />

                  {errors.email && (
                    <small className="error-message">
                      {errors.email}
                    </small>
                  )}

                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  <FaSave />

                  {saving
                    ? "Saving..."
                    : editingFaculty
                    ? "Update Faculty"
                    : "Save Faculty"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Faculty;