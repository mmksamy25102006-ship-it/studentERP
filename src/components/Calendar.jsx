import React, { useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();

  const lastDate = new Date(year, month + 1, 0).getDate();

  const today = new Date();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const dates = [];

  for (let i = 0; i < firstDay; i++) {
    dates.push(<div key={`empty-${i}`} className="empty"></div>);
  }

  for (let day = 1; day <= lastDate; day++) {
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    dates.push(
      <div
        key={day}
        className={`date ${isToday ? "today" : ""}`}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="calendar-card">
      <div className="calendar-header">

        <button onClick={previousMonth}>
          <FaChevronLeft />
        </button>

        <h2>
          {months[month]} {year}
        </h2>

        <button onClick={nextMonth}>
          <FaChevronRight />
        </button>

      </div>

      <div className="calendar-days">
        {days.map((day) => (
          <div key={day} className="day-name">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {dates}
      </div>
    </div>
  );
};

export default Calendar;
