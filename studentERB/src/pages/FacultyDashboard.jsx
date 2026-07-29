import React from "react";
import {
  FaUserTie,
  FaUsers,
  FaBookOpen,
  FaClipboardCheck,
  FaChalkboardTeacher,
  FaBell,
} from "react-icons/fa";
import "./FacultyDashboard.css";

const FacultyDashboard = () => {
  const stats = [
    {
      title: "Total Students",
      value: "320",
      icon: <FaUsers />,
      color: "#4CAF50",
    },
    {
      title: "Subjects",
      value: "5",
      icon: <FaBookOpen />,
      color: "#2196F3",
    },
    {
      title: "Attendance",
      value: "94%",
      icon: <FaClipboardCheck />,
      color: "#FF9800",
    },
    {
      title: "Classes Today",
      value: "4",
      icon: <FaChalkboardTeacher />,
      color: "#9C27B0",
    },
  ];

  const classes = [
    {
      subject: "Database Management System",
      section: "III CSE - A",
      time: "09:00 AM",
      room: "A-201",
    },
    {
      subject: "Operating System",
      section: "III CSE - B",
      time: "11:00 AM",
      room: "A-203",
    },
    {
      subject: "Java Programming",
      section: "II CSE - A",
      time: "02:00 PM",
      room: "Lab-2",
    },
  ];

  const notices = [
    "Faculty Meeting on Friday - 3:00 PM",
    "Internal Marks Submission Deadline: 30 July",
    "Upload Attendance Before 5 PM",
  ];

  return (
    <div className="faculty-dashboard">

      <div className="dashboard-header">
        <h1>
          <FaUserTie /> Faculty Dashboard
        </h1>
        <p>Welcome back, Professor</p>
      </div>

      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div
              className="icon"
              style={{ background: item.color }}
            >
              {item.icon}
            </div>

            <div>
              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">

        <div className="card">
          <h2>Today's Classes</h2>

          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Section</th>
                <th>Time</th>
                <th>Room</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((item, index) => (
                <tr key={index}>
                  <td>{item.subject}</td>
                  <td>{item.section}</td>
                  <td>{item.time}</td>
                  <td>{item.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h2>
            <FaBell /> Notifications
          </h2>

          <ul className="notice-list">
            {notices.map((notice, index) => (
              <li key={index}>{notice}</li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
};

export default FacultyDashboard;