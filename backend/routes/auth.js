// backend/routes/auth.js

const express = require("express");
const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");

const {
  verifyToken,
  isAdmin,
  isFaculty,
  isStudent,
} = require("../middleware/authMiddleware");


// =========================
// Auth Routes
// =========================

// Register User
//
// Account creation is an administrator action. The frontend
// has no self-serve registration page, and every account is
// created by the admin. If this route stayed public, anyone
// could create a working admin account with one request, so
// it must sit behind the admin guard.
router.post("/register", verifyToken, isAdmin, register);

// Login User
router.post("/login", login);


// =========================
// Protected Routes
// =========================

// Logged-in User Profile
router.get("/profile", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Student Dashboard
router.get(
  "/student-dashboard",
  verifyToken,
  isStudent,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Student",
      user: req.user,
    });
  }
);

// Faculty Dashboard
router.get(
  "/faculty-dashboard",
  verifyToken,
  isFaculty,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Faculty",
      user: req.user,
    });
  }
);

// Admin Dashboard
router.get(
  "/admin-dashboard",
  verifyToken,
  isAdmin,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Admin",
      user: req.user,
    });
  }
);

module.exports = router;