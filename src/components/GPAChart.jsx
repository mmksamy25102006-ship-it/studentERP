import React from "react";
import { Line } from "react-chartjs-2";

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
  const data = {
    labels: [
      "Sem 1",
      "Sem 2",
      "Sem 3",
      "Sem 4",
      "Sem 5",
      "Sem 6",
      "Sem 7",
      "Sem 8",
    ],

    datasets: [
      {
        label: "CGPA",
        data: [7.8, 8.1, 8.3, 8.5, 8.6, 8.7, 8.8, 9.0],
        borderColor: "#3F51B5",
        backgroundColor: "rgba(63,81,181,0.2)",
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
        <p>Semester Wise Academic Performance</p>
      </div>

      <div className="gpa-chart">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default GPAChart;
