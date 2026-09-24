// src/components/AttendanceChart.jsx

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";

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
  const [attendanceData, setAttendanceData] = useState(
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        /* ==========================================
           GET CURRENT STUDENT ID
        ========================================== */

        const studentId =
          localStorage.getItem("studentId") ||
          localStorage.getItem("rollNo");

        if (!studentId) {
          console.warn("Student ID not found.");
          setLoading(false);
          return;
        }

        /* ==========================================
           GET REAL ATTENDANCE FROM BACKEND
        ========================================== */

        const response = await axios.get(
          `https://studenterp-5wuj.onrender.com/api/attendance/student/${studentId}`
        );

        const attendance =
          response.data?.attendance || [];

        /* ==========================================
           MONTHLY ATTENDANCE CALCULATION
        ========================================== */

        const monthlyData = Array(12)
          .fill(null)
          .map(() => ({
            present: 0,
            total: 0,
          }));

        attendance.forEach((record) => {
          if (!record.date) return;

          const date = new Date(record.date);

          if (isNaN(date.getTime())) return;

          const month = date.getMonth();

          monthlyData[month].total += 1;

          if (record.status === "Present") {
            monthlyData[month].present += 1;
          }
        });

        /* ==========================================
           CALCULATE PERCENTAGE
        ========================================== */

        const percentages = monthlyData.map(
          (month) => {
            if (month.total === 0) {
              return 0;
            }

            return Math.round(
              (month.present / month.total) * 100
            );
          }
        );

        setAttendanceData(percentages);

      } catch (error) {
        console.error(
          "Attendance Chart Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

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
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],

    datasets: [
      {
        label: "Attendance %",
        data: attendanceData,

        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FF9800",
          "#9C27B0",
          "#00BCD4",
          "#3F51B5",
          "#E91E63",
          "#4CAF50",
          "#2196F3",
          "#FF9800",
          "#9C27B0",
          "#00BCD4",
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

        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
      },
    },
  };

  return (
    <div className="attendance-chart-card">

      <div className="chart-header">
        <h2>Attendance Report</h2>

        <p>
          Monthly Attendance Percentage
        </p>
      </div>

      <div className="chart-container">

        {loading ? (
          <p>Loading attendance...</p>
        ) : (
          <Bar
            data={data}
            options={options}
          />
        )}

      </div>

    </div>
  );
};

export default AttendanceChart;