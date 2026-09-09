import React, { useEffect, useMemo, useState } from "react";
import "./Attendance.css";
import API from "../api";
import { useAuth } from "../context/AuthContext";

import {
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartPie,
  FaCalendarTimes,
  FaChevronDown,
  FaExclamationCircle,
} from "react-icons/fa";

/* =========================================================
   EXISTING STUDENTERP TIMETABLE
   ========================================================= */

const timetable = [
  {
    day: "Monday",
    periods: [
      "DBMS",
      "Operating System",
      "Break",
      "Computer Networks",
      "Java",
      "Lab",
    ],
  },
  {
    day: "Tuesday",
    periods: [
      "Java",
      "DBMS",
      "Break",
      "Software Engineering",
      "Maths",
      "Lab",
    ],
  },
  {
    day: "Wednesday",
    periods: [
      "Computer Networks",
      "Java",
      "Break",
      "DBMS",
      "Operating System",
      "Seminar",
    ],
  },
  {
    day: "Thursday",
    periods: [
      "Maths",
      "DBMS",
      "Break",
      "Java",
      "Software Engineering",
      "Library",
    ],
  },
  {
    day: "Friday",
    periods: [
      "Operating System",
      "Computer Networks",
      "Break",
      "Java Lab",
      "Project",
      "Sports",
    ],
  },
];

/* =========================================================
   TIMINGS
   ========================================================= */

const timings = [
  "9:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 11:15",
  "11:15 - 12:15",
  "12:15 - 1:15",
  "2:00 - 4:00",
];

/* =========================================================
   HELPERS
   ========================================================= */

const getDayName = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
  });
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatShortDate = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

/*
 * Converts a date into:
 * YYYY-MM-DD
 */
const getDateKey = (date) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/*
 * Safely get a student's Student ID.
 *
 * IMPORTANT:
 * studentId / rollNo comes BEFORE MongoDB _id.
 */
const getStudentId = (user) => {
  let storedUser = {};

  try {
    storedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch (error) {
    console.warn(
      "Unable to read stored user:",
      error
    );
  }

  return (
    user?.studentId ||
    user?.studentID ||
    user?.rollNo ||
    user?.student?.studentId ||
    user?.student?.rollNo ||
    storedUser?.studentId ||
    storedUser?.studentID ||
    storedUser?.rollNo ||
    storedUser?.student?.studentId ||
    storedUser?.student?.rollNo ||
    localStorage.getItem("studentId") ||
    localStorage.getItem("studentID") ||
    localStorage.getItem("rollNo") ||
    null
  );
};

/*
 * Normalize attendance status.
 */
const normalizeStatus = (record) => {
  const rawStatus =
    record?.status ??
    record?.attendanceStatus ??
    record?.present;

  if (
    rawStatus === true ||
    String(rawStatus).toLowerCase() === "true" ||
    String(rawStatus) === "1" ||
    String(rawStatus).toLowerCase() === "present"
  ) {
    return "Present";
  }

  if (
    rawStatus === false ||
    String(rawStatus).toLowerCase() === "false" ||
    String(rawStatus) === "0" ||
    String(rawStatus).toLowerCase() === "absent"
  ) {
    return "Absent";
  }

  return "Pending";
};

/* =========================================================
   ATTENDANCE
   ========================================================= */

const Attendance = () => {
  const { user } = useAuth();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openUpcoming, setOpenUpcoming] =
    useState(true);

  const [openFull, setOpenFull] =
    useState(false);

  const [openAbsent, setOpenAbsent] =
    useState(false);

  /* =======================================================
     TODAY
     ======================================================= */

  const today = useMemo(() => {
    return new Date();
  }, []);

  const todayDay = getDayName(today);

  /* =======================================================
     TOMORROW
     ======================================================= */

  const tomorrow = useMemo(() => {
    const date = new Date(today);

    date.setDate(
      date.getDate() + 1
    );

    return date;
  }, [today]);

  const tomorrowDay =
    getDayName(tomorrow);

  /* =======================================================
     STUDENT ID
     ======================================================= */

  const studentId = useMemo(() => {
    return getStudentId(user);
  }, [user]);

  /* =======================================================
     TODAY'S TIMETABLE

     Break is removed.

     Display:
     1, 2, 3, 4, 5

     Actual timetable periods remain:
     1, 2, 4, 5, 6
     ======================================================= */

  const todayClasses = useMemo(() => {
    const schedule = timetable.find(
      (item) =>
        item.day === todayDay
    );

    if (!schedule) {
      return [];
    }

    return schedule.periods
      .map((subject, index) => ({
        actualPeriod: index + 1,
        subject,
        timing: timings[index],
      }))
      .filter(
        (item) =>
          item.subject &&
          item.subject.toLowerCase() !==
            "break"
      );
  }, [todayDay]);

  /* =======================================================
     UPCOMING TIMETABLE

     ONLY TOMORROW
     ======================================================= */

  const upcomingClasses = useMemo(() => {
    const schedule = timetable.find(
      (item) =>
        item.day === tomorrowDay
    );

    if (!schedule) {
      return [];
    }

    return schedule.periods
      .map((subject, index) => ({
        actualPeriod: index + 1,
        subject,
        timing: timings[index],
      }))
      .filter(
        (item) =>
          item.subject &&
          item.subject.toLowerCase() !==
            "break"
      );
  }, [tomorrowDay]);

  /* =======================================================
     FETCH ATTENDANCE API

     GET /attendance/student/:studentId

     IMPORTANT:
     Uses studentId / rollNo instead of MongoDB _id.
     ======================================================= */

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user) {
        setAttendance([]);
        setLoading(false);

        setError(
          "Please login to view your attendance."
        );

        return;
      }

      if (!studentId) {
        console.error(
          "Student ID not found.",
          user
        );

        setAttendance([]);
        setLoading(false);

        setError(
          "Student ID is not available for this account."
        );

        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log(
          "================================="
        );

        console.log(
          "STUDENT ATTENDANCE REQUEST"
        );

        console.log(
          "Student ID:",
          studentId
        );

        console.log(
          "User:",
          user
        );

        console.log(
          "API:",
          `/attendance/student/${studentId}`
        );

        console.log(
          "================================="
        );

        const response = await API.get(
          `/attendance/student/${encodeURIComponent(
            String(studentId)
          )}`
        );

        console.log(
          "Attendance API response:",
          response.data
        );

        const data = response?.data;

        let records = [];

        if (Array.isArray(data)) {
          records = data;
        } else if (
          Array.isArray(
            data?.attendance
          )
        ) {
          records = data.attendance;
        } else if (
          Array.isArray(data?.records)
        ) {
          records = data.records;
        } else if (
          Array.isArray(data?.data)
        ) {
          records = data.data;
        }

        /*
         * Do not filter records here.
         *
         * The backend endpoint has already received
         * the correct studentId.
         *
         * Filtering here can accidentally remove
         * valid records if the backend uses a
         * different field name.
         */

        console.log(
          "Attendance records loaded:",
          records
        );

        setAttendance(records);

        /*
         * Optional local backup.
         */
        localStorage.setItem(
          "myAttendance",
          JSON.stringify(records)
        );

      } catch (err) {
        console.error(
          "Attendance fetch error:",
          err
        );

        console.error(
          "Server response:",
          err?.response?.data
        );

        setAttendance([]);

        setError(
          err?.response?.data?.message ||
            "Unable to load attendance data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user, studentId]);

  /* =======================================================
     GET ATTENDANCE STATUS
     ======================================================= */

  const getAttendanceStatus = (
    classItem,
    date
  ) => {
    const targetDate =
      getDateKey(date);

    const record =
      attendance.find((item) => {
        const rawDate =
          item.date ||
          item.attendanceDate ||
          item.createdAt;

        if (!rawDate) {
          return false;
        }

        const recordDate =
          getDateKey(
            new Date(rawDate)
          );

        /*
         * Subject
         */
        const recordSubject =
          item.subject ||
          item.course ||
          item.subjectName;

        /*
         * Period
         */
        const recordPeriod =
          Number(item.period) ||
          Number(item.periodNumber) ||
          Number(item.actualPeriod);

        /*
         * Subject comparison
         */
        const subjectMatches =
          !recordSubject ||
          String(recordSubject)
            .trim()
            .toLowerCase() ===
            String(classItem.subject)
              .trim()
              .toLowerCase();

        /*
         * Period comparison
         *
         * Example:
         * Computer Networks = actualPeriod 4
         *
         * We must compare against 4,
         * not display number 3.
         */
        const periodMatches =
          !recordPeriod ||
          recordPeriod ===
            classItem.actualPeriod;

        return (
          recordDate ===
            targetDate &&
          subjectMatches &&
          periodMatches
        );
      });

    if (!record) {
      return "Pending";
    }

    return normalizeStatus(record);
  };

  /* =======================================================
     TODAY ATTENDANCE
     ======================================================= */

  const todayAttendance = useMemo(() => {
    return todayClasses.map(
      (item) => ({
        ...item,

        status:
          getAttendanceStatus(
            item,
            today
          ),
      })
    );
  }, [
    todayClasses,
    attendance,
    today,
  ]);

  /* =======================================================
     TODAY COUNTS
     ======================================================= */

  const presentCount =
    todayAttendance.filter(
      (item) =>
        item.status === "Present"
    ).length;

  const absentCount =
    todayAttendance.filter(
      (item) =>
        item.status === "Absent"
    ).length;

  const pendingCount =
    todayAttendance.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  /* =======================================================
     FULL ATTENDANCE
     ======================================================= */

  const totalAttendance =
    attendance.length;

  const presentAttendance =
    attendance.filter(
      (item) =>
        normalizeStatus(item) ===
        "Present"
    ).length;

  const absentAttendance =
    attendance.filter(
      (item) =>
        normalizeStatus(item) ===
        "Absent"
    ).length;

  const attendancePercentage =
    totalAttendance > 0
      ? Math.round(
          (presentAttendance /
            totalAttendance) *
            100
        )
      : 0;

  /* =======================================================
     ABSENT DAYS
     ======================================================= */

  const absentDays = useMemo(() => {
    const grouped = {};

    attendance.forEach((item) => {
      const status =
        normalizeStatus(item);

      if (status !== "Absent") {
        return;
      }

      const rawDate =
        item.date ||
        item.attendanceDate ||
        item.createdAt;

      if (!rawDate) {
        return;
      }

      const date =
        new Date(rawDate);

      const key =
        getDateKey(date);

      if (!grouped[key]) {
        grouped[key] = {
          date,
          subjects: [],
        };
      }

      grouped[key].subjects.push(
        item.subject ||
          item.course ||
          item.subjectName ||
          "Class"
      );
    });

    return Object.values(
      grouped
    ).sort(
      (a, b) =>
        b.date - a.date
    );
  }, [attendance]);

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="attendance-page">
        <div className="attendance-loading">
          <div className="attendance-spinner"></div>

          <p>
            Loading attendance...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
     ======================================================= */

  return (
    <div className="attendance-page">

      {/* =================================================
          BREADCRUMB
          ================================================= */}

      <div className="attendance-breadcrumb">
        <span>
          Student Portal
        </span>

        <span className="breadcrumb-arrow">
          →
        </span>

        <strong>
          Attendance
        </strong>
      </div>

      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <div className="attendance-header">

        <div className="attendance-header-left">

          <div className="attendance-page-icon">
            <FaCalendarCheck />
          </div>

          <div>
            <h1>
              Attendance
            </h1>

            <p>
              View your daily attendance and
              upcoming classes
            </p>
          </div>

        </div>

        <div className="header-date">

          <div className="header-date-icon">
            <FaCalendarCheck />
          </div>

          <div>
            <span>
              Today
            </span>

            <strong>
              {formatDate(today)}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="attendance-error">
          <FaExclamationCircle />

          <span>
            {error}
          </span>
        </div>
      )}

      {/* =================================================
          TODAY'S ATTENDANCE
          ================================================= */}

      <section className="today-section">

        <div className="section-heading">

          <div>
            <span className="section-label">
              {todayDay}
            </span>

            <h2>
              Today's Attendance
            </h2>

            <p>
              {formatDate(today)}
            </p>
          </div>

          <div className="classes-badge">
            {todayAttendance.length}{" "}
            {todayAttendance.length === 1
              ? "class"
              : "classes"}
          </div>

        </div>

        {/* =================================================
            SUMMARY
            ================================================= */}

        <div className="summary-grid">

          {/* PRESENT */}

          <div className="summary-card">

            <div className="summary-icon present">
              <FaCheckCircle />
            </div>

            <div>
              <span>
                Present
              </span>

              <strong>
                {presentCount}
              </strong>
            </div>

          </div>

          {/* ABSENT */}

          <div className="summary-card">

            <div className="summary-icon absent">
              <FaTimesCircle />
            </div>

            <div>
              <span>
                Absent
              </span>

              <strong>
                {absentCount}
              </strong>
            </div>

          </div>

          {/* PENDING */}

          <div className="summary-card">

            <div className="summary-icon pending">
              <FaClock />
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {pendingCount}
              </strong>
            </div>

          </div>

        </div>

        {/* =================================================
            TODAY CLASS LIST
            ================================================= */}

        {todayAttendance.length > 0 ? (

          <div className="class-list">

            {todayAttendance.map(
              (item, index) => (

                <div
                  className="class-row"
                  key={`${item.actualPeriod}-${item.subject}`}
                >

                  <div className="class-number">
                    {index + 1}
                  </div>

                  <div className="class-info">

                    <h3>
                      {item.subject}
                    </h3>

                    <span>
                      {item.timing}
                    </span>

                  </div>

                  <div
                    className={`status-pill ${item.status.toLowerCase()}`}
                  >
                    <span className="status-dot"></span>

                    {item.status}
                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="empty-state">

            <div className="empty-icon">
              <FaCalendarTimes />
            </div>

            <h3>
              No classes scheduled today
            </h3>

            <p>
              There are no classes in
              today's timetable.
            </p>

          </div>

        )}

      </section>

      {/* =================================================
          UPCOMING TIME TABLE
          ONLY NEXT DAY
          ================================================= */}

      <section className="accordion-section">

        <button
          type="button"
          className={`accordion-button ${
            openUpcoming
              ? "active"
              : ""
          }`}
          onClick={() =>
            setOpenUpcoming(
              !openUpcoming
            )
          }
        >

          <div className="accordion-left">

            <div className="accordion-icon">
              <FaClock />
            </div>

            <div>
              <h2>
                Upcoming Time Table
              </h2>

              <p>
                Tomorrow's class schedule
              </p>
            </div>

          </div>

          <span
            className={`accordion-chevron ${
              openUpcoming
                ? "rotate"
                : ""
            }`}
          >
            <FaChevronDown />
          </span>

        </button>

        {openUpcoming && (

          <div className="accordion-body">

            {upcomingClasses.length > 0 ? (

              <>

                <div className="upcoming-heading">

                  <div>

                    <span>
                      NEXT DAY
                    </span>

                    <h3>
                      {tomorrowDay}
                    </h3>

                    <p>
                      {formatDate(
                        tomorrow
                      )}
                    </p>

                  </div>

                  <div className="upcoming-count">
                    {upcomingClasses.length}{" "}
                    classes
                  </div>

                </div>

                <div className="upcoming-list">

                  {upcomingClasses.map(
                    (item, index) => (

                      <div
                        className="upcoming-row"
                        key={`${item.actualPeriod}-${item.subject}`}
                      >

                        <div className="upcoming-number">
                          {index + 1}
                        </div>

                        <div className="upcoming-info">

                          <strong>
                            {item.subject}
                          </strong>

                          <span>
                            {item.timing}
                          </span>

                        </div>

                        <div className="upcoming-period">
                          Period{" "}
                          {index + 1}
                        </div>

                      </div>

                    )
                  )}

                </div>

              </>

            ) : (

              <div className="empty-state small">

                <div className="empty-icon">
                  <FaCalendarTimes />
                </div>

                <h3>
                  No upcoming classes
                </h3>

                <p>
                  No timetable is available
                  for {tomorrowDay}.
                </p>

              </div>

            )}

          </div>

        )}

      </section>

      {/* =================================================
          MY FULL ATTENDANCE
          ================================================= */}

      <section className="accordion-section">

        <button
          type="button"
          className={`accordion-button ${
            openFull
              ? "active"
              : ""
          }`}
          onClick={() =>
            setOpenFull(!openFull)
          }
        >

          <div className="accordion-left">

            <div className="accordion-icon">
              <FaChartPie />
            </div>

            <div>

              <h2>
                My Full Attendance
              </h2>

              <p>
                Overall attendance record
              </p>

            </div>

          </div>

          <span
            className={`accordion-chevron ${
              openFull
                ? "rotate"
                : ""
            }`}
          >
            <FaChevronDown />
          </span>

        </button>

        {openFull && (

          <div className="accordion-body">

            {/* =================================================
                OVERALL
                ================================================= */}

            <div className="attendance-overview">

              <div
                className="percentage-circle"
                style={{
                  "--progress":
                    `${attendancePercentage * 3.6}deg`,
                }}
              >

                <div className="percentage-inner">

                  <strong>
                    {attendancePercentage}%
                  </strong>

                  <span>
                    Overall
                  </span>

                </div>

              </div>

              <div className="progress-area">

                <div className="progress-title">

                  <div>

                    <span>
                      Overall Attendance
                    </span>

                    <strong>
                      {attendancePercentage}%
                    </strong>

                  </div>

                </div>

                <div className="progress-track">

                  <div
                    className="progress-value"
                    style={{
                      width:
                        `${attendancePercentage}%`,
                    }}
                  />

                </div>

                <p>
                  Based on your recorded
                  attendance
                </p>

              </div>

            </div>

            {/* =================================================
                TOTAL PRESENT ABSENT
                ================================================= */}

            <div className="attendance-stats">

              <div className="attendance-stat">

                <span>
                  Total
                </span>

                <strong>
                  {totalAttendance}
                </strong>

              </div>

              <div className="attendance-stat present-stat">

                <span>
                  Present
                </span>

                <strong>
                  {presentAttendance}
                </strong>

              </div>

              <div className="attendance-stat absent-stat">

                <span>
                  Absent
                </span>

                <strong>
                  {absentAttendance}
                </strong>

              </div>

            </div>

            {/* =================================================
                HISTORY
                ================================================= */}

            <div className="history-area">

              <div className="history-header">

                <div>

                  <h3>
                    Attendance History
                  </h3>

                  <p>
                    Your previous attendance
                    records
                  </p>

                </div>

                <span>
                  {attendance.length}{" "}
                  records
                </span>

              </div>

              {attendance.length > 0 ? (

                <div className="history-list">

                  {attendance
                    .slice()
                    .reverse()
                    .map(
                      (item, index) => {

                        const rawDate =
                          item.date ||
                          item.attendanceDate ||
                          item.createdAt;

                        const displayStatus =
                          normalizeStatus(
                            item
                          );

                        return (
                          <div
                            className="history-row"
                            key={
                              item._id ||
                              index
                            }
                          >

                            <div className="history-date">

                              {rawDate
                                ? formatShortDate(
                                    new Date(
                                      rawDate
                                    )
                                  )
                                : "—"}

                            </div>

                            <div className="history-subject">

                              <strong>
                                {item.subject ||
                                  item.course ||
                                  item.subjectName ||
                                  "Class"}
                              </strong>

                              <span>
                                {item.period
                                  ? `Period ${item.period}`
                                  : "Attendance record"}
                              </span>

                            </div>

                            <div
                              className={`status-pill ${displayStatus.toLowerCase()}`}
                            >

                              <span className="status-dot"></span>

                              {displayStatus}

                            </div>

                          </div>
                        );
                      }
                    )}

                </div>

              ) : (

                <div className="history-empty">
                  No attendance history
                  available.
                </div>

              )}

            </div>

          </div>

        )}

      </section>

      {/* =================================================
          MY ABSENT DAYS
          ================================================= */}

      <section className="accordion-section">

        <button
          type="button"
          className={`accordion-button ${
            openAbsent
              ? "active"
              : ""
          }`}
          onClick={() =>
            setOpenAbsent(
              !openAbsent
            )
          }
        >

          <div className="accordion-left">

            <div className="accordion-icon">
              <FaCalendarTimes />
            </div>

            <div>

              <h2>
                My Absent Days
              </h2>

              <p>
                View your previous absent dates
              </p>

            </div>

          </div>

          <span
            className={`accordion-chevron ${
              openAbsent
                ? "rotate"
                : ""
            }`}
          >
            <FaChevronDown />
          </span>

        </button>

        {openAbsent && (

          <div className="accordion-body">

            {absentDays.length > 0 ? (

              <div className="absent-list">

                {absentDays.map(
                  (item, index) => (

                    <div
                      className="absent-row"
                      key={index}
                    >

                      <div className="absent-icon">
                        <FaExclamationCircle />
                      </div>

                      <div className="absent-details">

                        <strong>
                          {formatDate(
                            item.date
                          )}
                        </strong>

                        <span>
                          {item.subjects.join(
                            ", "
                          )}
                        </span>

                      </div>

                      <div className="absent-count">

                        {item.subjects.length}{" "}

                        {item.subjects.length ===
                        1
                          ? "class"
                          : "classes"}

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <div className="history-empty">
                No absent days recorded.
              </div>

            )}

          </div>

        )}

      </section>

      {/* =================================================
          FOOTER NOTE
          ================================================= */}

      <div className="attendance-note">

        <span>
          <FaCalendarCheck />
        </span>

        Attendance is updated by faculty.
        Each class period is recorded separately.

      </div>

    </div>
  );
};

export default Attendance;