const express = require("express");

const {
  getAllAttendance,
  getStudentAttendance,
  createAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

const {
  verifyToken,
  isFacultyOrAdmin,
  ownsStudent,
} = require("../middleware/authMiddleware");

// GET all attendance
router.get(
  "/",
  verifyToken,
  isFacultyOrAdmin,
  getAllAttendance
);

// GET attendance for a specific student
router.get(
  "/student/:studentId",
  verifyToken,
  ownsStudent("studentId"),
  getStudentAttendance
);

// CREATE / UPDATE attendance
router.post(
  "/",
  verifyToken,
  isFacultyOrAdmin,
  createAttendance
);

module.exports = router;