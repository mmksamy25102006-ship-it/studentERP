import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import {
  FaUserGraduate,
  FaIdCard,
  FaGraduationCap,
  FaCheckCircle,
  FaPhone,
} from "react-icons/fa";

import "./StudentProfile.css";

const StudentProfile = () => {
  const { studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await axios.get(
          `https://studenterp-5wuj.onrender.com/api/students/${studentId}`
        );

        setStudent(response.data.student);

      } catch (error) {
        console.error(
          "Student Profile Error:",
          error
        );

        setStudent(null);

      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="student-profile-page">
        <div className="student-profile-card">
          <h2>Loading Student Profile...</h2>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="student-profile-page">
        <div className="student-profile-card">
          <h2>Student Not Found</h2>

          <p>
            The student ID is invalid or the
            student does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-profile-page">

      <div className="student-profile-card">

        {/* HEADER */}

        <div className="profile-header">

          <div className="profile-avatar">
            <FaUserGraduate />
          </div>

          <div>

            <h1>
              {student.name}
            </h1>

            <p>
              <FaIdCard />
              {student.studentId}
            </p>

          </div>

        </div>


        {/* VERIFIED */}

        <div className="verified-badge">

          <FaCheckCircle />

          Verified Student

        </div>


        {/* DETAILS */}

        <div className="profile-details">

          <div className="profile-item">

            <FaIdCard />

            <div>

              <span>
                Student ID
              </span>

              <strong>
                {student.studentId}
              </strong>

            </div>

          </div>


          <div className="profile-item">

            <FaGraduationCap />

            <div>

              <span>
                Department
              </span>

              <strong>
                {student.department}
              </strong>

            </div>

          </div>


          <div className="profile-item">

            <FaGraduationCap />

            <div>

              <span>
                Year
              </span>

              <strong>
                {student.year} Year
              </strong>

            </div>

          </div>


          <div className="profile-item">

            <FaGraduationCap />

            <div>

              <span>
                Current CGPA
              </span>

              <strong>
                {student.cgpa}
              </strong>

            </div>

          </div>


          <div className="profile-item">

            <FaPhone />

            <div>

              <span>
                Phone
              </span>

              <strong>
                {student.phone || "Not Provided"}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentProfile;