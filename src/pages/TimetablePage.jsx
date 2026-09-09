import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaBook,
} from "react-icons/fa";
import "./TimetablePage.css";

const TimetablePage = () => {
  const [timetable] = useState([
    {
      day: "Monday",
      classes: [
        {
          time: "09:00 - 10:00",
          subject: "Database Management System",
          faculty: "Dr. Kumar",
          room: "A-101",
        },
        {
          time: "10:00 - 11:00",
          subject: "Operating System",
          faculty: "Dr. Ravi",
          room: "A-102",
        },
        {
          time: "11:15 - 12:15",
          subject: "Java Programming",
          faculty: "Mrs. Priya",
          room: "Lab-1",
        },
        {
          time: "01:15 - 02:15",
          subject: "Computer Networks",
          faculty: "Mr. Arun",
          room: "A-103",
        },
      ],
    },
    {
      day: "Tuesday",
      classes: [
        {
          time: "09:00 - 10:00",
          subject: "Artificial Intelligence",
          faculty: "Dr. Raj",
          room: "A-104",
        },
        {
          time: "10:00 - 11:00",
          subject: "Software Engineering",
          faculty: "Mrs. Meena",
          room: "A-105",
        },
        {
          time: "11:15 - 12:15",
          subject: "DBMS Lab",
          faculty: "Mr. Kumar",
          room: "Lab-2",
        },
      ],
    },
    {
      day: "Wednesday",
      classes: [
        {
          time: "09:00 - 10:00",
          subject: "Operating System",
          faculty: "Dr. Ravi",
          room: "A-102",
        },
        {
          time: "10:00 - 11:00",
          subject: "Computer Networks",
          faculty: "Mr. Arun",
          room: "A-103",
        },
        {
          time: "01:15 - 03:15",
          subject: "Java Lab",
          faculty: "Mrs. Priya",
          room: "Lab-1",
        },
      ],
    },
    {
      day: "Thursday",
      classes: [
        {
          time: "09:00 - 10:00",
          subject: "Software Engineering",
          faculty: "Mrs. Meena",
          room: "A-105",
        },
        {
          time: "10:00 - 11:00",
          subject: "Artificial Intelligence",
          faculty: "Dr. Raj",
          room: "A-104",
        },
      ],
    },
    {
      day: "Friday",
      classes: [
        {
          time: "09:00 - 10:00",
          subject: "Database Management System",
          faculty: "Dr. Kumar",
          room: "A-101",
        },
        {
          time: "10:00 - 12:00",
          subject: "Project Work",
          faculty: "Project Guide",
          room: "Project Lab",
        },
      ],
    },
  ]);

  return (
    <div className="timetable-page">
      <div className="page-header">
        <h1>
          <FaCalendarAlt /> Class Timetable
        </h1>
        <p>Weekly Schedule</p>
      </div>

      {timetable.map((day) => (
        <div className="day-card" key={day.day}>
          <h2>{day.day}</h2>

          <table>
            <thead>
              <tr>
                <th>
                  <FaClock /> Time
                </th>
                <th>
                  <FaBook /> Subject
                </th>
                <th>Faculty</th>
                <th>Room</th>
              </tr>
            </thead>

            <tbody>
              {day.classes.map((item, index) => (
                <tr key={index}>
                  <td>{item.time}</td>
                  <td>{item.subject}</td>
                  <td>{item.faculty}</td>
                  <td>{item.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default TimetablePage;
