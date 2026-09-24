import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaBook,
} from "react-icons/fa";
import "./TimetablePage.css";

const TimetablePage = () => {
  const timetable = [
    {
      day: "Monday",
      periods: [
        "DBMS",
        "Operating System",
        "Break",
        "Computer Networks",
        "Java",
        "Lab",
      ],
    },
    {
      day: "Tuesday",
      periods: [
        "Java",
        "DBMS",
        "Break",
        "Software Engineering",
        "Maths",
        "Lab",
      ],
    },
    {
      day: "Wednesday",
      periods: [
        "Computer Networks",
        "Java",
        "Break",
        "DBMS",
        "Operating System",
        "Seminar",
      ],
    },
    {
      day: "Thursday",
      periods: [
        "Maths",
        "DBMS",
        "Break",
        "Java",
        "Software Engineering",
        "Library",
      ],
    },
    {
      day: "Friday",
      periods: [
        "Operating System",
        "Computer Networks",
        "Break",
        "Java Lab",
        "Project",
        "Sports",
      ],
    },
  ];

  const timeSlots = [
    "9:00 – 10:00",
    "10:00 – 11:00",
    "11:00 – 11:15",
    "11:15 – 12:15",
    "12:15 – 1:15",
    "2:00 – 4:00",
  ];

  return (
    <div className="timetable-page">
      {/* Header */}
      <div className="page-header">
        <h1>
          <FaCalendarAlt />
          Class Timetable
        </h1>

        <p>III B.Sc B - Weekly Schedule</p>
      </div>

      {/* Timetable Card */}
      <div className="timetable-card">
        <div className="table-wrapper">
          <table className="weekly-timetable">
            <thead>
              <tr>
                <th>
                  <FaCalendarAlt />
                  Day
                </th>

                {timeSlots.map((time, index) => (
                  <th key={index}>
                    <FaClock />
                    {time}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {timetable.map((day) => (
                <tr key={day.day}>
                  <td className="day-name">
                    {day.day}
                  </td>

                  {day.periods.map((subject, index) => (
                    <td
                      key={index}
                      className={
                        subject === "Break"
                          ? "break-cell"
                          : ""
                      }
                    >
                      {subject}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;