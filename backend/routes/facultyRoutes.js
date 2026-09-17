const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");

// =====================================================
// GET ALL FACULTY
// =====================================================

router.get("/", async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(faculty);
  } catch (error) {
    console.error("Get Faculty Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty",
      error: error.message,
    });
  }
});

// =====================================================
// CREATE FACULTY
// =====================================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      facultyId,
      department,
      designation,
      experience,
      year,
      phone,
    } = req.body;
const facultyPassword = password || "Faculty@123";
    if (
      !name ||
      !email ||
      !facultyId ||
      !department ||
      !designation ||
      !experience
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, faculty ID, department, designation and experience are required",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanFacultyId = String(facultyId).trim();

    // Check duplicate email
    const existingEmail = await User.findOne({
      email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check duplicate faculty ID
    const existingFaculty = await User.findOne({
      facultyId: cleanFacultyId,
    });

    if (existingFaculty) {
      return res.status(409).json({
        success: false,
        message: "Faculty ID already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(facultyPassword, 10);

    // Create faculty
    const faculty = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: "faculty",
      facultyId: cleanFacultyId,
      department: department.trim(),
      designation: designation.trim(),
      experience: experience.trim(),
      year: year || "",
      phone: phone || "",
      isActive: true,
    });

    const facultyResponse = faculty.toObject();

    delete facultyResponse.password;

    res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      faculty: facultyResponse,
    });
  } catch (error) {
    console.error("Create Faculty Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create faculty",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE FACULTY
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      facultyId,
      department,
      designation,
      experience,
      year,
      phone,
      isActive,
    } = req.body;

    const faculty = await User.findOne({
      _id: req.params.id,
      role: "faculty",
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    // -----------------------------------------
    // EMAIL
    // -----------------------------------------

    if (email) {
      const cleanEmail = email.toLowerCase().trim();

      const existingEmail = await User.findOne({
        email: cleanEmail,
        _id: { $ne: req.params.id },
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      faculty.email = cleanEmail;
    }

    // -----------------------------------------
    // FACULTY ID
    // -----------------------------------------

    if (facultyId) {
      const cleanFacultyId = String(facultyId).trim();

      const existingFaculty = await User.findOne({
        facultyId: cleanFacultyId,
        _id: { $ne: req.params.id },
      });

      if (existingFaculty) {
        return res.status(409).json({
          success: false,
          message: "Faculty ID already exists",
        });
      }

      faculty.facultyId = cleanFacultyId;
    }

    // -----------------------------------------
    // OTHER FIELDS
    // -----------------------------------------

    if (name !== undefined) {
      faculty.name = name.trim();
    }

    if (department !== undefined) {
      faculty.department = department.trim();
    }

    if (designation !== undefined) {
      faculty.designation = designation.trim();
    }

    if (experience !== undefined) {
      faculty.experience = experience.trim();
    }

    if (year !== undefined) {
      faculty.year = year;
    }

    if (phone !== undefined) {
      faculty.phone = phone;
    }

    if (isActive !== undefined) {
      faculty.isActive = isActive;
    }

    // -----------------------------------------
    // PASSWORD
    // -----------------------------------------

    if (password && password.trim() !== "") {
      faculty.password = await bcrypt.hash(password, 10);
    }

    await faculty.save();

    const facultyResponse = faculty.toObject();

    delete facultyResponse.password;

    res.json({
      success: true,
      message: "Faculty updated successfully",
      faculty: facultyResponse,
    });
  } catch (error) {
    console.error("Update Faculty Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update faculty",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE FACULTY
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const faculty = await User.findOne({
      _id: req.params.id,
      role: "faculty",
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Faculty deleted successfully",
    });
  } catch (error) {
    console.error("Delete Faculty Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete faculty",
      error: error.message,
    });
  }
});

module.exports = router;