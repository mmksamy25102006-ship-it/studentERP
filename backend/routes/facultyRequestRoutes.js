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
  isHodOrPrincipal,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// Every route requires a valid JWT token.
// The applicant is taken from the token, never from the
// request body, so a caller cannot file or cancel a
// request as another faculty member.
//
// Approval rights are restricted to the HOD (own
// department), the principal (college wide) and the admin
// (support access). isHodOrPrincipal enforces that.
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
// HOD / PRINCIPAL REVIEW
// -----------------------------------------

// Static routes first so "/stats" is not matched by "/:id"
router.get(
  "/stats",
  verifyToken,
  isHodOrPrincipal,
  getFacultyRequestStats
);

router.get(
  "/",
  verifyToken,
  isHodOrPrincipal,
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
  isHodOrPrincipal,
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
