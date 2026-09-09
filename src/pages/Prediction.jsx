import React, { useState } from "react";
import {
  FaBrain,
  FaChartLine,
  FaPercentage,
  FaGraduationCap,
} from "react-icons/fa";
import "./Prediction.css";

const Prediction = () => {
  const [attendance, setAttendance] = useState("");
  const [internal, setInternal] = useState("");
  const [result, setResult] = useState(null);

  const predict = () => {
    if (!attendance || !internal) {
      alert("Please enter all values");
      return;
    }

    const att = Number(attendance);
    const mark = Number(internal);

    let prediction = "";
    let color = "";

    if (att >= 90 && mark >= 85) {
      prediction = "Excellent (Expected Grade: O)";
      color = "#4CAF50";
    } else if (att >= 80 && mark >= 70) {
      prediction = "Very Good (Expected Grade: A+)";
      color = "#2196F3";
    } else if (att >= 75 && mark >= 60) {
      prediction = "Good (Expected Grade: A)";
      color = "#FF9800";
    } else {
      prediction = "Needs Improvement";
      color = "#F44336";
    }

    setResult({
      prediction,
      color,
    });
  };

  return (
    <div className="prediction-page">
      <div className="prediction-header">
        <h1>
          <FaBrain /> AI Performance Prediction
        </h1>

        <p>
          Predict the student's semester performance.
        </p>
      </div>

      <div className="prediction-card">

        <div className="input-group">
          <label>
            <FaPercentage />
            Attendance (%)
          </label>

          <input
            type="number"
            placeholder="Enter attendance"
            value={attendance}
            onChange={(e) => setAttendance(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>
            <FaGraduationCap />
            Internal Marks
          </label>

          <input
            type="number"
            placeholder="Enter internal marks"
            value={internal}
            onChange={(e) => setInternal(e.target.value)}
          />
        </div>

        <button onClick={predict}>
          <FaChartLine />
          Predict Result
        </button>

        {result && (
          <div
            className="prediction-result"
            style={{ borderLeft: `6px solid ${result.color}` }}
          >
            <h2 style={{ color: result.color }}>
              {result.prediction}
            </h2>
          </div>
        )}

      </div>
    </div>
  );
};

export default Prediction;
