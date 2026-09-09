// backend/controllers/authController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================
// Register User
// =========================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      studentId,
      facultyId,
      department,
      year,
      phone,
    } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // Validate role
    if (!["student", "faculty", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Student must have studentId
    if (role === "student" && !studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required for student users",
      });
    }

    // Faculty must have facultyId
    if (role === "faculty" && !facultyId) {
      return res.status(400).json({
        success: false,
        message: "Faculty ID is required for faculty users",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Check duplicate student ID
    if (studentId) {
      const existingStudent = await User.findOne({ studentId });

      if (existingStudent) {
        return res.status(409).json({
          success: false,
          message: "Student ID already exists",
        });
      }
    }

    // Check duplicate faculty ID
    if (facultyId) {
      const existingFaculty = await User.findOne({ facultyId });

      if (existingFaculty) {
        return res.status(409).json({
          success: false,
          message: "Faculty ID already exists",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,

      // Student / Faculty IDs
      studentId: role === "student" ? studentId : null,
      facultyId: role === "faculty" ? facultyId : null,

      department: department || "",
      year: year || "",
      phone: phone || "",
    });

    return res.status(201).json({
      success: true,
      message: "Registration Successful",

      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        studentId: newUser.studentId,
        facultyId: newUser.facultyId,
        department: newUser.department,
        year: newUser.year,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// =========================
// Login User
// =========================

const login = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    console.log("Email:", email);
    console.log("Role:", role);

    // Find user by email + role
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role,
    });

    console.log("User:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact the administrator.",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Password Match:", isPasswordCorrect);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,

        // Include user relationship ID in JWT
        studentId: user.studentId || null,
        facultyId: user.facultyId || null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Return login response
    return res.status(200).json({
      success: true,
      message: "Login Successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        // Important for multi-user system
        studentId: user.studentId || null,
        facultyId: user.facultyId || null,

        department: user.department || "",
        year: user.year || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};