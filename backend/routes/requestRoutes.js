const express = require("express");

const {
  getStudentRequests,
  getRequests,
  getRequestStats,
  createRequest,
  updateRequestStatus,
  cancelRequest,
} = require("../controllers/requestController");

const router = express.Router();

// =====================================================
// STATIC / NESTED ROUTES
// Registered before "/:id" so they are not swallowed
// by the parameter route.
// =====================================================

router.get("/stats", getRequestStats);
router.get("/student/:studentId", getStudentRequests);

// Student applies
router.post("/", createRequest);

// Faculty decision
router.put("/:id/status", updateRequestStatus);

// Student withdraws
router.patch("/:id/cancel", cancelRequest);

module.exports = router;
