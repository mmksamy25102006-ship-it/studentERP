import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import axios from "axios";

import {
  FaQrcode,
  FaDownload,
  FaIdCard,
} from "react-icons/fa";

import "./QRCodeCard.css";

const QRCodeCard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        /*
        =====================================================
        GET STUDENT ID FROM LOGIN DATA
        =====================================================
        */

        let studentId =
          localStorage.getItem("studentId") ||
          localStorage.getItem("rollNo");

        /*
        Check stored user object if direct studentId
        was not found.
        */

        if (!studentId) {
          const storedUser =
            localStorage.getItem("user");

          if (storedUser) {
            try {
              const user =
                JSON.parse(storedUser);

              studentId =
                user.studentId ||
                user.rollNo ||
                user.id;
            } catch (error) {
              console.error(
                "Unable to read stored user:",
                error
              );
            }
          }
        }

        /*
        =====================================================
        DEBUG
        =====================================================
        */

        console.log(
          "QR STUDENT ID:",
          studentId
        );

        console.log(
          "LOCAL STORAGE:",
          { ...localStorage }
        );

        if (!studentId) {
          console.error(
            "No student ID found in localStorage."
          );

          setLoading(false);
          return;
        }

        /*
        =====================================================
        FETCH REAL STUDENT
        =====================================================
        */

        const response = await axios.get(
          `https://studenterp-5wuj.onrender.com/api/students/${encodeURIComponent(
            studentId
          )}`
        );

        console.log(
          "QR STUDENT RESPONSE:",
          response.data
        );

        setStudent(
          response.data.student
        );

      } catch (error) {
        console.error(
          "QR Student Fetch Error:",
          error
        );

        if (error.response) {
          console.error(
            "Backend response:",
            error.response.data
          );
        }

        setStudent(null);

      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

  /*
  =========================================================
  DOWNLOAD QR
  =========================================================
  */

  const downloadQR = () => {
    const svg =
      document.getElementById("studentQR");

    if (!svg) return;

    const svgData =
      new XMLSerializer().serializeToString(svg);

    const canvas =
      document.createElement("canvas");

    const ctx =
      canvas.getContext("2d");

    const img =
      new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;

      ctx.fillStyle = "#ffffff";

      ctx.fillRect(
        0,
        0,
        300,
        300
      );

      ctx.drawImage(
        img,
        0,
        0,
        300,
        300
      );

      const pngFile =
        canvas.toDataURL(
          "image/png"
        );

      const downloadLink =
        document.createElement("a");

      downloadLink.download =
        `${student.studentId}-QR.png`;

      downloadLink.href =
        pngFile;

      downloadLink.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      window.btoa(
        unescape(
          encodeURIComponent(svgData)
        )
      );
  };

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <div className="qr-card">

        <div className="qr-header">
          <FaQrcode />
          <h2>Student QR Code</h2>
        </div>

        <p>
          Loading student information...
        </p>

      </div>
    );
  }

  /*
  =========================================================
  STUDENT NOT FOUND
  =========================================================
  */

  if (!student) {
    return (
      <div className="qr-card">

        <div className="qr-header">
          <FaQrcode />
          <h2>Student QR Code</h2>
        </div>

        <p>
          Student information not found.
        </p>

      </div>
    );
  }

  /*
  =========================================================
  QR VALUE
  =========================================================
  */


const qrValue =
  `https://mmksamy25102006-ship-it.github.io/studentERP/student/${student.studentId}`;
  
  return (
    <div className="qr-card">

      <div className="qr-header">
        <FaQrcode />
        <h2>Student QR Code</h2>
      </div>

      <div className="student-info">

        <FaIdCard className="id-icon" />

        <h3>
          {student.name}
        </h3>

        <p>
          ID : {student.studentId}
        </p>

        <p>
          {student.department}
        </p>

        <p>
          {student.year} Year
        </p>

      </div>

      <div className="qr-code-box">

        <QRCode
          id="studentQR"
          value={qrValue}
          size={180}
        />

      </div>

      <p className="qr-scan-text">
        Scan to view Student Profile
      </p>

      <button
        className="download-btn"
        onClick={downloadQR}
      >
        <FaDownload />
        Download QR
      </button>

    </div>
  );
};

export default QRCodeCard;