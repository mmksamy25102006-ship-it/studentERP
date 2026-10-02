// backend/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT Token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Admin Only
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only.",
    });
  }

  next();
};

// Faculty Only
const isFaculty = (req, res, next) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({
      success: false,
      message: "Faculty access only.",
    });
  }

  next();
};

// Student Only
const isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      success: false,
      message: "Student access only.",
    });
  }

  next();
};

// Student IDs are stored uppercase on the Student and
// StudentRequest collections but keep whatever case the
// user typed on the User record, so both sides of every
// comparison are normalised.
const normaliseId = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

// Lets a student read their own record while blocking
// access to anybody else's. Faculty and admin may read
// any student's record.
//
// Use as: router.get("/student/:studentId", verifyToken, ownsStudent("studentId"), handler)
const ownsStudent = (paramName) => {
  return (req, res, next) => {
    if (
      req.user.role === "faculty" ||
      req.user.role === "admin"
    ) {
      return next();
    }

    const requested = normaliseId(
      req.params[paramName]
    );

    const own = normaliseId(req.user.studentId);

    if (!own) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has no student ID. Contact the admin.",
      });
    }

    if (requested !== own) {
      return res.status(403).json({
        success: false,
        message:
          "You can only access your own records",
      });
    }

    next();
  };
};

// Same idea as ownsStudent, for faculty-owned records.
// Use as: router.get("/faculty/:facultyId", verifyToken, ownsFaculty("facultyId"), handler)
const ownsFaculty = (paramName) => {
  return (req, res, next) => {
    if (req.user.role === "admin") {
      return next();
    }

    if (req.user.role !== "faculty") {
      return res.status(403).json({
        success: false,
        message: "Faculty access only.",
      });
    }

    const requested = normaliseId(
      req.params[paramName]
    );

    const own = normaliseId(req.user.facultyId);

    if (!own) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has no faculty ID. Contact the admin.",
      });
    }

    if (requested !== own) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own records",
      });
    }

    next();
  };
};

// Faculty or Admin Only
const isFacultyOrAdmin = (req, res, next) => {
  if (
    req.user.role !== "faculty" &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Faculty access only.",
    });
  }

  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isFaculty,
  isStudent,
  isFacultyOrAdmin,
  ownsStudent,
  ownsFaculty,
  normaliseId,
};