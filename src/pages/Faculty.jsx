import React, { useState } from "react";
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

const initialFaculty = [
  {
    id: "FAC001",
    name: "Dr. R. Kumar",
    department: "Computer Science",
    designation: "Professor",
    experience: "15 Years",
    email: "rkumar@nexus.edu",
  },
  {
    id: "FAC002",
    name: "Mrs. Priya",
    department: "Information Technology",
    designation: "Assistant Professor",
    experience: "8 Years",
    email: "priya@nexus.edu",
  },
  {
    id: "FAC003",
    name: "Mr. Arun",
    department: "Electronics",
    designation: "Associate Professor",
    experience: "10 Years",
    email: "arun@nexus.edu",
  },
  {
    id: "FAC004",
    name: "Dr. Rajesh",
    department: "Mechanical",
    designation: "Professor",
    experience: "18 Years",
    email: "rajesh@nexus.edu",
  },
  {
    id: "FAC005",
    name: "Ms. Meena",
    department: "Artificial Intelligence",
    designation: "Assistant Professor",
    experience: "5 Years",
    email: "meena@nexus.edu",
  },
];

const emptyForm = {
  id: "",
  name: "",
  department: "",
  designation: "",
  experience: "",
  email: "",
};

const Faculty = () => {
  const [faculty, setFaculty] = useState(initialFaculty);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  /* =========================
        OPEN ADD MODAL
  ========================= */

  const handleAddFaculty = () => {
    setEditingFaculty(null);

    const nextNumber =
      faculty.length > 0
        ? Math.max(
            ...faculty.map((item) =>
              parseInt(item.id.replace("FAC", ""), 10)
            )
          ) + 1
        : 1;

    setFormData({
      id: `FAC${String(nextNumber).padStart(3, "0")}`,
      name: "",
      department: "",
      designation: "",
      experience: "",
      email: "",
    });

    setErrors({});
    setShowModal(true);
  };

  /* =========================
        OPEN EDIT MODAL
  ========================= */

  const handleEditFaculty = (item) => {
    setEditingFaculty(item);

    setFormData({
      ...item,
    });

    setErrors({});
    setShowModal(true);
  };

  /* =========================
        CLOSE MODAL
  ========================= */

  const closeModal = () => {
    setShowModal(false);
    setEditingFaculty(null);
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
        FORM VALIDATION
  ========================= */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Faculty name is required";
    }

    if (!formData.department) {
      newErrors.department = "Please select a department";
    }

    if (!formData.designation) {
      newErrors.designation = "Please select a designation";
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Experience is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================
        SAVE FACULTY
  ========================= */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingFaculty) {
      setFaculty((prev) =>
        prev.map((item) =>
          item.id === editingFaculty.id
            ? {
                ...formData,
                id: editingFaculty.id,
              }
            : item
        )
      );
    } else {
      setFaculty((prev) => [...prev, formData]);
    }

    closeModal();
  };

  /* =========================
        DELETE FACULTY
  ========================= */

  const handleDelete = (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${name}?`
    );

    if (!confirmDelete) return;

    setFaculty((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  /* =========================
        SEARCH
  ========================= */

  const filteredFaculty = faculty.filter((item) => {
    const query = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.designation.toLowerCase().includes(query)
    );
  });

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

            {filteredFaculty.map((item) => (

              <tr key={item.id}>

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
                        handleEditFaculty(item)
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
                          item.id,
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

            ))}

            {/* NO DATA */}

            {filteredFaculty.length === 0 && (

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
                      No faculty records match
                      your search.
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
                    Faculty ID is automatically generated.
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
                    value={formData.department}
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
                    value={formData.designation}
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
                    value={formData.experience}
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
                >
                  <FaTimes />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  <FaSave />

                  {editingFaculty
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
