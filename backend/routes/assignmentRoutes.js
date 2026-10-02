const express = require("express");

const {
  getStudentAssignments,
  getFacultyAssignments,
  createAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

const {
  verifyToken,
  isFaculty,
  ownsStudent,
} = require("../middleware/authMiddleware");

// Student assignments
router.get(
  "/student/:studentId",
  verifyToken,
  ownsStudent("studentId"),
  getStudentAssignments
);

// Faculty assignments
router.get(
  "/faculty/:facultyId",
  verifyToken,
  isFaculty,
  getFacultyAssignments
);

// Create assignment
router.post(
  "/",
  verifyToken,
  isFaculty,
  createAssignment
);

// Delete assignment
router.delete(
  "/:id",
  verifyToken,
  isFaculty,
  deleteAssignment
);

module.exports = router;