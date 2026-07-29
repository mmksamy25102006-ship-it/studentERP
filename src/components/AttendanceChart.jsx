// src/components/AttendanceChart.jsx

import React from "react";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import "./AttendanceChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const AttendanceChart = () => {
  const data = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
    ],
    datasets: [
      {
        label: "Attendance %",
        data: [90, 92, 95, 88, 96, 94, 91, 97],
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FF9800",
          "#9C27B0",
          "#00BCD4",
          "#3F51B5",
          "#E91E63",
          "#4CAF50",
        ],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="attendance-chart-card">
      <div className="chart-header">
        <h2>Attendance Report</h2>
        <p>Monthly Attendance Percentage</p>
      </div>

      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default AttendanceChart;