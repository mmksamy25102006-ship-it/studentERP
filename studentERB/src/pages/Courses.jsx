import React, { useState } from "react";
import {
  FaBookOpen,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import "./Courses.css";

const Courses = () => {
  const [search, setSearch] = useState("");

  const [courses] = useState([
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
    {
      id: "AI401",
      name: "Artificial Intelligence",
      department: "AI & DS",
      credits: 4,
      semester: 6,
      faculty: "Dr. Rajesh",
    },
  ]);

  const filteredCourses = courses.filter(
    (course) =>
      course.id.toLowerCase().includes(search.toLowerCase()) ||
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div>
          <h1>
            <FaBookOpen /> Courses
          </h1>
          <p>Manage College Courses</p>
        </div>

        <button className="add-btn">
          <FaPlus />
          Add Course
        </button>
      </div>

      <div className="search-box">
        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="courses-table">
        <table>
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
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>{course.department}</td>
                <td>{course.credits}</td>
                <td>{course.semester}</td>
                <td>{course.faculty}</td>

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

            {filteredCourses.length === 0 && (
              <tr>
                <td colSpan="7" className="no-data">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Courses;