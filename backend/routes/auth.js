// backend/routes/auth.js

const express = require("express");
const rateLimit = require("express-rate-limit");
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
//
// Brute force protection. Without this every login attempt
// burns a full bcrypt comparison, and the enumeration oracle
// below makes it trivial to script against. 10 attempts per
// 15 minutes per IP is enough for a human, too tight for a
// password-guessing loop.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again in 15 minutes.",
  },
});

router.post("/login", loginLimiter, login);


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