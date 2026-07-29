import React, { useState } from "react";
import {
  FaChalkboardTeacher,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import "./Faculty.css";

const Faculty = () => {
  const [search, setSearch] = useState("");

  const [faculty] = useState([
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
  ]);

  const filteredFaculty = faculty.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="faculty-page">
      <div className="faculty-header">
        <div>
          <h1>
            <FaChalkboardTeacher /> Faculty Management
          </h1>
          <p>Manage Faculty Information</p>
        </div>

        <button className="add-btn">
          <FaPlus />
          Add Faculty
        </button>
      </div>

      <div className="search-box">
        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search faculty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.department}</td>
                <td>{item.designation}</td>
                <td>{item.experience}</td>
                <td>{item.email}</td>

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

            {filteredFaculty.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">
                  No faculty found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Faculty;