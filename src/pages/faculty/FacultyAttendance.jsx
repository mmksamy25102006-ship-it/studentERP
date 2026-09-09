// src/pages/faculty/FacultyAttendance.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaSave,
  FaClock,
  FaBookOpen,
  FaSyncAlt,
  FaChevronDown,
  FaGraduationCap,
} from "react-icons/fa";

import API from "../../api";
import {
  timetable,
  timings,
} from "../../data/timetableData";

import "./FacultyAttendance.css";

/* =========================================================
   FACULTY ATTENDANCE
   ========================================================= */

const FacultyAttendance = () => {
  /* =======================================================
     STATE
     ======================================================= */

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [loggedInUser, setLoggedInUser] =
    useState({});

  /* =======================================================
     DATE
     ======================================================= */

  const getTodayDate = () => {
    const today = new Date();

    return `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] =
    useState(getTodayDate());

  /* =======================================================
     PERIOD
     ======================================================= */

  const [selectedPeriod, setSelectedPeriod] =
    useState("");

  /* =======================================================
     SUBJECT
     ======================================================= */

  const [subject, setSubject] =
    useState("");

  /* =======================================================
     GET DAY NAME
     ======================================================= */

  const getDayName = (dateString) => {
    if (!dateString) return "";

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString("en-US", {
      weekday: "long",
    });
  };

  const selectedDay = useMemo(() => {
    return getDayName(selectedDate);
  }, [selectedDate]);

  /* =======================================================
     GET TIMETABLE FOR SELECTED DATE
     ======================================================= */

  const selectedDaySchedule = useMemo(() => {
    const row = timetable.find(
      (item) =>
        item.day.toLowerCase() ===
        selectedDay.toLowerCase()
    );

    if (!row) {
      return [];
    }

    return row.periods
      .map((subjectName, index) => ({
        actualPeriod: index + 1,
        subject: subjectName,
        timing: timings[index] || "",
      }))
      .filter(
        (item) =>
          item.subject &&
          item.subject.toLowerCase() !==
            "break"
      );
  }, [selectedDay]);

  /* =======================================================
     DISPLAY PERIOD NUMBER
     
     Actual:
     1, 2, 4, 5, 6

     Display:
     1, 2, 3, 4, 5
     ======================================================= */

  const getDisplayPeriod = (
    actualPeriod
  ) => {
    const index =
      selectedDaySchedule.findIndex(
        (item) =>
          item.actualPeriod ===
          actualPeriod
      );

    return index >= 0 ? index + 1 : "";
  };

  /* =======================================================
     AUTO SELECT FIRST PERIOD
     WHEN DATE CHANGES
     ======================================================= */

  useEffect(() => {
    if (
      selectedDaySchedule.length === 0
    ) {
      setSelectedPeriod("");
      setSubject("");
      return;
    }

    const exists =
      selectedDaySchedule.some(
        (item) =>
          String(item.actualPeriod) ===
          String(selectedPeriod)
      );

    if (!exists) {
      const first =
        selectedDaySchedule[0];

      setSelectedPeriod(
        String(first.actualPeriod)
      );

      setSubject(first.subject);
    }
  }, [
    selectedDaySchedule,
    selectedPeriod,
  ]);

  /* =======================================================
     WHEN PERIOD CHANGES
     AUTOMATICALLY CHANGE SUBJECT
     ======================================================= */

  useEffect(() => {
    if (!selectedPeriod) {
      setSubject("");
      return;
    }

    const selected =
      selectedDaySchedule.find(
        (item) =>
          String(item.actualPeriod) ===
          String(selectedPeriod)
      );

    if (selected) {
      setSubject(selected.subject);
    }
  }, [
    selectedPeriod,
    selectedDaySchedule,
  ]);

  /* =======================================================
     GET SELECTED TIMETABLE PERIOD
     ======================================================= */

  const selectedClass = useMemo(() => {
    return selectedDaySchedule.find(
      (item) =>
        String(item.actualPeriod) ===
        String(selectedPeriod)
    );
  }, [
    selectedDaySchedule,
    selectedPeriod,
  ]);

  /* =======================================================
     GET FACULTY USER
     ======================================================= */

  useEffect(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") ||
          "{}"
      );

      setLoggedInUser(user);
    } catch (err) {
      console.error(
        "Unable to read logged-in user:",
        err
      );

      setLoggedInUser({});
    }
  }, []);

  /* =======================================================
     LOAD STUDENTS
     ======================================================= */

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await API.get("/students");

        const studentData =
          Array.isArray(response.data)
            ? response.data
            : response.data?.students ||
              [];

        const formattedStudents =
          studentData.map(
            (student, index) => {
              const studentId =
                student.studentId ||
                student.rollNo ||
                student._id;

              return {
                id:
                  student._id ||
                  student.id ||
                  index + 1,

                studentId,

                rollNo:
                  student.rollNo ||
                  student.studentId ||
                  studentId,

                name:
                  student.name ||
                  "Unknown Student",

                status: "Present",
              };
            }
          );

        setStudents(
          formattedStudents
        );
      } catch (err) {
        console.error(
          "Student loading error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load students."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  /* =======================================================
     LOAD EXISTING ATTENDANCE
     
     DATE + PERIOD + SUBJECT
     ======================================================= */

  const loadSelectedPeriodAttendance =
    async () => {
      if (
        !selectedDate ||
        !selectedPeriod ||
        !subject
      ) {
        return;
      }

      try {
        setError("");

        const response =
          await API.get("/attendance");

        const attendanceData =
          Array.isArray(response.data)
            ? response.data
            : response.data?.attendance ||
              [];

        /* -----------------------------------------------
           FIND RECORDS FOR CURRENT CLASS
           ----------------------------------------------- */

        const selectedRecords =
          attendanceData.filter(
            (record) => {
              const recordStudentId =
                record.studentId ||
                record.rollNo ||
                record.student
                  ?.studentId;

              const recordPeriod = String(
                record.period || ""
              );

              const recordSubject =
                String(
                  record.subject || ""
                )
                  .trim()
                  .toLowerCase();

              const selectedSubject =
                String(subject || "")
                  .trim()
                  .toLowerCase();

              return (
                record.date ===
                  selectedDate &&
                recordPeriod ===
                  String(selectedPeriod) &&
                recordSubject ===
                  selectedSubject &&
                recordStudentId
              );
            }
          );

        /* -----------------------------------------------
           CREATE STUDENT ATTENDANCE MAP
           ----------------------------------------------- */

        const attendanceMap = {};

        selectedRecords.forEach(
          (record) => {
            const studentId =
              record.studentId ||
              record.rollNo ||
              record.student
                ?.studentId;

            if (studentId) {
              attendanceMap[
                studentId
              ] =
                record.status ||
                "Present";
            }
          }
        );

        /* -----------------------------------------------
           UPDATE STUDENTS
           
           Existing record:
           use API status

           No existing record:
           default Present
           ----------------------------------------------- */

        setStudents(
          (prevStudents) =>
            prevStudents.map(
              (student) => ({
                ...student,

                status:
                  attendanceMap[
                    student.studentId
                  ] || "Present",
              })
            )
        );
      } catch (err) {
        console.error(
          "Selected attendance loading error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load attendance for this period."
        );
      }
    };

  /* =======================================================
     LOAD ATTENDANCE WHEN CLASS CHANGES
     ======================================================= */

  useEffect(() => {
    if (
      !loading &&
      selectedDate &&
      selectedPeriod &&
      subject
    ) {
      loadSelectedPeriodAttendance();
    }
  }, [
    selectedDate,
    selectedPeriod,
    subject,
    loading,
  ]);

  /* =======================================================
     CHANGE STUDENT STATUS
     ======================================================= */

  const changeStatus = (
    studentId,
    status
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status,
            }
          : student
      )
    );
  };

  /* =======================================================
     MARK ALL PRESENT
     ======================================================= */

  const markAllPresent = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: "Present",
      }))
    );
  };

  /* =======================================================
     MARK ALL ABSENT
     ======================================================= */

  const markAllAbsent = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: "Absent",
      }))
    );
  };

  /* =======================================================
     SAVE ATTENDANCE
     ======================================================= */

  const saveAttendance = async () => {
    try {
      if (students.length === 0) {
        alert(
          "No students available."
        );
        return;
      }

      if (!selectedDate) {
        alert(
          "Please select attendance date."
        );
        return;
      }

      if (!selectedPeriod) {
        alert(
          "Please select a timetable period."
        );
        return;
      }

      if (!subject.trim()) {
        alert(
          "Please select a subject."
        );
        return;
      }

      setSaving(true);
      setError("");

      /* -----------------------------------------------
         FACULTY INFORMATION
         ----------------------------------------------- */

      const facultyId =
        loggedInUser.facultyId ||
        localStorage.getItem(
          "facultyId"
        ) ||
        "";

      const markedBy =
        loggedInUser.name ||
        loggedInUser.email ||
        "Faculty";

      /* -----------------------------------------------
         SAVE EACH STUDENT
         ----------------------------------------------- */

      await Promise.all(
        students.map((student) =>
          API.post("/attendance", {
            studentId:
              student.studentId,

            rollNo:
              student.rollNo,

            name:
              student.name,

            subject:
              subject.trim(),

            date:
              selectedDate,

            /* IMPORTANT:
               SEND ACTUAL TIMETABLE PERIOD
               NOT DISPLAY NUMBER
            */

            period:
              Number(selectedPeriod),

            status:
              student.status,

            markedBy,

            facultyId,
          })
        )
      );

      /* -----------------------------------------------
         LOCAL BACKUP
         ----------------------------------------------- */

      const savedAttendance =
        students.map(
          (student) => ({
            studentId:
              student.studentId,

            rollNo:
              student.rollNo,

            name:
              student.name,

            subject:
              subject.trim(),

            date:
              selectedDate,

            period:
              Number(selectedPeriod),

            status:
              student.status,

            markedBy,

            facultyId,
          })
        );

      localStorage.setItem(
        "attendance",
        JSON.stringify(
          savedAttendance
        )
      );

      alert(
        `Attendance saved successfully!\n\n${selectedDay} • ${subject}\nDate: ${selectedDate}\nPeriod: ${getDisplayPeriod(
          Number(selectedPeriod)
        )}`
      );

      /* -----------------------------------------------
         RELOAD FROM API
         ----------------------------------------------- */

      await loadSelectedPeriodAttendance();
    } catch (err) {
      console.error(
        "Attendance save error:",
        err
      );

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to save attendance.";

      setError(errorMessage);

      alert(
        `Failed to save attendance\n\n${errorMessage}`
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     RESET CURRENT PERIOD
     ======================================================= */

  const resetCurrentPeriod = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: "Present",
      }))
    );
  };

  /* =======================================================
     STATISTICS
     ======================================================= */

  const totalStudents =
    students.length;

  const presentStudents =
    students.filter(
      (student) =>
        student.status ===
        "Present"
    ).length;

  const absentStudents =
    students.filter(
      (student) =>
        student.status ===
        "Absent"
    ).length;

  const attendancePercentage =
    totalStudents === 0
      ? 0
      : Math.round(
          (presentStudents /
            totalStudents) *
            100
        );

  const attendanceStatus =
    useMemo(() => {
      if (
        attendancePercentage >=
        90
      ) {
        return "Excellent";
      }

      if (
        attendancePercentage >=
        75
      ) {
        return "Good";
      }

      return "Needs Attention";
    }, [attendancePercentage]);

  /* =======================================================
     DATE DISPLAY
     ======================================================= */

  const displayDate = useMemo(() => {
    if (!selectedDate) return "";

    const date = new Date(
      `${selectedDate}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }, [selectedDate]);

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="faculty-attendance-page">

        <div className="faculty-loading-card">

          <div className="faculty-spinner"></div>

          <h2>
            Loading Attendance
          </h2>

          <p>
            Loading students and attendance records...
          </p>

        </div>

      </div>
    );
  }

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div className="faculty-attendance-page">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="fa-page-header">

        <div className="fa-header-left">

          <div className="fa-header-icon">
            <FaCalendarCheck />
          </div>

          <div>

            <span className="fa-eyebrow">
              FACULTY PORTAL
            </span>

            <h1>
              Student Attendance
            </h1>

            <p>
              Mark and manage attendance
              period by period.
            </p>

          </div>

        </div>

        <div className="fa-term-card">

          <FaGraduationCap />

          <div>
            <span>
              ACADEMIC TERM
            </span>

            <strong>
              Semester I
            </strong>
          </div>

        </div>

      </div>

      {/* ===================================================
          ERROR
          =================================================== */}

      {error && (
        <div className="fa-error">

          <strong>
            Attendance Error
          </strong>

          <span>
            {error}
          </span>

        </div>
      )}

      {/* ===================================================
          MAIN CARD
          =================================================== */}

      <section className="fa-main-card">

        {/* =================================================
            CARD HEADER
            ================================================= */}

        <div className="fa-card-header">

          <div>

            <span className="fa-section-label">
              ATTENDANCE CONTROL
            </span>

            <h2>
              Select Class
            </h2>

            <p>
              The subject is automatically
              taken from your timetable.
            </p>

          </div>

          <div className="fa-class-badge">

            <span>
              CLASS
            </span>

            <strong>
              Computer Science
            </strong>

          </div>

        </div>

        {/* =================================================
            CONTROLS
            ================================================= */}

        <div className="fa-controls">

          {/* DATE */}

          <div className="fa-field">

            <label>
              <FaCalendarCheck />
              ATTENDANCE DATE
            </label>

            <div className="fa-input-wrapper">

              <input
                type="date"
                value={
                  selectedDate
                }
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* PERIOD */}

          <div className="fa-field">

            <label>
              <FaClock />
              PERIOD
            </label>

            <div className="fa-select-wrapper">

              <select
                value={
                  selectedPeriod
                }
                onChange={(e) =>
                  setSelectedPeriod(
                    e.target.value
                  )
                }
                disabled={
                  selectedDaySchedule.length ===
                  0
                }
              >

                {selectedDaySchedule.length ===
                0 ? (
                  <option value="">
                    No classes
                  </option>
                ) : (
                  selectedDaySchedule.map(
                    (
                      item,
                      index
                    ) => (
                      <option
                        key={
                          item.actualPeriod
                        }
                        value={
                          item.actualPeriod
                        }
                      >
                        Period{" "}
                        {index + 1}{" "}
                        —{" "}
                        {
                          item.timing
                        }
                      </option>
                    )
                  )
                )}

              </select>

              <FaChevronDown />

            </div>

          </div>

          {/* SUBJECT */}

          <div className="fa-field">

            <label>
              <FaBookOpen />
              SUBJECT
            </label>

            <div className="fa-subject-box">

              {selectedClass ? (
                <>
                  <strong>
                    {
                      selectedClass.subject
                    }
                  </strong>

                  <span>
                    {
                      selectedClass.timing
                    }
                  </span>
                </>
              ) : (
                <span>
                  No subject scheduled
                </span>
              )}

            </div>

          </div>

        </div>

        {/* =================================================
            SELECTED CLASS BAR
            ================================================= */}

        <div className="fa-selected-class">

          <div className="fa-selected-info">

            <div className="fa-live-indicator"></div>

            <div>

              <span>
                SELECTED CLASS
              </span>

              <strong>
                {subject ||
                  "No subject selected"}
              </strong>

            </div>

          </div>

          <div className="fa-selected-meta">

            <div>
              <span>
                DATE
              </span>

              <strong>
                {selectedDate}
              </strong>
            </div>

            <div>
              <span>
                PERIOD
              </span>

              <strong>
                {selectedPeriod
                  ? getDisplayPeriod(
                      Number(
                        selectedPeriod
                      )
                    )
                  : "—"}
              </strong>
            </div>

            <div>
              <span>
                TIME
              </span>

              <strong>
                {selectedClass
                  ?.timing ||
                  "—"}
              </strong>
            </div>

          </div>

          <button
            type="button"
            className="fa-reload-btn"
            onClick={
              loadSelectedPeriodAttendance
            }
            disabled={
              !subject ||
              !selectedPeriod
            }
          >
            <FaSyncAlt />
            Reload
          </button>

        </div>

        {/* =================================================
            QUICK ACTIONS
            ================================================= */}

        <div className="fa-quick-actions">

          <div>

            <span>
              QUICK MARK
            </span>

            <p>
              Apply one status to all
              students.
            </p>

          </div>

          <div className="fa-quick-buttons">

            <button
              type="button"
              className="fa-quick-present"
              onClick={
                markAllPresent
              }
              disabled={saving}
            >
              <FaCheckCircle />
              Mark All Present
            </button>

            <button
              type="button"
              className="fa-quick-absent"
              onClick={
                markAllAbsent
              }
              disabled={saving}
            >
              <FaTimesCircle />
              Mark All Absent
            </button>

          </div>

        </div>

        {/* =================================================
            STATISTICS
            ================================================= */}

        <div className="fa-stat-grid">

          <div className="fa-stat-card">

            <div className="fa-stat-icon students">
              <FaUsers />
            </div>

            <div>
              <span>
                Total Students
              </span>

              <strong>
                {totalStudents}
              </strong>

              <small>
                Students in class
              </small>
            </div>

          </div>

          <div className="fa-stat-card">

            <div className="fa-stat-icon present">
              <FaCheckCircle />
            </div>

            <div>
              <span>
                Present
              </span>

              <strong>
                {presentStudents}
              </strong>

              <small>
                Students present
              </small>
            </div>

          </div>

          <div className="fa-stat-card">

            <div className="fa-stat-icon absent">
              <FaTimesCircle />
            </div>

            <div>
              <span>
                Absent
              </span>

              <strong>
                {absentStudents}
              </strong>

              <small>
                Students absent
              </small>
            </div>

          </div>

          <div className="fa-stat-card">

            <div className="fa-stat-icon rate">
              <FaCalendarCheck />
            </div>

            <div>
              <span>
                Attendance Rate
              </span>

              <strong>
                {attendancePercentage}%
              </strong>

              <small>
                {attendanceStatus}
              </small>
            </div>

          </div>

        </div>

        {/* =================================================
            PROGRESS
            ================================================= */}

        <div className="fa-progress-section">

          <div className="fa-progress-top">

            <div>

              <span>
                CLASS ATTENDANCE
              </span>

              <strong>
                {presentStudents} of{" "}
                {totalStudents}{" "}
                present
              </strong>

            </div>

            <b>
              {attendancePercentage}%
            </b>

          </div>

          <div className="fa-progress-track">

            <div
              className="fa-progress-fill"
              style={{
                width: `${attendancePercentage}%`,
              }}
            ></div>

          </div>

        </div>

        {/* =================================================
            MARK ATTENDANCE HEADER
            ================================================= */}

        <div className="fa-mark-header">

          <div>

            <span>
              MARK ATTENDANCE
            </span>

            <h2>
              {subject ||
                "Select a class"}
            </h2>

            <p>
              {displayDate}
              {selectedPeriod &&
                ` • Period ${getDisplayPeriod(
                  Number(
                    selectedPeriod
                  )
                )}`}
            </p>

          </div>

          <div className="fa-mark-summary">

            <div>
              <span>
                PRESENT
              </span>

              <strong className="green">
                {presentStudents}
              </strong>
            </div>

            <div>
              <span>
                ABSENT
              </span>

              <strong className="red">
                {absentStudents}
              </strong>
            </div>

          </div>

        </div>

        {/* =================================================
            STUDENT TABLE
            ================================================= */}

        <div className="fa-table-wrapper">

          <table className="fa-table">

            <thead>

              <tr>

                <th>
                  #
                </th>

                <th>
                  STUDENT ID
                </th>

                <th>
                  STUDENT
                </th>

                <th>
                  ATTENDANCE
                </th>

              </tr>

            </thead>

            <tbody>

              {students.length ===
              0 ? (

                <tr>

                  <td
                    colSpan="4"
                    className="fa-empty-cell"
                  >
                    No students found
                  </td>

                </tr>

              ) : (

                students.map(
                  (
                    student,
                    index
                  ) => (

                    <tr
                      key={
                        student.id
                      }
                    >

                      {/* NUMBER */}

                      <td>

                        <span className="fa-row-number">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                      </td>

                      {/* ID */}

                      <td>

                        <span className="fa-student-id">
                          {
                            student.rollNo
                          }
                        </span>

                      </td>

                      {/* STUDENT */}

                      <td>

                        <div className="fa-student">

                          <div className="fa-avatar">
                            {student.name
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {
                                student.name
                              }
                            </strong>

                            <span>
                              {
                                student.studentId
                              }
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* STATUS */}

                      <td>

                        <div className="fa-attendance-actions">

                          <button
                            type="button"
                            className={`fa-status-btn present ${
                              student.status ===
                              "Present"
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              changeStatus(
                                student.id,
                                "Present"
                              )
                            }
                          >

                            <FaCheckCircle />

                            Present

                          </button>

                          <button
                            type="button"
                            className={`fa-status-btn absent ${
                              student.status ===
                              "Absent"
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              changeStatus(
                                student.id,
                                "Absent"
                              )
                            }
                          >

                            <FaTimesCircle />

                            Absent

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="fa-footer">

          <div className="fa-footer-info">

            <div className="fa-footer-icon">
              <FaCalendarCheck />
            </div>

            <div>

              <strong>
                Ready to save
              </strong>

              <span>
                {presentStudents} present •{" "}
                {absentStudents} absent •{" "}
                {totalStudents} total
              </span>

            </div>

          </div>

          <div className="fa-footer-actions">

            <button
              type="button"
              className="fa-reset-btn"
              onClick={
                resetCurrentPeriod
              }
              disabled={saving}
            >
              Reset
            </button>

            <button
              type="button"
              className="fa-save-btn"
              onClick={
                saveAttendance
              }
              disabled={
                saving ||
                students.length ===
                  0 ||
                !subject ||
                !selectedPeriod
              }
            >

              <FaSave />

              {saving
                ? "Saving..."
                : "Save Attendance"}

            </button>

          </div>

        </div>

      </section>

    </div>
  );
};

export default FacultyAttendance;