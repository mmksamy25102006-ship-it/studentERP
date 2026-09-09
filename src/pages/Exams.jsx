import React, { useState } from "react";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTimes,
  FaGraduationCap,
  FaInfoCircle,
} from "react-icons/fa";
import "./Exams.css";

const Exams = () => {
  const [exams] = useState([
    {
      id: 1,
      subject: "Database Management System",
      date: "10 Dec 2026",
      time: "09:00 AM - 12:00 PM",
      room: "Hall A1",
      status: "Upcoming",
    },
    {
      id: 2,
      subject: "Operating System",
      date: "12 Dec 2026",
      time: "09:00 AM - 12:00 PM",
      room: "Hall A2",
      status: "Upcoming",
    },
    {
      id: 3,
      subject: "Computer Networks",
      date: "15 Dec 2026",
      time: "01:00 PM - 04:00 PM",
      room: "Hall B1",
      status: "Upcoming",
    },
    {
      id: 4,
      subject: "Java Programming",
      date: "18 Dec 2026",
      time: "09:00 AM - 12:00 PM",
      room: "Lab-1",
      status: "Upcoming",
    },
    {
      id: 5,
      subject: "Artificial Intelligence",
      date: "20 Dec 2026",
      time: "01:00 PM - 04:00 PM",
      room: "Hall C1",
      status: "Upcoming",
    },
  ]);

  const [selectedExam, setSelectedExam] = useState(null);

  const openDetails = (exam) => {
    setSelectedExam(exam);
  };

  const closeDetails = () => {
    setSelectedExam(null);
  };

  return (
    <div className="exams-page">

      {/* =========================
              PAGE HEADER
      ========================= */}

      <div className="exams-header">

        <div className="exams-header-left">

          <div className="exams-header-icon">
            <FaBookOpen />
          </div>

          <div>
            <h1>Examination Schedule</h1>
            <p>Semester End Examination Timetable</p>
          </div>

        </div>

        <div className="exam-total">
          <FaGraduationCap />
          <div>
            <span>Total Exams</span>
            <strong>{exams.length}</strong>
          </div>
        </div>

      </div>

      {/* =========================
              EXAM GRID
      ========================= */}

      <div className="exam-grid">

        {exams.map((exam) => (

          <div className="exam-card" key={exam.id}>

            <div className="exam-card-top">

              <div className="exam-subject-icon">
                <FaBookOpen />
              </div>

              <span className="exam-status">
                {exam.status}
              </span>

            </div>

            <h2>{exam.subject}</h2>

            <div className="exam-info">

              <div className="exam-info-row">
                <div className="exam-info-icon">
                  <FaCalendarAlt />
                </div>

                <div>
                  <span>Date</span>
                  <strong>{exam.date}</strong>
                </div>
              </div>

              <div className="exam-info-row">
                <div className="exam-info-icon">
                  <FaClock />
                </div>

                <div>
                  <span>Time</span>
                  <strong>{exam.time}</strong>
                </div>
              </div>

              <div className="exam-info-row">
                <div className="exam-info-icon">
                  <FaMapMarkerAlt />
                </div>

                <div>
                  <span>Examination Hall</span>
                  <strong>{exam.room}</strong>
                </div>
              </div>

            </div>

            <button
              className="exam-btn"
              onClick={() => openDetails(exam)}
            >
              <FaInfoCircle />
              View Details
            </button>

          </div>

        ))}

      </div>

      {/* =========================
              DETAILS MODAL
      ========================= */}

      {selectedExam && (

        <div
          className="exam-modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="exam-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="exam-modal-header">

              <div className="exam-modal-title">

                <div className="exam-modal-icon">
                  <FaBookOpen />
                </div>

                <div>
                  <h2>Exam Details</h2>
                  <p>Examination schedule information</p>
                </div>

              </div>

              <button
                className="exam-modal-close"
                onClick={closeDetails}
                type="button"
              >
                <FaTimes />
              </button>

            </div>

            {/* Modal Body */}

            <div className="exam-modal-body">

              <div className="modal-subject">
                <span>SUBJECT</span>
                <h3>{selectedExam.subject}</h3>
              </div>

              <div className="modal-status-row">

                <span className="modal-status">
                  {selectedExam.status}
                </span>

                <span className="modal-exam-id">
                  Exam ID: EXM00{selectedExam.id}
                </span>

              </div>

              <div className="modal-details-grid">

                <div className="modal-detail-card">

                  <div className="modal-detail-icon">
                    <FaCalendarAlt />
                  </div>

                  <div>
                    <span>Examination Date</span>
                    <strong>{selectedExam.date}</strong>
                  </div>

                </div>

                <div className="modal-detail-card">

                  <div className="modal-detail-icon">
                    <FaClock />
                  </div>

                  <div>
                    <span>Examination Time</span>
                    <strong>{selectedExam.time}</strong>
                  </div>

                </div>

                <div className="modal-detail-card">

                  <div className="modal-detail-icon">
                    <FaMapMarkerAlt />
                  </div>

                  <div>
                    <span>Examination Hall</span>
                    <strong>{selectedExam.room}</strong>
                  </div>

                </div>

                <div className="modal-detail-card">

                  <div className="modal-detail-icon">
                    <FaGraduationCap />
                  </div>

                  <div>
                    <span>Exam Type</span>
                    <strong>Semester End</strong>
                  </div>

                </div>

              </div>

            </div>

            {/* Modal Footer */}

            <div className="exam-modal-footer">

              <button
                className="modal-close-btn"
                onClick={closeDetails}
              >
                <FaTimes />
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Exams;