const express = require("express");

const {
  getStudentAssignments,
  getFacultyAssignments,
  createAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

// Student assignments
router.get(
  "/student/:studentId",
  getStudentAssignments
);

// Faculty assignments
router.get(
  "/faculty/:facultyId",
  getFacultyAssignments
);

// Create assignment
router.post("/", createAssignment);

// Delete assignment
router.delete("/:id", deleteAssignment);

module.exports = router;