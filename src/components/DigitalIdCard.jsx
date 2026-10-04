import React, { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaGraduationCap,
  FaUniversity,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaDownload,
  FaPrint,
  FaRedo,
} from "react-icons/fa";

import API from "./../api";

import "./DigitalIdCard.css";

/*
=========================================================
STATIC LABELS
=========================================================
*/

const ACADEMIC_YEARS = {
  I: "1st Year",
  II: "2nd Year",
  III: "3rd Year",
  IV: "4th Year",
};

const ROLE_LABELS = {
  student: "Student Identity Card",
  faculty: "Faculty Identity Card",
  admin: "Administrator Identity Card",
};

const INSTITUTION = {
  name: "NEXUS ERP",
  tagline: "Institute of Technology & Management",
};

/*
=========================================================
HELPERS
=========================================================
*/

// Initials for the avatar fallback, e.g. "Karthik Raj"
const getInitials = (name) => {
  if (!name) return "U";

  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// "IV" -> "4th Year", anything unknown falls back to the
// raw value so a card never shows an empty year.
const formatYear = (year) => {
  if (!year) return "Not Specified";

  const key = String(year)
    .trim()
    .toUpperCase();

  return ACADEMIC_YEARS[key] || String(year);
};

const formatDate = (value) => {
  if (!value) return "Not Specified";

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not Specified";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const showValue = (value, fallback = "Not Recorded") =>
  value === null || value === undefined || value === ""
    ? fallback
    : String(value);

/*
=========================================================
DIGITAL ID CARD
=========================================================
*/

const DigitalIdCard = ({ user, onClose }) => {
  const cardRef = useRef(null);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [exporting, setExporting] = useState(false);

  /*
  =========================================================
  LOAD REAL PROFILE DATA

  Faculty and admin accounts have no Student record, so
  there is nothing to fetch and their card is built purely
  from the authenticated user. That is why `loading` is
  derived rather than stored: a staff login has nothing to
  wait for.
  =========================================================
  */

  const studentId = user?.studentId?.trim();

  const loading =
    Boolean(studentId) && result === null && error === "";

  useEffect(() => {
    if (!studentId) {
      return;
    }

    let cancelled = false;

    const fetchCard = async () => {
      try {
        const response = await API.get(
          `/students/${encodeURIComponent(studentId)}`
        );

        const student = response.data?.student;

        if (!student) {
          throw new Error(
            "No student record is linked to this login."
          );
        }

        /*
        Latest published CGPA from the marks register, with
        the CGPA stored on the student record as fallback.
        */

        let cgpa =
          student.cgpa !== undefined ? student.cgpa : null;

        try {
          const marksResponse = await API.get(
            `/marks/student/${encodeURIComponent(
              studentId
            )}/semesters`
          );

          const data = marksResponse.data;

          const semesters = Array.isArray(data)
            ? data
            : Array.isArray(data?.marks)
              ? data.marks
              : [];

          const latest =
            semesters.length > 0
              ? semesters[semesters.length - 1]
              : data;

          if (latest?.overallCGPA !== undefined) {
            cgpa = latest.overallCGPA;
          }
        } catch (marksError) {
          console.error(
            "ID Card CGPA fetch error:",
            marksError
          );
        }

        if (cancelled) {
          return;
        }

        setResult({ profile: student, cgpa });
      } catch (fetchError) {
        console.error(
          "ID Card fetch error:",
          fetchError
        );

        if (cancelled) {
          return;
        }

        setError(
          fetchError.response?.status === 404
            ? "No student record found for your login ID."
            : "Could not load your student record. Check your connection and retry."
        );
      }
    };

    fetchCard();

    return () => {
      cancelled = true;
    };
  }, [studentId, attempt]);

  const handleRetry = () => {
    setResult(null);
    setError("");
    setAttempt((count) => count + 1);
  };

  /*
  =========================================================
  CARD MODEL
  Every field below comes from the database or the JWT
  session, nothing is hard coded.
  =========================================================
  */

  const isStudent = user?.role === "student";

  const record = result?.profile || {};

  const cgpa = result?.cgpa ?? null;

  const fullName =
    record.name || user?.name || "Unnamed User";

  const cardId =
    (isStudent && record.studentId) ||
    user?.facultyId ||
    user?.id ||
    "PENDING";

  const department = showValue(
    record.department || user?.department
  );

  const year = formatYear(record.year || user?.year);

  const phone = showValue(record.phone || user?.phone);

  const email = showValue(user?.email);

  const roleLabel =
    user?.isHod === true
      ? "Head of Department"
      : ROLE_LABELS[user?.role] || "Identity Card";

  /*
  The QR encodes the public verification URL for a
  student, and a JSON payload for staff accounts that have
  no verification page.
  */

  const verifyBase =
    "https://mmksamy25102006-ship-it.github.io/studentERP";

  const qrValue = isStudent
    ? `${verifyBase}/student/${encodeURIComponent(
        record.studentId || user?.studentId || ""
      )}`
    : JSON.stringify({
        type: "nexus-erp-staff-id",
        name: fullName,
        role: user?.role,
        staffId: user?.facultyId || user?.id,
        department,
      });

  /*
  =========================================================
  DOWNLOAD AS PNG
  =========================================================
  */

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;

    setExporting(true);

    try {
      const canvas = await html2canvas(
        cardRef.current,
        {
          scale: 3,
          backgroundColor: "#0b1220",
          useCORS: true,
        }
      );

      const link = document.createElement("a");

      link.download = `NEXUS-ID-${cardId}.png`;

      link.href = canvas.toDataURL("image/png");

      link.click();
    } catch (error) {
      console.error("ID card PNG error:", error);
    } finally {
      setExporting(false);
    }
  };

  /*
  =========================================================
  SAVE AS PDF
  =========================================================
  */

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;

    setExporting(true);

    try {
      const canvas = await html2canvas(
        cardRef.current,
        {
          scale: 3,
          backgroundColor: "#0b1220",
          useCORS: true,
        }
      );

      const image = canvas.toDataURL("image/png");

      /* ID card ratio is 85.6 x 54 mm */
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 54],
      });

      pdf.addImage(
        image,
        "PNG",
        0,
        0,
        85.6,
        54
      );

      pdf.save(`NEXUS-ID-${cardId}.pdf`);
    } catch (error) {
      console.error("ID card PDF error:", error);
    } finally {
      setExporting(false);
    }
  };

  /*
  =========================================================
  PRINT
  =========================================================
  */

  const handlePrint = () => {
    window.print();
  };

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <div className="idc-overlay" onClick={onClose}>
      <div
        className="idc-shell"
        onClick={(event) => event.stopPropagation()}
      >

        {/* Header */}

        <div className="idc-shell-header">
          <div className="idc-shell-title">
            <FaIdCard />

            <div>
              <h2>Digital ID Card</h2>
              <p>
                Live record from the NEXUS ERP database
              </p>
            </div>
          </div>

          <button
            type="button"
            className="idc-close"
            onClick={onClose}
            aria-label="Close ID card"
          >
            &times;
          </button>
        </div>


        {/* Body */}

        <div className="idc-body">

          {/* Loading */}

          {loading && (
            <div className="idc-state">
              <FaSpinner className="idc-spinner" />

              <p>
                Fetching your verified record...
              </p>
            </div>
          )}


          {/* Error */}

          {!loading && error && (
            <div className="idc-state idc-state-error">
              <FaExclamationTriangle />

              <p>{error}</p>

              <button
                type="button"
                className="idc-retry"
                onClick={handleRetry}
              >
                <FaRedo />
                Retry
              </button>
            </div>
          )}


          {/* The card itself */}

          {!loading && !error && (
            <div
              className="idc-card"
              ref={cardRef}
            >

              {/* Top strip */}

              <div className="idc-topbar">
                <span className="idc-brand">
                  <FaUniversity />
                  {INSTITUTION.name}
                </span>

                <span className="idc-brand-sub">
                  {INSTITUTION.tagline}
                </span>

                <span className="idc-card-type">
                  {roleLabel}
                </span>
              </div>


              {/* Main row */}

              <div className="idc-main">

                {/* Left: photo + name */}

                <div className="idc-identity">
                  <div className="idc-photo">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={fullName}
                      />
                    ) : (
                      <span>
                        {getInitials(fullName)}
                      </span>
                    )}

                    <i className="idc-verified">
                      <FaCheckCircle />
                    </i>
                  </div>

                  <h3 className="idc-name">
                    {fullName}
                  </h3>

                  <p className="idc-designation">
                    {department}
                    {isStudent ? ` / ${year}` : ""}
                  </p>

                  <span className="idc-status">
                    <FaCheckCircle />
                    Active
                  </span>
                </div>


                {/* Right: data grid + QR */}

                <div className="idc-panel">
                  <div className="idc-grid">
                    <div className="idc-field">
                      <span>Card No</span>
                      <strong>{cardId}</strong>
                    </div>

                    <div className="idc-field">
                      <span>Role</span>
                      <strong>
                        {user?.isHod === true
                          ? "HOD"
                          : String(
                              user?.role || "student"
                            ).toUpperCase()}
                      </strong>
                    </div>

                    {isStudent && (
                      <>
                        <div className="idc-field">
                          <span>Department</span>
                          <strong>
                            {department}
                          </strong>
                        </div>

                        <div className="idc-field">
                          <span>Year</span>
                          <strong>{year}</strong>
                        </div>

                        <div className="idc-field">
                          <span>
                            <FaGraduationCap />
                            CGPA
                          </span>
                          <strong>
                            {cgpa === null ||
                            cgpa === undefined
                              ? "N/A"
                              : Number(cgpa).toFixed(2)}
                          </strong>
                        </div>
                      </>
                    )}

                    <div className="idc-field">
                      <span>
                        <FaPhone />
                        Phone
                      </span>
                      <strong>{phone}</strong>
                    </div>

                    <div className="idc-field idc-field-wide">
                      <span>
                        <FaEnvelope />
                        Email
                      </span>
                      <strong>{email}</strong>
                    </div>
                  </div>

                  <div className="idc-qr">
                    <QRCode
                      value={qrValue}
                      size={104}
                      bgColor="#ffffff"
                      fgColor="#0b1220"
                    />

                    <div className="idc-qr-caption">
                      <span>
                        {isStudent
                          ? "Scan to verify"
                          : "Scan for details"}
                      </span>

                      <strong>
                        Issued{" "}
                        {formatDate(new Date())}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>


              {/* Bottom strip */}

              <div className="idc-footer">
                <span>
                  {INSTITUTION.name} &middot; Valid until the
                  current academic session
                </span>

                <span className="idc-footer-id">
                  ID {cardId}
                </span>
              </div>
            </div>
          )}

        </div>


        {/* Actions */}

        {!loading && !error && (
          <div className="idc-actions">
            <button
              type="button"
              className="idc-action-btn"
              onClick={handleDownloadPng}
              disabled={exporting}
            >
              <FaDownload />
              Save PNG
            </button>

            <button
              type="button"
              className="idc-action-btn"
              onClick={handleDownloadPdf}
              disabled={exporting}
            >
              <FaIdCard />
              Save PDF
            </button>

            <button
              type="button"
              className="idc-action-btn"
              onClick={handlePrint}
              disabled={exporting}
            >
              <FaPrint />
              Print
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DigitalIdCard;