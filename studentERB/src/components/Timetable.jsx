import React from "react";
import "./Timetable.css";

const Timetable = () => {
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

  const timings = [
    "9:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 11:15",
    "11:15 - 12:15",
    "12:15 - 1:15",
    "2:00 - 4:00",
  ];

  return (
    <div className="timetable-card">
      <div className="timetable-header">
        <h2>Class Timetable</h2>
        <p>Weekly Schedule</p>
      </div>

      <div className="table-responsive">
        <table className="timetable-table">
          <thead>
            <tr>
              <th>Day</th>
              {timings.map((time, index) => (
                <th key={index}>{time}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {timetable.map((row, index) => (
              <tr key={index}>
                <td className="day">{row.day}</td>

                {row.periods.map((subject, i) => (
                  <td key={i}>{subject}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timetable;