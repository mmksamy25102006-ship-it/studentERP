import React from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaMoneyBillWave,
  FaUniversity,
  FaBell,
} from "react-icons/fa";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const cards = [
    {
      title: "Students",
      value: "1,250",
      icon: <FaUserGraduate />,
      color: "#4CAF50",
    },
    {
      title: "Faculty",
      value: "85",
      icon: <FaChalkboardTeacher />,
      color: "#2196F3",
    },
    {
      title: "Courses",
      value: "42",
      icon: <FaBook />,
      color: "#FF9800",
    },
    {
      title: "Fee Collection",
      value: "₹18.5 L",
      icon: <FaMoneyBillWave />,
      color: "#9C27B0",
    },
  ];

  const recentStudents = [
    {
      id: "CSE001",
      name: "John Doe",
      department: "CSE",
      year: "III",
    },
    {
      id: "CSE002",
      name: "Arun Kumar",
      department: "IT",
      year: "II",
    },
    {
      id: "CSE003",
      name: "Priya",
      department: "ECE",
      year: "IV",
    },
    {
      id: "CSE004",
      name: "Rahul",
      department: "EEE",
      year: "I",
    },
  ];

  const notices = [
    "Admissions open for 2026-2027.",
    "Faculty meeting on Friday at 3 PM.",
    "ERP Server Maintenance on Sunday.",
    "Semester Examination starts next month.",
  ];

  return (
    <div className="admin-dashboard">

      <div className="admin-header">
        <h1>
          <FaUniversity />
          Admin Dashboard
        </h1>

        <p>College ERP Management System</p>
      </div>

      <div className="dashboard-cards">

        {cards.map((card, index) => (
          <div className="card" key={index}>

            <div
              className="icon"
              style={{ background: card.color }}
            >
              {card.icon}
            </div>

            <div>
              <h2>{card.value}</h2>
              <p>{card.title}</p>
            </div>

          </div>
        ))}

      </div>

      <div className="dashboard-grid">

        <div className="table-card">

          <h2>Recent Students</h2>

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Year</th>
              </tr>
            </thead>

            <tbody>
              {recentStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.department}</td>
                  <td>{student.year}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

        <div className="notice-card">

          <h2>
            <FaBell />
            Announcements
          </h2>

          <ul>
            {notices.map((notice, index) => (
              <li key={index}>{notice}</li>
            ))}
          </ul>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;