import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import "./GPAChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GPAChart = () => {
  const [cgpaData, setCgpaData] = useState([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCGPA = async () => {
      try {
        const rollNo =
          localStorage.getItem("rollNo") ||
          localStorage.getItem("studentId");

        if (!rollNo) {
          console.warn("Roll number not found.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `https://studenterp-5wuj.onrender.com/api/marks/student/${rollNo}/semesters`
        );

        const marks = response.data?.marks || [];

        const semesterValues = [
          null,
          null,
          null,
          null,
          null,
          null,
        ];

        marks.forEach((record) => {
          if (!record.semester) return;

          const semesterText =
            record.semester.toLowerCase();

          let index = -1;

          if (
            semesterText.includes("1") ||
            semesterText.includes("i")
          ) {
            index = 0;
          } else if (
            semesterText.includes("2") ||
            semesterText.includes("ii")
          ) {
            index = 1;
          } else if (
            semesterText.includes("3") ||
            semesterText.includes("iii")
          ) {
            index = 2;
          } else if (
            semesterText.includes("4") ||
            semesterText.includes("iv")
          ) {
            index = 3;
          } else if (
            semesterText.includes("5") ||
            semesterText.includes("v")
          ) {
            index = 4;
          } else if (
            semesterText.includes("6") ||
            semesterText.includes("vi")
          ) {
            index = 5;
          }

          if (index !== -1) {
            semesterValues[index] =
              Number(record.overallCGPA) || 0;
          }
        });

        setCgpaData(semesterValues);

      } catch (error) {
        console.error(
          "GPA Chart Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCGPA();
  }, []);

  const data = {
    labels: [
      "Sem 1",
      "Sem 2",
      "Sem 3",
      "Sem 4",
      "Sem 5",
      "Sem 6",
    ],

    datasets: [
      {
        label: "CGPA",

        data: cgpaData,

        borderColor: "#3F51B5",

        backgroundColor:
          "rgba(63,81,181,0.2)",

        fill: true,

        tension: 0.4,

        pointRadius: 5,

        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "top",
      },

      title: {
        display: true,

        text: "Semester Wise CGPA",
      },
    },

    scales: {
      y: {
        min: 0,

        max: 10,
      },
    },
  };

  return (
    <div className="gpa-card">

      <div className="gpa-header">

        <h2>CGPA Performance</h2>

        <p>
          Semester Wise Academic Performance
        </p>

      </div>

      <div className="gpa-chart">

        {loading ? (
          <p>Loading CGPA...</p>
        ) : (
          <Line
            data={data}
            options={options}
          />
        )}

      </div>

    </div>
  );
};

export default GPAChart;