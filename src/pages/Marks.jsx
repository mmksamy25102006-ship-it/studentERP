import React, { useEffect, useMemo, useState } from "react";
import {
  FaGraduationCap,
  FaChartLine,
  FaTrophy,
  FaCalculator,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import API from "../api";

import "./Marks.css";

const Marks = () => {
  const { user, loading: authLoading } = useAuth();

  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("internal");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     GET LOGGED-IN STUDENT ID
  ========================================================= */

  const studentId =
    user?.studentId ||
    localStorage.getItem("studentId") ||
    localStorage.getItem("rollNo") ||
    null;

  /* =========================================================
     FETCH LOGGED-IN STUDENT MARKS
  ========================================================= */

  useEffect(() => {
    const fetchMarks = async () => {
      /*
       * Wait until AuthContext finishes loading.
       */

      if (authLoading) {
        return;
      }

      /*
       * Student must be logged in.
       */

      if (!user) {
        setStudent(null);
        setError("Please login to view your marks.");
        setLoading(false);
        return;
      }

      /*
       * Make sure this page is being accessed by a student.
       */

      if (user.role !== "student") {
        setStudent(null);
        setError(
          "Only student accounts can view student marks."
        );
        setLoading(false);
        return;
      }

      /*
       * Every student account must have a studentId.
       */

      if (!studentId) {
        setStudent(null);
        setError(
          "Student ID is not available for this account."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log(
          "Loading marks for student:",
          studentId
        );

        /*
         * API automatically sends the JWT token
         * because src/api.js contains the interceptor.
         */

        const response = await API.get(
          `/marks/student/${encodeURIComponent(
            studentId
          )}`
        );

        console.log(
          "Student marks:",
          response.data
        );

        setStudent(response.data);
      } catch (err) {
        console.error(
          "FETCH MARKS ERROR:",
          err
        );

        /*
         * Keep old localStorage fallback.
         *
         * This is useful while existing data is being
         * migrated to MongoDB.
         */

        try {
          const savedMarks =
            JSON.parse(
              localStorage.getItem(
                "studentMarks"
              )
            ) || [];

          const localStudent =
            savedMarks.find(
              (item) =>
                item.rollNo === studentId
            );

          if (localStudent) {
            setStudent(localStudent);
          } else {
            setStudent(null);

            setError(
              err.response?.data?.message ||
                "Your marks have not been published yet."
            );
          }
        } catch (localError) {
          console.error(
            "LOCAL MARKS ERROR:",
            localError
          );

          setStudent(null);

          setError(
            err.response?.data?.message ||
              "Unable to load marks."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [
    user,
    authLoading,
    studentId,
  ]);

  /* =========================================================
     SUBJECT DATA
  ========================================================= */

  const subjects = useMemo(() => {
    if (!student) {
      return [];
    }

    if (
      Array.isArray(student.subjects)
    ) {
      return student.subjects;
    }

    /*
     * Supports old localStorage structure.
     */

    return [
      {
        subject: "Overall",
        credits: 0,
        internal1:
          student.internal1 || 0,
        internal2:
          student.internal2 || 0,
        assignment:
          student.assignment || 0,
        lab:
          student.lab || 0,
        grade:
          student.grade || "-",
        gradePoints:
          student.gradePoints || 0,
      },
    ];
  }, [student]);

  /* =========================================================
     CALCULATE INTERNAL TOTAL
  ========================================================= */

  const calculateInternalTotal = (
    subject
  ) =>
    Number(
      subject.internal1 || 0
    ) +
    Number(
      subject.internal2 || 0
    ) +
    Number(
      subject.assignment || 0
    ) +
    Number(
      subject.lab || 0
    );

  /* =========================================================
     TOTAL MARKS
  ========================================================= */

  const totalMarks = subjects.reduce(
    (sum, subject) =>
      sum +
      calculateInternalTotal(
        subject
      ),
    0
  );

  /* =========================================================
     MAXIMUM MARKS
  ========================================================= */

  const maxMarks =
    subjects.length * 75;

  /* =========================================================
     PERCENTAGE
  ========================================================= */

  const percentage =
    maxMarks > 0
      ? (
          (totalMarks /
            maxMarks) *
          100
        ).toFixed(1)
      : "0.0";

  /* =========================================================
     SEMESTER SGPA
  ========================================================= */

  const semesterSGPA = useMemo(() => {
    if (!subjects.length) {
      return "0.00";
    }

    let weightedPoints = 0;
    let totalCredits = 0;

    subjects.forEach(
      (subject) => {
        const credits =
          Number(
            subject.credits || 0
          );

        const points =
          Number(
            subject.gradePoints || 0
          );

        weightedPoints +=
          credits * points;

        totalCredits +=
          credits;
      }
    );

    return totalCredits
      ? (
          weightedPoints /
          totalCredits
        ).toFixed(2)
      : "0.00";
  }, [subjects]);

  /* =========================================================
     OVERALL CGPA
  ========================================================= */

  const overallCGPA = Number(
    student?.overallCGPA ||
      semesterSGPA
  ).toFixed(2);

  /* =========================================================
     PREDICTED RANK
  ========================================================= */

  const predictedRank =
    student?.predictedRank ||
    "--";

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="marks-page marks-loading">
        <div className="loading-spinner"></div>

        <p>
          Loading marks...
        </p>
      </div>
    );
  }

  /* =========================================================
     NO STUDENT DATA
  ========================================================= */

  if (!student) {
    return (
      <div className="marks-page">

        <div className="marks-empty">

          <FaGraduationCap />

          <h2>
            No Marks Available
          </h2>

          <p>
            {error ||
              "Your marks have not been published yet."}
          </p>

        </div>

      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="marks-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="marks-header">

        <div className="marks-title-studentdashboard">

          <div className="marks-title-icon">
            <FaGraduationCap />
          </div>

          <div>

            <h1>
              Marks & GPA
            </h1>

            <p>
              Internal assessments, semester
              results and GPA tools
            </p>

          </div>

        </div>

      </header>

      {/* ========================================
          TABS
      ======================================== */}

      <nav className="marks-tabs">

        <button
          className={
            activeTab === "internal"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "internal"
            )
          }
        >
          Internal Marks
        </button>

        <button
          className={
            activeTab === "semester"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "semester"
            )
          }
        >
          Semester Marks
        </button>

        <button
          className={
            activeTab === "gpa"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("gpa")
          }
        >
          <FaCalculator />
          CGPA / GPA Calculator
        </button>

        <button
          className={
            activeTab === "performance"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab(
              "performance"
            )
          }
        >
          <FaChartLine />
          Performance Graph
        </button>

      </nav>

      {/* ========================================
          STUDENT INFO
      ======================================== */}

      <div className="student-info-bar">

        <div>

          <span>
            STUDENT
          </span>

          <strong>
            {student.name ||
              user?.name ||
              "Student"}
          </strong>

        </div>

        <div>

          <span>
            STUDENT ID
          </span>

          <strong>
            {student.rollNo ||
              studentId}
          </strong>

        </div>

        <div>

          <span>
            SEMESTER
          </span>

          <strong>
            {student.semester ||
              "Semester I"}
          </strong>

        </div>

      </div>

      {/* ========================================
          INTERNAL MARKS
      ======================================== */}

      {activeTab ===
        "internal" && (
        <>
          <section className="marks-card">

            <div className="card-heading">

              <div>

                <h2>
                  Internal Assessment
                </h2>

                <p>
                  CIA, assignment and
                  laboratory performance
                </p>

              </div>

              <span className="semester-badge">
                {student.semester ||
                  "Semester I"}
              </span>

            </div>

            <div className="table-wrapper">

              <table className="marks-table">

                <thead>

                  <tr>

                    <th>
                      SUBJECT
                    </th>

                    <th>
                      CREDITS
                    </th>

                    <th>
                      CIA 1
                      <br />
                      / 20
                    </th>

                    <th>
                      CIA 2
                      <br />
                      / 20
                    </th>

                    <th>
                      ASSIGNMENT
                      <br />
                      / 10
                    </th>

                    <th>
                      LAB
                      <br />
                      / 25
                    </th>

                    <th>
                      TOTAL
                    </th>

                    <th>
                      GRADE
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {subjects.map(
                    (
                      subject,
                      index
                    ) => {

                      const total =
                        calculateInternalTotal(
                          subject
                        );

                      return (
                        <tr
                          key={`${subject.subject}-${index}`}
                        >

                          <td className="subject-name">
                            {subject.subject}
                          </td>

                          <td>
                            {subject.credits}
                          </td>

                          <td>
                            {subject.internal1}
                          </td>

                          <td>
                            {subject.internal2}
                          </td>

                          <td>
                            {subject.assignment}
                          </td>

                          <td>
                            {subject.lab}
                          </td>

                          <td className="total-cell">
                            {total}/75
                          </td>

                          <td>

                            <span
                              className={`grade grade-${String(
                                subject.grade ||
                                  "-"
                              )
                                .replace(
                                  "+",
                                  "plus"
                                )
                                .replace(
                                  "-",
                                  "minus"
                                )}`}
                            >
                              {subject.grade ||
                                "-"}
                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* ====================================
              SUMMARY CARDS
          ==================================== */}

          <section className="gpa-summary">

            <div className="gpa-card">

              <div className="gpa-card-content">

                <span>
                  This Semester SGPA
                </span>

                <strong>
                  {semesterSGPA}
                </strong>

              </div>

              <FaChartLine />

            </div>

            <div className="gpa-card">

              <div className="gpa-card-content">

                <span>
                  Overall CGPA
                </span>

                <strong>
                  {overallCGPA}
                </strong>

              </div>

              <FaGraduationCap />

            </div>

            <div className="gpa-card">

              <div className="gpa-card-content">

                <span>
                  Predicted Class Rank
                </span>

                <strong>
                  {predictedRank ===
                  "--"
                    ? "--"
                    : `~${predictedRank}`}
                </strong>

              </div>

              <FaTrophy />

            </div>

          </section>
        </>
      )}

      {/* ========================================
          SEMESTER MARKS
      ======================================== */}

      {activeTab ===
        "semester" && (
        <section className="marks-card">

          <div className="card-heading">

            <div>

              <h2>
                Semester Marks
              </h2>

              <p>
                Complete semester
                performance
              </p>

            </div>

          </div>

          <div className="table-wrapper">

            <table className="marks-table">

              <thead>

                <tr>

                  <th>
                    SUBJECT
                  </th>

                  <th>
                    CREDITS
                  </th>

                  <th>
                    GRADE
                  </th>

                  <th>
                    GRADE POINTS
                  </th>

                </tr>

              </thead>

              <tbody>

                {subjects.map(
                  (
                    subject,
                    index
                  ) => (
                    <tr
                      key={`${subject.subject}-semester-${index}`}
                    >

                      <td className="subject-name">
                        {subject.subject}
                      </td>

                      <td>
                        {subject.credits}
                      </td>

                      <td>

                        <span
                          className={`grade grade-${String(
                            subject.grade ||
                              "-"
                          )
                            .replace(
                              "+",
                              "plus"
                            )
                            .replace(
                              "-",
                              "minus"
                            )}`}
                        >
                          {subject.grade ||
                            "-"}
                        </span>

                      </td>

                      <td className="points-cell">
                        {subject.gradePoints ||
                          0}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>
      )}

      {/* ========================================
          GPA
      ======================================== */}

      {activeTab ===
        "gpa" && (
        <section className="gpa-calculator-card">

          <div className="calculator-icon">
            <FaCalculator />
          </div>

          <h2>
            CGPA / GPA Calculator
          </h2>

          <p>
            Your current academic
            performance
          </p>

          <div className="big-gpa">
            {overallCGPA}
          </div>

          <span className="gpa-label">
            Overall CGPA
          </span>

        </section>
      )}

      {/* ========================================
          PERFORMANCE
      ======================================== */}

      {activeTab ===
        "performance" && (
        <section className="performance-card">

          <div className="performance-header">

            <div>

              <h2>
                Performance Overview
              </h2>

              <p>
                Subject-wise internal
                performance
              </p>

            </div>

          </div>

          <div className="performance-list">

            {subjects.map(
              (
                subject,
                index
              ) => {

                const total =
                  calculateInternalTotal(
                    subject
                  );

                const progress =
                  Math.min(
                    (total / 75) *
                      100,
                    100
                  );

                return (
                  <div
                    className="performance-item"
                    key={index}
                  >

                    <div className="performance-info">

                      <strong>
                        {subject.subject}
                      </strong>

                      <span>
                        {total}/75
                      </span>

                    </div>

                    <div className="progress-track">

                      <div
                        className="progress-fill"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>
      )}

      {/* ========================================
          OVERALL FOOTER STAT
      ======================================== */}

      <div className="marks-footer-stat">

        <div>

          <span>
            Total Internal Marks
          </span>

          <strong>
            {totalMarks}/
            {maxMarks}
          </strong>

        </div>

        <div>

          <span>
            Percentage
          </span>

          <strong>
            {percentage}%
          </strong>

        </div>

        <div>

          <span>
            Academic Status
          </span>

          <strong className="status-pass">
            GOOD STANDING
          </strong>

        </div>

      </div>

    </div>
  );
};

export default Marks;