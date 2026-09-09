const Attendance = require("../models/Attendance");

/* =========================================================
   GET ALL ATTENDANCE
   GET /api/attendance
========================================================= */

const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({})
      .sort({
        date: -1,
        period: 1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error(
      "Get All Attendance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load attendance.",
      error: error.message,
    });
  }
};


/* =========================================================
   GET STUDENT ATTENDANCE
   GET /api/attendance/student/:studentId
========================================================= */

const getStudentAttendance = async (
  req,
  res
) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required.",
      });
    }

    const attendance =
      await Attendance.find({
        $or: [
          { studentId: studentId },
          { rollNo: studentId },
        ],
      })
        .sort({
          date: -1,
          period: 1,
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error(
      "Get Student Attendance Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load student attendance.",
      error: error.message,
    });
  }
};


/* =========================================================
   CREATE / UPDATE ATTENDANCE
   POST /api/attendance

   Attendance identity:

   studentId
   +
   date
   +
   period
   +
   subject

========================================================= */

const createAttendance = async (
  req,
  res
) => {
  try {
    const {
      studentId,
      rollNo,
      name,
      subject,
      date,
      period,
      status,
      markedBy,
      facultyId,
    } = req.body;


    /* ==========================================
       VALIDATION
    ========================================== */

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required.",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Attendance date is required.",
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject is required.",
      });
    }

    if (
      period === undefined ||
      period === null ||
      period === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Period is required.",
      });
    }

    const numericPeriod = Number(period);

    if (
      !Number.isInteger(numericPeriod) ||
      numericPeriod < 1
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Period must be a valid number greater than 0.",
      });
    }

    if (
      status !== "Present" &&
      status !== "Absent"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be Present or Absent.",
      });
    }


    /* ==========================================
       CLEAN VALUES
    ========================================== */

    const cleanStudentId =
      String(studentId).trim();

    const cleanSubject =
      String(subject).trim();

    const cleanDate =
      String(date).trim();

    const cleanRollNo =
      String(
        rollNo || studentId
      ).trim();

    const cleanName =
      String(name || "").trim();

    const cleanMarkedBy =
      String(markedBy || "").trim();

    const cleanFacultyId =
      String(facultyId || "").trim();


    /* ==========================================
       FIND EXISTING RECORD

       Example:

       STU001
       2026-09-06
       Period 5
       Mathematics

       If this exact record already exists,
       update it instead of creating duplicate.
    ========================================== */

    const existingAttendance =
      await Attendance.findOne({
        studentId: cleanStudentId,
        date: cleanDate,
        period: numericPeriod,
        subject: cleanSubject,
      });


    /* ==========================================
       UPDATE EXISTING ATTENDANCE
    ========================================== */

    if (existingAttendance) {
      existingAttendance.rollNo =
        cleanRollNo;

      existingAttendance.name =
        cleanName;

      existingAttendance.status =
        status;

      existingAttendance.markedBy =
        cleanMarkedBy;

      existingAttendance.facultyId =
        cleanFacultyId;

      await existingAttendance.save();

      return res.status(200).json({
        success: true,
        message:
          "Attendance updated successfully.",
        attendance: existingAttendance,
      });
    }


    /* ==========================================
       CREATE NEW ATTENDANCE
    ========================================== */

    const attendance =
      await Attendance.create({
        studentId: cleanStudentId,

        rollNo: cleanRollNo,

        name: cleanName,

        subject: cleanSubject,

        date: cleanDate,

        period: numericPeriod,

        status,

        markedBy: cleanMarkedBy,

        facultyId: cleanFacultyId,
      });


    return res.status(201).json({
      success: true,
      message:
        "Attendance saved successfully.",
      attendance,
    });

  } catch (error) {
    console.error(
      "Create Attendance Error:",
      error
    );


    /* ==========================================
       DUPLICATE KEY PROTECTION

       This can happen if two requests try
       to create the same attendance record.
    ========================================== */

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance already exists for this student, date, period and subject.",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        "Unable to save attendance.",
      error: error.message,
    });
  }
};


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  getAllAttendance,
  getStudentAttendance,
  createAttendance,
};