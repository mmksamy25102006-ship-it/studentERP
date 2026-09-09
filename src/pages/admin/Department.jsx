import React, { useState } from "react";
import {
  FaBuilding,
  FaPlus,
  FaTrash,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import "./Department.css";

function Department() {
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");

  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: "Computer Science and Engineering",
    },
    {
      id: 2,
      name: "Information Technology",
    },
    {
      id: 3,
      name: "Electronics and Communication Engineering",
    },
    {
      id: 4,
      name: "Mechanical Engineering",
    },
    {
      id: 5,
      name: "Civil Engineering",
    },
  ]);

  /* =========================
        ADD DEPARTMENT
  ========================= */

  const addDepartment = () => {
    const trimmedDepartment = department.trim();

    if (!trimmedDepartment) {
      alert("Enter Department Name");
      return;
    }

    const alreadyExists = departments.some(
      (dept) =>
        dept.name.toLowerCase() === trimmedDepartment.toLowerCase()
    );

    if (alreadyExists) {
      alert("Department already exists");
      return;
    }

    const newDepartment = {
      id: Date.now(),
      name: trimmedDepartment,
    };

    setDepartments((prev) => [...prev, newDepartment]);
    setDepartment("");
  };

  /* =========================
        DELETE DEPARTMENT
  ========================= */

  const deleteDepartment = (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmDelete) return;

    setDepartments((prev) =>
      prev.filter((dept) => dept.id !== id)
    );
  };

  /* =========================
            SEARCH
  ========================= */

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase())
  );

  /* =========================
            CLEAR SEARCH
  ========================= */

  const clearSearch = () => {
    setSearch("");
  };

  return (
    <div className="department-page">

      {/* =========================
            HEADER
      ========================= */}

      <div className="department-header">

        <div className="department-title-section">
          <div className="department-title-icon">
            <FaBuilding />
          </div>

          <div>
            <h2>Department Management</h2>
            <p>
              Manage and organize all departments in the college.
            </p>
          </div>
        </div>

        <div className="department-count">
          <span>Total Departments</span>
          <strong>{departments.length}</strong>
        </div>

      </div>

      {/* =========================
            ADD DEPARTMENT
      ========================= */}

      <div className="department-form-card">

        <div className="form-heading">
          <div className="form-heading-icon">
            <FaPlus />
          </div>

          <div>
            <h3>Add New Department</h3>
            <p>Create a new department for the college.</p>
          </div>
        </div>

        <div className="department-form">

          <div className="department-input-wrapper">
            <FaBuilding />

            <input
              type="text"
              placeholder="Enter Department Name"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addDepartment();
                }
              }}
            />

            {department && (
              <button
                type="button"
                className="clear-input-btn"
                onClick={() => setDepartment("")}
                title="Clear"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <button
            className="department-add-btn"
            onClick={addDepartment}
          >
            <FaPlus />
            Add Department
          </button>

        </div>

      </div>

      {/* =========================
            SEARCH
      ========================= */}

      <div className="department-search">

        <FaSearch className="department-search-icon" />

        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            type="button"
            className="department-clear-search"
            onClick={clearSearch}
          >
            <FaTimes />
          </button>
        )}

      </div>

      {/* =========================
            TABLE
      ========================= */}

      <div className="department-table-card">

        <div className="table-header">

          <div>
            <h3>Departments</h3>
            <p>
              {filteredDepartments.length} department
              {filteredDepartments.length !== 1 ? "s" : ""} found
            </p>
          </div>

        </div>

        <div className="department-table-wrapper">

          <table className="department-table">

            <thead>
              <tr>
                <th>S.NO</th>
                <th>DEPARTMENT NAME</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>

              {filteredDepartments.map((dept, index) => (

                <tr key={dept.id}>

                  <td>
                    <span className="serial-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </td>

                  <td>
                    <div className="department-name">

                      <div className="department-row-icon">
                        <FaBuilding />
                      </div>

                      <span>{dept.name}</span>

                    </div>
                  </td>

                  <td>

                    <button
                      className="departmentdelete-btn"
                      onClick={() =>
                        deleteDepartment(
                          dept.id,
                          dept.name
                        )
                      }
                      title="Delete Department"
                    >
                      <FaTrash />
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

              {/* NO DATA */}

              {filteredDepartments.length === 0 && (

                <tr>

                  <td
                    colSpan="3"
                    className="department-no-data"
                  >

                    <div className="no-data-content">

                      <div className="no-data-icon">
                        <FaSearch />
                      </div>

                      <h3>No Department Found</h3>

                      <p>
                        No departments match your search.
                      </p>

                      {search && (
                        <button
                          className="reset-search-btn"
                          onClick={clearSearch}
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

export default Department;
