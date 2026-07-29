import React, { useState } from "react";
import {
  FaUserGraduate,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import "./Students.css";

const Students = () => {
  const [search, setSearch] = useState("");

  const [students] = useState([
    {
      id: "CSE001",
      name: "John Doe",
      department: "CSE",
      year: "III",
      cgpa: "8.74",
      phone: "9876543210",
    },
    {
      id: "CSE002",
      name: "Arun Kumar",
      department: "IT",
      year: "II",
      cgpa: "8.25",
      phone: "9876543211",
    },
    {
      id: "CSE003",
      name: "Priya",
      department: "ECE",
      year: "IV",
      cgpa: "9.12",
      phone: "9876543212",
    },
    {
      id: "CSE004",
      name: "Rahul",
      department: "EEE",
      year: "I",
      cgpa: "7.98",
      phone: "9876543213",
    },
    {
      id: "CSE005",
      name: "Meena",
      department: "CSE",
      year: "III",
      cgpa: "8.91",
      phone: "9876543214",
    },
  ]);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.id.toLowerCase().includes(search.toLowerCase()) ||
      student.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="students-page">
      <div className="students-header">
        <div>
          <h1>
            <FaUserGraduate /> Students
          </h1>
          <p>Manage student records</p>
        </div>

        <button className="add-btn">
          <FaPlus />
          Add Student
        </button>
      </div>

      <div className="search-box">
        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search by ID, Name or Department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>CGPA</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.department}</td>
                <td>{student.year}</td>
                <td>{student.cgpa}</td>
                <td>{student.phone}</td>

                <td>
                  <button className="edit-btn">
                    <FaEdit />
                  </button>

                  <button className="delete-btn">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;