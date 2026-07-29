import React, { useState } from "react";
import QRCode from "react-qr-code";
import {
  FaQrcode,
  FaDownload,
  FaIdCard,
} from "react-icons/fa";
import "./QRCodeCard.css";

const QRCodeCard = () => {
  const [student] = useState({
    id: "STU2026001",
    name: "John Doe",
    department: "Computer Science",
    year: "III Year",
    email: "john@example.com",
  });

  const qrValue = JSON.stringify(student);

  const downloadQR = () => {
    const svg = document.getElementById("studentQR");
    const svgData = new XMLSerializer().serializeToString(svg);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 300, 300);

      ctx.drawImage(img, 0, 0, 300, 300);

      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = "StudentQRCode.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      window.btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="qr-card">

      <div className="qr-header">
        <FaQrcode />
        <h2>Student QR Code</h2>
      </div>

      <div className="student-info">

        <FaIdCard className="id-icon" />

        <h3>{student.name}</h3>

        <p>ID : {student.id}</p>

        <p>{student.department}</p>

        <p>{student.year}</p>

      </div>

      <div className="qr-code-box">
        <QRCode
          id="studentQR"
          value={qrValue}
          size={180}
        />
      </div>

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