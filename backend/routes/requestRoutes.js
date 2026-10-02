// backend/routes/requestRoutes.js

const express = require("express");

const {
  getStudentRequests,
  getRequests,
  getRequestStats,
  createRequest,
  updateRequestStatus,
  cancelRequest,
} = require("../controllers/requestController");

const {
  verifyToken,
  isFaculty,
  isStudent,
  isFacultyOrAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// Every route requires a valid JWT token.
// Student data is taken from the token, never from the
// request body, so a caller cannot act as someone else.
// =====================================================

// -----------------------------------------
// FACULTY VIEW
// -----------------------------------------

// Static routes first so "/stats" is not matched by "/:id"
router.get(
  "/stats",
  verifyToken,
  isFacultyOrAdmin,
  getRequestStats
);

// A student may only read their own list.
// The controller compares against req.user.studentId.
router.get(
  "/student/:studentId",
  verifyToken,
  getStudentRequests
);

router.get(
  "/",
  verifyToken,
  isFacultyOrAdmin,
  getRequests
);

// -----------------------------------------
// STUDENT APPLY
// -----------------------------------------

router.post(
  "/",
  verifyToken,
  isStudent,
  createRequest
);

// -----------------------------------------
// FACULTY DECISION
// -----------------------------------------

router.put(
  "/:id/status",
  verifyToken,
  isFaculty,
  updateRequestStatus
);

// -----------------------------------------
// STUDENT WITHDRAW
// -----------------------------------------

router.patch(
  "/:id/cancel",
  verifyToken,
  isStudent,
  cancelRequest
);

module.exports = router;
