import React, { useEffect, useMemo, useState } from "react";
import {
  FaSave,
  FaUserGraduate,
  FaBook,
  FaCheckCircle,
  FaExclamationCircle,
  FaSyncAlt,
} from "react-icons/fa";

import API from "../../api";
import "./FacultyMarks.css";

/* =========================================================
   DEFAULT STUDENTS
   Used only when no students exist in MongoDB yet
========================================================= */

const initialStudents = [
  {
    id: 1,
    rollNo: "22CS001",
    name: "Arun Kumar",
  },
  {
    id: 2,
    rollNo: "22CS002",
    name: "Priya",
  },
  {
    id: 3,
    rollNo: "22CS003",
    name: "Rahul",
  },
  {
    id: 4,
    rollNo: "22CS004",
    name: "Sneha",
  },
];

/* =========================================================
   SUBJECTS
========================================================= */

const defaultSubjects = [
  {
    subject: "Data Structures",
    credits: 4,
    internal1: 0,
    internal2: 0,
    assignment: 0,
    lab: 0,
    grade: "-",
    gradePoints: 0,
  },
  {
    subject: "Operating Systems",
    credits: 4,
    internal1: 0,
    internal2: 0,
    assignment: 0,
    lab: 0,
    grade: "-",
    gradePoints: 0,
  },
  {
    subject: "Computer Networks",
    credits: 3,
    internal1: 0,
    internal2: 0,
    assignment: 0,
    lab: 0,
    grade: "-",
    gradePoints: 0,
  },
  {
    subject: "DBMS",
    credits: 3,
    internal1: 0,
    internal2: 0,
    assignment: 0,
    lab: 0,
    grade: "-",
    gradePoints: 0,
  },
  {
    subject: "AI & Machine Learning",
    credits: 4,
    internal1: 0,
    internal2: 0,
    assignment: 0,
    lab: 0,
    grade: "-",
    gradePoints: 0,
  },
  {
    subject: "Software Engineering",
    credits: 3,
    internal1: 0,
    internal2: 0,
    assignment: 0,
    lab: 0,
    grade: "-",
    gradePoints: 0,
  },
];

/* =========================================================
   GRADE CALCULATOR
========================================================= */

const calculateGrade = (total) => {
  if (total >= 70) {
    return {
      grade: "A+",
      gradePoints: 10,
    };
  }

  if (total >= 60) {
    return {
      grade: "A",
      gradePoints: 9,
    };
  }

  if (total >= 50) {
    return {
      grade: "B+",
      gradePoints: 8,
    };
  }

  if (total >= 40) {
    return {
      grade: "B",
      gradePoints: 7,
    };
  }

  if (total >= 30) {
    return {
      grade: "C",
      gradePoints: 6,
    };
  }

  return {
    grade: "F",
    gradePoints: 0,
  };
};

/* =========================================================
   COMPONENT
========================================================= */

const FacultyMarks = () => {
  const [students, setStudents] = useState(initialStudents);

  const [selectedRollNo, setSelectedRollNo] =
    useState(initialStudents[0].rollNo);

  const [subjects, setSubjects] = useState(
    defaultSubjects.map((item) => ({ ...item }))
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =======================================================
     LOAD ALL STUDENTS + MARKS
  ======================================================= */

  const fetchStudentsAndMarks = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * First get actual students from MongoDB.
       *
       * This is important because the faculty should
       * be able to manage marks for many students.
       */

      let studentList = [];

      try {
        const studentResponse = await API.get("/students");

        const backendStudents =
          Array.isArray(studentResponse.data)
            ? studentResponse.data
            : studentResponse.data?.students || [];

        if (backendStudents.length > 0) {
          studentList = backendStudents.map(
            (student, index) => ({
              id: student._id || index + 1,

              /*
               * Student model currently uses studentId.
               * Existing Mark model uses rollNo.
               *
               * We use studentId as rollNo when available.
               */

              rollNo:
                student.studentId ||
                student.rollNo ||
                "",

              name:
                student.name ||
                "Student",
            })
          );

          /*
           * Remove students that don't have an identifier.
           */

          studentList = studentList.filter(
            (student) => student.rollNo
          );
        }
      } catch (studentError) {
        console.error(
          "FETCH STUDENTS ERROR:",
          studentError
        );
      }

      /*
       * If MongoDB has no students yet,
       * keep your existing fallback students.
       */

      if (studentList.length === 0) {
        studentList = initialStudents;
      }

      setStudents(studentList);

      /*
       * If the currently selected student no longer exists,
       * select the first available student.
       */

      const selectedExists = studentList.some(
        (student) =>
          student.rollNo === selectedRollNo
      );

      let activeRollNo = selectedRollNo;

      if (!selectedExists) {
        activeRollNo = studentList[0].rollNo;
        setSelectedRollNo(activeRollNo);
      }

      /*
       * Fetch all marks.
       */

      const marksResponse = await API.get("/marks");

      const backendMarks =
        Array.isArray(marksResponse.data)
          ? marksResponse.data
          : marksResponse.data?.marks || [];

      /*
       * Keep students that already have marks in the list
       * even if they are not present in the Student collection.
       *
       * This prevents existing marks from disappearing.
       */

      const existingStudentMap = new Map();

      backendMarks.forEach((mark, index) => {
        if (!mark.rollNo) return;

        existingStudentMap.set(mark.rollNo, {
          id: mark._id || `mark-${index}`,
          rollNo: mark.rollNo,
          name: mark.name || "Student",
        });
      });

      studentList.forEach((student) => {
        existingStudentMap.set(
          student.rollNo,
          student
        );
      });

      const combinedStudents = Array.from(
        existingStudentMap.values()
      );

      setStudents(combinedStudents);

      /*
       * Load marks for selected student.
       */

      const selectedMark = backendMarks.find(
        (mark) =>
          mark.rollNo === activeRollNo
      );

      if (selectedMark) {
        loadStudentSubjects(selectedMark);
      } else {
        setSubjects(
          defaultSubjects.map((item) => ({
            ...item,
          }))
        );
      }
    } catch (err) {
      console.error(
        "FETCH STUDENT MARKS ERROR:",
        err
      );

      /*
       * Keep existing fallback behavior.
       */

      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.message ||
            "Unable to load student marks from server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD SELECTED STUDENT SUBJECTS
  ======================================================= */

  const loadStudentSubjects = (student) => {
    if (
      student &&
      Array.isArray(student.subjects) &&
      student.subjects.length > 0
    ) {
      const mergedSubjects =
        defaultSubjects.map(
          (defaultSubject) => {
            const savedSubject =
              student.subjects.find(
                (item) =>
                  item.subject ===
                  defaultSubject.subject
              );

            if (savedSubject) {
              return {
                ...defaultSubject,
                ...savedSubject,
              };
            }

            return {
              ...defaultSubject,
            };
          }
        );

      setSubjects(mergedSubjects);
    } else {
      setSubjects(
        defaultSubjects.map((item) => ({
          ...item,
        }))
      );
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchStudentsAndMarks();
  }, []);

  /* =======================================================
     WHEN STUDENT CHANGES
  ======================================================= */

  const handleStudentChange = async (rollNo) => {
    setSelectedRollNo(rollNo);

    setMessage("");
    setError("");

    /*
     * Reset subjects while loading the selected student's
     * marks so marks from another student are not displayed.
     */

    setSubjects(
      defaultSubjects.map((item) => ({
        ...item,
      }))
    );

    try {
      const response = await API.get(
        `/marks/student/${encodeURIComponent(
          rollNo
        )}`
      );

      loadStudentSubjects(response.data);
    } catch (err) {
      /*
       * Student does not have marks yet.
       * Start with empty subjects.
       */

      if (err.response?.status !== 404) {
        console.error(
          "LOAD STUDENT MARKS ERROR:",
          err
        );
      }

      setSubjects(
        defaultSubjects.map((item) => ({
          ...item,
        }))
      );
    }
  };

  /* =======================================================
     INPUT CHANGE
  ======================================================= */

  const handleChange = (
    index,
    field,
    value
  ) => {
    let numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      numericValue = 0;
    }

    /* ---------------------------------
       Maximum marks
    --------------------------------- */

    const limits = {
      internal1: 20,
      internal2: 20,
      assignment: 10,
      lab: 25,
    };

    const max = limits[field];

    if (numericValue < 0) {
      numericValue = 0;
    }

    if (
      max &&
      numericValue > max
    ) {
      numericValue = max;
    }

    setSubjects((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: numericValue,
      };

      /* Calculate total */

      const total =
        Number(
          updated[index].internal1 || 0
        ) +
        Number(
          updated[index].internal2 || 0
        ) +
        Number(
          updated[index].assignment || 0
        ) +
        Number(
          updated[index].lab || 0
        );

      /* Calculate grade */

      const gradeData =
        calculateGrade(total);

      updated[index] = {
        ...updated[index],

        grade: gradeData.grade,

        gradePoints:
          gradeData.gradePoints,
      };

      return updated;
    });
  };

  /* =======================================================
     CALCULATE SGPA
  ======================================================= */

  const sgpa = useMemo(() => {
    let totalCredits = 0;
    let weightedPoints = 0;

    subjects.forEach((subject) => {
      const credits =
        Number(subject.credits || 0);

      const gradePoints =
        Number(
          subject.gradePoints || 0
        );

      totalCredits += credits;

      weightedPoints +=
        credits * gradePoints;
    });

    if (totalCredits === 0) {
      return 0;
    }

    return (
      weightedPoints /
      totalCredits
    );
  }, [subjects]);

  /* =======================================================
     TOTAL MARKS
  ======================================================= */

  const totalMarks = useMemo(() => {
    return subjects.reduce(
      (sum, subject) => {
        return (
          sum +
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
          )
        );
      },
      0
    );
  }, [subjects]);

  /* =======================================================
     SELECTED STUDENT
  ======================================================= */

  const selectedStudent =
    students.find(
      (student) =>
        student.rollNo ===
        selectedRollNo
    );

  /* =======================================================
     SAVE MARKS TO MONGODB
  ======================================================= */

  const saveMarks = async () => {
    try {
      setSaving(true);

      setMessage("");
      setError("");

      if (!selectedStudent) {
        setError(
          "Please select a student."
        );
        return;
      }

      /*
       * Calculate final subject values.
       */

      const finalSubjects =
        subjects.map((subject) => {
          const total =
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

          const gradeData =
            calculateGrade(total);

          return {
            ...subject,

            internal1: Number(
              subject.internal1 || 0
            ),

            internal2: Number(
              subject.internal2 || 0
            ),

            assignment: Number(
              subject.assignment || 0
            ),

            lab: Number(
              subject.lab || 0
            ),

            grade:
              gradeData.grade,

            gradePoints:
              gradeData.gradePoints,
          };
        });

      /*
       * Data sent to backend.
       *
       * The student's unique identifier is used
       * as the Mark rollNo.
       */

      const marksData = {
        rollNo:
          selectedStudent.rollNo,

        name:
          selectedStudent.name,

        semester:
          "Semester I",

        subjects:
          finalSubjects,

        overallCGPA:
          Number(
            sgpa.toFixed(2)
          ),

        predictedRank: 0,
      };

      console.log(
        "Sending marks:",
        marksData
      );

      /*
       * PUT request.
       *
       * API automatically sends the JWT token
       * because we updated src/api.js.
       */

      const response =
        await API.put(
          `/marks/${encodeURIComponent(
            selectedStudent.rollNo
          )}`,
          marksData
        );

      console.log(
        "Updated:",
        response.data
      );

      /*
       * Update UI with saved data.
       */

      setSubjects(finalSubjects);

      setMessage(
        `Marks updated successfully for ${selectedStudent.rollNo}`
      );

      /*
       * Refresh data.
       */

      await fetchStudentsAndMarks();
    } catch (err) {
      console.error(
        "SAVE MARKS ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to update marks."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="faculty-marks-page">
        <div className="faculty-loading">
          <FaSyncAlt className="loading-icon" />

          <p>
            Loading student marks...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="faculty-marks-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="faculty-marks-header">
        <div>
          <div className="faculty-title">
            <FaBook />

            <h1>
              Student Marks
            </h1>
          </div>

          <p>
            Manage internal assessments,
            assignments and laboratory marks
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={
            fetchStudentsAndMarks
          }
          disabled={saving}
        >
          <FaSyncAlt />

          Refresh
        </button>
      </div>

      {/* ===================================================
          STUDENT SELECTOR
      =================================================== */}

      <div className="student-selector-card">

        <div className="selector-icon">
          <FaUserGraduate />
        </div>

        <div className="selector-content">

          <label>
            Select Student
          </label>

          <select
            value={selectedRollNo}
            onChange={(e) =>
              handleStudentChange(
                e.target.value
              )
            }
          >
            {students.map(
              (student) => (
                <option
                  key={student.rollNo}
                  value={student.rollNo}
                >
                  {student.rollNo}
                  {" — "}
                  {student.name}
                </option>
              )
            )}
          </select>

        </div>

        {selectedStudent && (
          <div className="selected-student-info">

            <strong>
              {selectedStudent.name}
            </strong>

            <span>
              {selectedStudent.rollNo}
            </span>

          </div>
        )}

      </div>

      {/* ===================================================
          SUCCESS MESSAGE
      =================================================== */}

      {message && (
        <div className="marks-success">

          <FaCheckCircle />

          <span>
            {message}
          </span>

        </div>
      )}

      {/* ===================================================
          ERROR MESSAGE
      =================================================== */}

      {error && (
        <div className="marks-error">

          <FaExclamationCircle />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* ===================================================
          MARKS TABLE
      =================================================== */}

      <div className="faculty-marks-card">

        <div className="faculty-table-header">

          <div>
            <h2>
              Internal Assessment
            </h2>

            <p>
              Enter marks for{" "}
              {selectedStudent?.name}
            </p>
          </div>

          <div className="semester-badge">
            Semester I
          </div>

        </div>

        <div className="faculty-table-wrapper">

          <table>

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
                  <small>
                    /20
                  </small>
                </th>

                <th>
                  CIA 2
                  <small>
                    /20
                  </small>
                </th>

                <th>
                  ASSIGNMENT
                  <small>
                    /10
                  </small>
                </th>

                <th>
                  LAB
                  <small>
                    /25
                  </small>
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
                (subject, index) => {

                  const total =
                    Number(
                      subject.internal1 ||
                        0
                    ) +
                    Number(
                      subject.internal2 ||
                        0
                    ) +
                    Number(
                      subject.assignment ||
                        0
                    ) +
                    Number(
                      subject.lab ||
                        0
                    );

                  return (
                    <tr
                      key={
                        subject.subject
                      }
                    >

                      {/* SUBJECT */}

                      <td className="subject-name">

                        <strong>
                          {
                            subject.subject
                          }
                        </strong>

                      </td>

                      {/* CREDITS */}

                      <td>

                        <span className="credits">
                          {
                            subject.credits
                          }
                        </span>

                      </td>

                      {/* CIA 1 */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={
                            subject.internal1
                          }
                          onChange={(e) =>
                            handleChange(
                              index,
                              "internal1",
                              e.target.value
                            )
                          }
                        />

                      </td>

                      {/* CIA 2 */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={
                            subject.internal2
                          }
                          onChange={(e) =>
                            handleChange(
                              index,
                              "internal2",
                              e.target.value
                            )
                          }
                        />

                      </td>

                      {/* ASSIGNMENT */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={
                            subject.assignment
                          }
                          onChange={(e) =>
                            handleChange(
                              index,
                              "assignment",
                              e.target.value
                            )
                          }
                        />

                      </td>

                      {/* LAB */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={
                            subject.lab
                          }
                          onChange={(e) =>
                            handleChange(
                              index,
                              "lab",
                              e.target.value
                            )
                          }
                        />

                      </td>

                      {/* TOTAL */}

                      <td>

                        <strong className="total-value">
                          {total}/75
                        </strong>

                      </td>

                      {/* GRADE */}

                      <td>

                        <span
                          className={`faculty-grade grade-${String(
                            subject.grade
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
                          {
                            subject.grade
                          }
                        </span>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            TABLE FOOTER
        ================================================= */}

        <div className="marks-card-footer">

          <div className="marks-stat">

            <span>
              Total Marks
            </span>

            <strong>
              {totalMarks}

              <small>
                /450
              </small>
            </strong>

          </div>

          <div className="marks-stat">

            <span>
              Semester SGPA
            </span>

            <strong>
              {sgpa.toFixed(2)}
            </strong>

          </div>

          <button
            className="save-marks-btn"
            onClick={saveMarks}
            disabled={
              saving ||
              !selectedStudent
            }
          >

            {saving ? (
              <>
                <FaSyncAlt className="button-spin" />

                Saving...
              </>
            ) : (
              <>
                <FaSave />

                Update Marks
              </>
            )}

          </button>

        </div>

      </div>

      {/* ===================================================
          INFORMATION
      =================================================== */}

      <div className="marks-info">

        <strong>
          Faculty instructions
        </strong>

        <span>
          CIA 1 and CIA 2 are out of 20,
          Assignment is out of 10 and Lab
          is out of 25. Grade and grade points
          are calculated automatically.
        </span>

      </div>

    </div>
  );
};

export default FacultyMarks;
