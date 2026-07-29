import React, { useState } from "react";
import {
  FaGraduationCap,
  FaCheckCircle,
  FaChartLine,
} from "react-icons/fa";
import "./Marks.css";

const Marks = () => {
  const [subjects] = useState([
    {
      code: "CS301",
      name: "Database Management System",
      internal: 48,
      external: 82,
      total: 130,
      grade: "A+",
    },
    {
      code: "CS302",
      name: "Operating System",
      internal: 45,
      external: 78,
      total: 123,
      grade: "A",
    },
    {
      code: "CS303",
      name: "Computer Networks",
      internal: 46,
      external: 80,
      total: 126,
      grade: "A+",
    },
    {
      code: "CS304",
      name: "Java Programming",
      internal: 49,
      external: 84,
      total: 133,
      grade: "O",
    },
    {
      code: "CS305",
      name: "Software Engineering",
      internal: 44,
      external: 76,
      total: 120,
      grade: "A",
    },
    {
      code: "CS306",
      name: "Artificial Intelligence",
      internal: 47,
      external: 81,
      total: 128,
      grade: "A+",
    },
  ]);

  return (
    <div className="marks-page">
      <div className="marks-header">
        <h1>
          <FaGraduationCap /> Marks & Results
        </h1>
        <p>Semester Examination Performance</p>
      </div>

      <div className="marks-summary">
        <div className="summary-card">
          <FaChartLine className="summary-icon" />
          <h2>CGPA</h2>
          <h1>8.74</h1>
        </div>

        <div className="summary-card">
          <FaCheckCircle className="summary-icon" />
          <h2>Credits Earned</h2>
          <h1>24</h1>
        </div>

        <div className="summary-card">
          <FaGraduationCap className="summary-icon" />
          <h2>Result</h2>
          <h1>PASS</h1>
        </div>
      </div>

      <div className="marks-table-card">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject</th>
              <th>Internal</th>
              <th>External</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>

          <tbody>
            {subjects.map((subject) => (
              <tr key={subject.code}>
                <td>{subject.code}</td>
                <td>{subject.name}</td>
                <td>{subject.internal}</td>
                <td>{subject.external}</td>
                <td>{subject.total}</td>
                <td>
                  <span className={`grade ${subject.grade}`}>
                    {subject.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Marks;