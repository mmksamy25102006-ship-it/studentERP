import React, { useState } from "react";
import {
  FaBookOpen,
  FaSearch,
  FaUsers,
  FaClock,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaArrowRight,
  FaChalkboardTeacher,
} from "react-icons/fa";

import "./MyClasses.css";

const classData = [
  {
    id: 1,
    subject: "Data Structures",
    department: "B.Sc Computer Science",
    year: "II Year",
    section: "A",
    students: 58,
    room: "CS-201",
    time: "09:00 AM - 10:00 AM",
  },
  {
    id: 2,
    subject: "Database Management System",
    department: "BCA",
    year: "III Year",
    section: "B",
    students: 62,
    room: "IT-105",
    time: "10:15 AM - 11:15 AM",
  },
  {
    id: 3,
    subject: "Operating Systems",
    department: "B.Sc Information Technology",
    year: "II Year",
    section: "A",
    students: 55,
    room: "IT-203",
    time: "01:30 PM - 02:30 PM",
  },
  {
    id: 4,
    subject: "Python Programming",
    department: "BCA",
    year: "I Year",
    section: "C",
    students: 64,
    room: "LAB-2",
    time: "02:45 PM - 03:45 PM",
  },
];

const MyClasses = () => {
  const [search, setSearch] = useState("");

  const filteredClasses = classData.filter(
    (item) =>
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase()) ||
      item.section.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = classData.reduce(
    (total, item) => total + item.students,
    0
  );

  return (
    <div className="myclasses-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="classes-header">

        <div className="classes-title">

          <div className="classes-breadcrumb">
            Faculty Dashboard
            <FaArrowRight />
            My Classes
          </div>

          <h1>
            <span className="classes-title-icon">
              <FaChalkboardTeacher />
            </span>

            My Classes
          </h1>

          <p>
            Manage and monitor all your assigned classes.
          </p>

        </div>


        {/* SEARCH */}

        <div className="classes-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="summary-grid">

        <div className="summary-card">

          <div className="summary-icon blue-icon">
            <FaBookOpen />
          </div>

          <div className="summary-content">
            <span>Total Classes</span>
            <strong>{classData.length}</strong>
          </div>

        </div>


        <div className="summary-card">

          <div className="summary-icon green-icon">
            <FaUsers />
          </div>

          <div className="summary-content">
            <span>Total Students</span>
            <strong>{totalStudents}</strong>
          </div>

        </div>


        <div className="summary-card">

          <div className="summary-icon purple-icon">
            <FaClock />
          </div>

          <div className="summary-content">
            <span>Today's Classes</span>
            <strong>4</strong>
          </div>

        </div>

      </div>


      {/* =================================================
          SECTION HEADER
      ================================================= */}

      <div className="class-section-header">

        <div>
          <h2>Assigned Classes</h2>
          <p>
            View details of your current teaching schedule.
          </p>
        </div>

        <span className="class-count">
          {filteredClasses.length} Classes
        </span>

      </div>


      {/* =================================================
          CLASS GRID
      ================================================= */}

      <div className="class-grid">

        {filteredClasses.map((item) => (

          <div
            className="class-card"
            key={item.id}
          >

            {/* CARD TOP */}

            <div className="class-card-top">

              <div className="class-subject-icon">
                <FaBookOpen />
              </div>

              <span className="class-badge">
                Section {item.section}
              </span>

            </div>


            {/* SUBJECT */}

            <div className="subject">

              <h3>{item.subject}</h3>

              <p>
                <FaGraduationCap />
                {item.department}
              </p>

            </div>


            {/* DETAILS */}

            <div className="myclass-info">

              <div className="class-detail">

                <span className="detail-icon">
                  <FaGraduationCap />
                </span>

                <div>
                  <small>Year</small>
                  <strong>{item.year}</strong>
                </div>

              </div>


              <div className="class-detail">

                <span className="detail-icon">
                  <FaMapMarkerAlt />
                </span>

                <div>
                  <small>Room</small>
                  <strong>{item.room}</strong>
                </div>

              </div>


              <div className="class-detail">

                <span className="detail-icon">
                  <FaClock />
                </span>

                <div>
                  <small>Class Time</small>
                  <strong>{item.time}</strong>
                </div>

              </div>

            </div>


            {/* FOOTER */}

            <div className="class-footer">

              <div className="students">

                <FaUsers />

                <span>
                  {item.students} Students
                </span>

              </div>

              <button className="view-btn">
                View Class
                <FaArrowRight />
              </button>

            </div>

          </div>

        ))}

      </div>


      {/* EMPTY */}

      {filteredClasses.length === 0 && (

        <div className="no-classes">

          <div className="no-classes-icon">
            <FaSearch />
          </div>

          <h3>No classes found</h3>

          <p>
            Try searching with a different subject,
            department or section.
          </p>

        </div>

      )}

    </div>
  );
};

export default MyClasses;
