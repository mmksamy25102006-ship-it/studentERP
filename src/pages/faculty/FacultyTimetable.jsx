import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCoffee,
  FaUtensils,
  FaBookOpen,
} from "react-icons/fa";

import "./FacultyTimetable.css";

const timetable = [
  {
    day: "Monday",
    shortDay: "MON",
    periods: [
      {
        time: "09:00 - 10:00",
        subject: "Computer Networks",
        room: "CS-201",
        type: "class",
      },
      {
        time: "10:00 - 11:00",
        subject: "Data Structures",
        room: "CS-202",
        type: "class",
      },
      {
        time: "11:00 - 11:15",
        subject: "Break",
        type: "break",
      },
      {
        time: "11:15 - 12:15",
        subject: "Operating Systems",
        room: "CS-203",
        type: "class",
      },
      {
        time: "12:15 - 1:15",
        subject: "Lunch",
        type: "lunch",
      },
      {
        time: "2:00 - 3:00",
        subject: "Project Lab",
        room: "LAB-1",
        type: "class",
      },
    ],
  },

  {
    day: "Tuesday",
    shortDay: "TUE",
    periods: [
      {
        time: "09:00 - 10:00",
        subject: "Python Programming",
        room: "BCA-101",
        type: "class",
      },
      {
        time: "10:00 - 11:00",
        subject: "Database Management",
        room: "IT-105",
        type: "class",
      },
      {
        time: "11:00 - 11:15",
        subject: "Break",
        type: "break",
      },
      {
        time: "11:15 - 12:15",
        subject: "Java Programming",
        room: "BCA-102",
        type: "class",
      },
      {
        time: "12:15 - 1:15",
        subject: "Lunch",
        type: "lunch",
      },
      {
        time: "2:00 - 3:00",
        subject: "Mentoring",
        room: "Faculty Room",
        type: "activity",
      },
    ],
  },

  {
    day: "Wednesday",
    shortDay: "WED",
    periods: [
      {
        time: "09:00 - 10:00",
        subject: "Artificial Intelligence",
        room: "AI-201",
        type: "class",
      },
      {
        time: "10:00 - 11:00",
        subject: "Computer Networks",
        room: "CS-201",
        type: "class",
      },
      {
        time: "11:00 - 11:15",
        subject: "Break",
        type: "break",
      },
      {
        time: "11:15 - 12:15",
        subject: "Database Lab",
        room: "LAB-3",
        type: "class",
      },
      {
        time: "12:15 - 1:15",
        subject: "Lunch",
        type: "lunch",
      },
      {
        time: "2:00 - 3:00",
        subject: "Faculty Meeting",
        room: "Seminar Hall",
        type: "activity",
      },
    ],
  },

  {
    day: "Thursday",
    shortDay: "THU",
    periods: [
      {
        time: "09:00 - 10:00",
        subject: "Operating Systems",
        room: "IT-203",
        type: "class",
      },
      {
        time: "10:00 - 11:00",
        subject: "Python Lab",
        room: "LAB-2",
        type: "class",
      },
      {
        time: "11:00 - 11:15",
        subject: "Break",
        type: "break",
      },
      {
        time: "11:15 - 12:15",
        subject: "Data Structures",
        room: "CS-202",
        type: "class",
      },
      {
        time: "12:15 - 1:15",
        subject: "Lunch",
        type: "lunch",
      },
      {
        time: "2:00 - 3:00",
        subject: "Project Review",
        room: "Project Room",
        type: "activity",
      },
    ],
  },

  {
    day: "Friday",
    shortDay: "FRI",
    periods: [
      {
        time: "09:00 - 10:00",
        subject: "Java Programming",
        room: "BCA-102",
        type: "class",
      },
      {
        time: "10:00 - 11:00",
        subject: "Computer Networks",
        room: "CS-201",
        type: "class",
      },
      {
        time: "11:00 - 11:15",
        subject: "Break",
        type: "break",
      },
      {
        time: "11:15 - 12:15",
        subject: "Artificial Intelligence",
        room: "AI-201",
        type: "class",
      },
      {
        time: "12:15 - 1:15",
        subject: "Lunch",
        type: "lunch",
      },
      {
        time: "2:00 - 3:00",
        subject: "Student Counselling",
        room: "Counselling Room",
        type: "activity",
      },
    ],
  },

  {
    day: "Saturday",
    shortDay: "SAT",
    periods: [
      {
        time: "09:00 - 10:00",
        subject: "Seminar",
        room: "Seminar Hall",
        type: "activity",
      },
      {
        time: "10:00 - 11:00",
        subject: "Lab Session",
        room: "LAB-2",
        type: "class",
      },
      {
        time: "11:00 - 11:15",
        subject: "Break",
        type: "break",
      },
      {
        time: "11:15 - 12:15",
        subject: "Placement Training",
        room: "Placement Hall",
        type: "activity",
      },
      {
        time: "12:15 - 1:15",
        subject: "Lunch",
        type: "lunch",
      },
      {
        time: "2:00 - 3:00",
        subject: "Department Work",
        room: "Department Office",
        type: "activity",
      },
    ],
  },
];

const FacultyTimetable = () => {
  return (
    <div className="faculty-timetable-page">

      {/* HEADER */}

      <div className="faculty-timetable-header">

        <div className="timetable-heading">

          <div className="timetable-icon">
            <FaCalendarAlt />
          </div>

          <div>
            <span className="timetable-label">
              FACULTY SCHEDULE
            </span>

            <h1>Weekly Timetable</h1>

            <p>
              Your teaching and academic activities for the week.
            </p>
          </div>

        </div>


        <div className="week-selector">
          <FaCalendarAlt />

          <div>
            <span>Current Week</span>
            <strong>Academic Schedule</strong>
          </div>
        </div>

      </div>


      {/* LEGEND */}

      <div className="timetable-legend">

        <div>
          <span className="legend-dot class-dot"></span>
          Classes
        </div>

        <div>
          <span className="legend-dot activity-dot"></span>
          Activities
        </div>

        <div>
          <span className="legend-dot break-dot"></span>
          Break
        </div>

        <div>
          <span className="legend-dot lunch-dot"></span>
          Lunch
        </div>

      </div>


      {/* SCHEDULE */}

      <div className="schedule-wrapper">

        <div className="schedule-grid">

          {timetable.map((day) => (

            <div
              className="day-column"
              key={day.day}
            >

              {/* DAY */}

              <div className="day-header">

                <span>{day.shortDay}</span>

                <strong>{day.day}</strong>

              </div>


              {/* PERIODS */}

              <div className="day-periods">

                {day.periods.map((period, index) => (

                  <div
                    className={`period-card ${period.type}`}
                    key={index}
                  >

                    <div className="period-time">
                      <FaClock />
                      {period.time}
                    </div>


                    <div className="period-content">

                      {period.type === "break" && (
                        <FaCoffee className="period-main-icon" />
                      )}

                      {period.type === "lunch" && (
                        <FaUtensils className="period-main-icon" />
                      )}

                      {period.type === "class" && (
                        <FaBookOpen className="period-main-icon" />
                      )}

                      {period.type === "activity" && (
                        <FaCalendarAlt className="period-main-icon" />
                      )}


                      <h3>{period.subject}</h3>

                      {period.room && (
                        <div className="period-room">
                          <FaMapMarkerAlt />
                          {period.room}
                        </div>
                      )}

                    </div>

                  </div>

                ))}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default FacultyTimetable;
