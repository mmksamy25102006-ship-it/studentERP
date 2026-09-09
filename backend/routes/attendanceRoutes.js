const express = require("express");

const {
  getAllAttendance,
  getStudentAttendance,
  createAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

// GET all attendance
router.get("/", getAllAttendance);

// GET attendance for a specific student
router.get("/student/:studentId", getStudentAttendance);

// CREATE / UPDATE attendance
router.post("/", createAttendance);

module.exports = router;