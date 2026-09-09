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
      className: "students-stat",
    },
    {
      title: "Subjects",
      value: "5",
      icon: <FaBookOpen />,
      className: "subjects-stat",
    },
    {
      title: "Attendance",
      value: "94%",
      icon: <FaClipboardCheck />,
      className: "attendance-stat",
    },
    {
      title: "Classes Today",
      value: "4",
      icon: <FaChalkboardTeacher />,
      className: "classes-stat",
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

      {/* Header */}
      <div className="dashboard-header">
        <h1>
          <FaUserTie />
          Faculty Dashboard
        </h1>

        <p>Welcome back, Professor</p>
      </div>


      {/* Statistics */}
      <div className="stats-grid">

        {stats.map((item, index) => (
          <div
            className={`stat-card ${item.className}`}
            key={index}
          >

            <div className="icon">
              {item.icon}
            </div>

            <div className="stat-info">
              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </div>

            <div className="stat-decoration"></div>

          </div>
        ))}

      </div>


      {/* Dashboard Content */}
      <div className="dashboard-content">

        {/* Today's Classes */}
        <div className="cardfaculty">

          <div className="section-title">
            <div className="title-icon">
              <FaChalkboardTeacher />
            </div>

            <div>
              <h2>Today's Classes</h2>
              <p>Your scheduled classes for today</p>
            </div>
          </div>


          <div className="table-containerfaculty">

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

        </div>


        {/* Notifications */}
        <div className="cardfaculty">

          <div className="section-title">

            <div className="title-icon notification-title">
              <FaBell />
            </div>

            <div>
              <h2>Notifications</h2>
              <p>Latest faculty updates</p>
            </div>

          </div>


          <ul className="notice-list">

            {notices.map((notice, index) => (
              <li key={index}>
                <span className="notice-dot"></span>
                {notice}
              </li>
            ))}

          </ul>

        </div>

      </div>

    </div>
  );
};

export default FacultyDashboard;