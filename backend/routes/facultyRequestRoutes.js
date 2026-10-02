// backend/routes/facultyRequestRoutes.js

const express = require("express");

const {
  getMyRequests,
  getFacultyRequests,
  getFacultyRequestStats,
  createFacultyRequest,
  updateFacultyRequestStatus,
  cancelFacultyRequest,
} = require("../controllers/facultyRequestController");

const {
  verifyToken,
  isFaculty,
  isHod,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// Every route requires a valid JWT token.
// The applicant is taken from the token, never from the
// request body, so a caller cannot file or cancel a
// request as another faculty member.
//
// Approval rights are restricted to the HOD with isHod.
// =====================================================

// -----------------------------------------
// OWN LIST
//
// There is no id in the path. The caller is taken
// from the token, so this cannot be pointed at a
// colleague's record.
// -----------------------------------------

router.get(
  "/mine",
  verifyToken,
  isFaculty,
  getMyRequests
);

// -----------------------------------------
// HOD REVIEW
// -----------------------------------------

// Static routes first so "/stats" is not matched by "/:id"
router.get(
  "/stats",
  verifyToken,
  isHod,
  getFacultyRequestStats
);

router.get(
  "/",
  verifyToken,
  isHod,
  getFacultyRequests
);

// -----------------------------------------
// FACULTY APPLY
// -----------------------------------------

router.post(
  "/",
  verifyToken,
  isFaculty,
  createFacultyRequest
);

// -----------------------------------------
// HOD DECISION
// -----------------------------------------

router.put(
  "/:id/status",
  verifyToken,
  isHod,
  updateFacultyRequestStatus
);

// -----------------------------------------
// FACULTY WITHDRAW
// -----------------------------------------

router.patch(
  "/:id/cancel",
  verifyToken,
  isFaculty,
  cancelFacultyRequest
);

module.exports = router;
