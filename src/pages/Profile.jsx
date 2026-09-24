import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserGraduate,
  FaIdCard,
  FaGraduationCap,
  FaEnvelope,
  FaPhone,
  FaBook,
  FaAward,
} from "react-icons/fa";

import "./Profile.css";

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [cgpa, setCgpa] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const studentId =
          localStorage.getItem("studentId") ||
          localStorage.getItem("rollNo") ||
          "STU001";

        // Student information
        const studentResponse = await axios.get(
          `https://studenterp-5wuj.onrender.com/api/students/${encodeURIComponent(
            studentId
          )}`
        );

        const studentData = studentResponse.data.student;

        setStudent(studentData);

        // CGPA
        try {
          const marksResponse = await axios.get(
            `https://studenterp-5wuj.onrender.com/api/marks/student/${encodeURIComponent(
              studentId
            )}/semesters`
          );

          const data = marksResponse.data;

          if (Array.isArray(data) && data.length > 0) {
            const latest = data[data.length - 1];

            if (latest?.overallCGPA !== undefined) {
              setCgpa(latest.overallCGPA);
            }
          } else if (
            data?.overallCGPA !== undefined
          ) {
            setCgpa(data.overallCGPA);
          } else if (
            data?.marks &&
            Array.isArray(data.marks) &&
            data.marks.length > 0
          ) {
            const latest =
              data.marks[data.marks.length - 1];

            setCgpa(latest?.overallCGPA || 0);
          } else {
            setCgpa(studentData?.cgpa || 0);
          }
        } catch (error) {
          console.error("CGPA Error:", error);
          setCgpa(studentData?.cgpa || 0);
        }
      } catch (error) {
        console.error("Profile Error:", error);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading Profile...
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <h2>Student Profile Not Found</h2>
          <p>
            Unable to load your student information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-cover">

        <div className="profile-avatar-large">
          <FaUserGraduate />
        </div>

        <div className="profile-main-info">
          <h1>{student.name}</h1>

          <p>
            <FaIdCard />
            {student.studentId}
          </p>

          <span className="profile-status">
            Active Student
          </span>
        </div>

      </div>

      {/* INFORMATION */}
      <div className="profile-content">

        <div className="profile-section">

          <div className="section-title">
            <FaIdCard />
            <h2>Student Information</h2>
          </div>

          <div className="profile-grid">

            <div className="profile-info-card">
              <FaIdCard />

              <div>
                <span>Student ID</span>
                <strong>
                  {student.studentId}
                </strong>
              </div>
            </div>

            <div className="profile-info-card">
              <FaUserGraduate />

              <div>
                <span>Full Name</span>
                <strong>
                  {student.name}
                </strong>
              </div>
            </div>

            <div className="profile-info-card">
              <FaGraduationCap />

              <div>
                <span>Department</span>
                <strong>
                  {student.department}
                </strong>
              </div>
            </div>

            <div className="profile-info-card">
              <FaBook />

              <div>
                <span>Year</span>
                <strong>
                  {student.year} Year
                </strong>
              </div>
            </div>

            <div className="profile-info-card">
              <FaEnvelope />

              <div>
                <span>Email</span>
                <strong>
                  {student.email || "Not Provided"}
                </strong>
              </div>
            </div>

            <div className="profile-info-card">
              <FaPhone />

              <div>
                <span>Phone</span>
                <strong>
                  {student.phone || "Not Provided"}
                </strong>
              </div>
            </div>

            <div className="profile-info-card">
              <FaAward />

              <div>
                <span>Current CGPA</span>
                <strong>
                  {cgpa}
                </strong>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;