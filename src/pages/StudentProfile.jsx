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
  const [cgpa, setCgpa] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        // Fetch student details
        const studentResponse = await axios.get(
          `https://studenterp-5wuj.onrender.com/api/students/${encodeURIComponent(
            studentId
          )}`
        );

        setStudent(studentResponse.data.student);

        // Fetch marks and get overall CGPA
        try {
          const marksResponse = await axios.get(
            `https://studenterp-5wuj.onrender.com/api/marks/student/${encodeURIComponent(
              studentId
            )}/semesters`
          );

          const marksData = marksResponse.data;

          // Handle different possible API response structures
          if (Array.isArray(marksData)) {
            const latestMark = marksData[marksData.length - 1];

            if (latestMark?.overallCGPA !== undefined) {
              setCgpa(latestMark.overallCGPA);
            }
          } else if (marksData?.marks && Array.isArray(marksData.marks)) {
            const latestMark =
              marksData.marks[marksData.marks.length - 1];

            if (latestMark?.overallCGPA !== undefined) {
              setCgpa(latestMark.overallCGPA);
            }
          } else if (marksData?.overallCGPA !== undefined) {
            setCgpa(marksData.overallCGPA);
          }
        } catch (marksError) {
          console.error("CGPA Fetch Error:", marksError);

          // Fallback to student API CGPA
          setCgpa(studentResponse.data.student?.cgpa || 0);
        }
      } catch (error) {
        console.error("Student Profile Error:", error);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentProfile();
    }
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
            The student ID is invalid or the student does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-profile-page">
      <div className="student-profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUserGraduate />
          </div>

          <div>
            <h1>{student.name}</h1>

            <p>
              <FaIdCard />
              {student.studentId}
            </p>
          </div>
        </div>

        <div className="verified-badge">
          <FaCheckCircle />
          Verified Student
        </div>

        <div className="profile-details">
          <div className="profile-item">
            <FaIdCard />

            <div>
              <span>Student ID</span>
              <strong>{student.studentId}</strong>
            </div>
          </div>

          <div className="profile-item">
            <FaGraduationCap />

            <div>
              <span>Department</span>
              <strong>{student.department}</strong>
            </div>
          </div>

          <div className="profile-item">
            <FaGraduationCap />

            <div>
              <span>Year</span>
              <strong>{student.year} Year</strong>
            </div>
          </div>

          <div className="profile-item">
            <FaGraduationCap />

            <div>
              <span>Current CGPA</span>
              <strong>{cgpa}</strong>
            </div>
          </div>

          <div className="profile-item">
            <FaPhone />

            <div>
              <span>Phone</span>
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