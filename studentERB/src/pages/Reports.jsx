import React, { useState } from "react";
import {
  FaChartBar,
  FaFilePdf,
  FaFileExcel,
  FaDownload,
  FaUsers,
  FaUserGraduate,
  FaMoneyBillWave,
  FaClipboardCheck,
} from "react-icons/fa";
import "./Reports.css";

const Reports = () => {
  const [reports] = useState([
    {
      id: 1,
      title: "Student Report",
      description: "Complete student details and academic performance.",
      icon: <FaUserGraduate />,
      color: "#4CAF50",
    },
    {
      id: 2,
      title: "Faculty Report",
      description: "Faculty information and workload summary.",
      icon: <FaUsers />,
      color: "#2196F3",
    },
    {
      id: 3,
      title: "Attendance Report",
      description: "Department-wise attendance report.",
      icon: <FaClipboardCheck />,
      color: "#FF9800",
    },
    {
      id: 4,
      title: "Fee Collection Report",
      description: "Semester fee payment summary.",
      icon: <FaMoneyBillWave />,
      color: "#E91E63",
    },
  ]);

  return (
    <div className="reports-page">

      <div className="reports-header">
        <h1>
          <FaChartBar /> Reports
        </h1>
        <p>Generate and Download College ERP Reports</p>
      </div>

      <div className="report-grid">
        {reports.map((report) => (
          <div className="report-card" key={report.id}>

            <div
              className="report-icon"
              style={{ background: report.color }}
            >
              {report.icon}
            </div>

            <h2>{report.title}</h2>

            <p>{report.description}</p>

            <div className="report-actions">

              <button className="pdf-btn">
                <FaFilePdf />
                PDF
              </button>

              <button className="excel-btn">
                <FaFileExcel />
                Excel
              </button>

            </div>

          </div>
        ))}
      </div>

      <div className="summary-section">

        <h2>Quick Statistics</h2>

        <div className="summary-grid">

          <div className="summary-card">
            <h3>Students</h3>
            <span>1250</span>
          </div>

          <div className="summary-card">
            <h3>Faculty</h3>
            <span>85</span>
          </div>

          <div className="summary-card">
            <h3>Courses</h3>
            <span>42</span>
          </div>

          <div className="summary-card">
            <h3>Attendance</h3>
            <span>94%</span>
          </div>

        </div>

      </div>

      <div className="download-all">
        <button className="download-btn">
          <FaDownload />
          Download Complete Report
        </button>
      </div>

    </div>
  );
};

export default Reports;