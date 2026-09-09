const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// GET ALL STUDENTS
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch students",
      error: error.message,
    });
  }
});

// ADD STUDENT
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/students");
    console.log("Received data:", req.body);

    let {
      studentId,
      name,
      department,
      year,
      cgpa,
      phone,
    } = req.body;

    // Clean values
    studentId = studentId?.trim().toUpperCase();
    name = name?.trim();
    department = department?.trim().toUpperCase();

    // Phone is optional
    phone = phone?.trim() || "";

    // Convert "I Year" -> "I"
    if (year) {
      year = year.replace(/\s*Year\s*/i, "").trim().toUpperCase();
    }

    cgpa = Number(cgpa);

    // Validation
    // Phone is NOT required
    if (!studentId || !name || !department || !year) {
      return res.status(400).json({
        message: "Student ID, name, department and year are required",
      });
    }

    if (!["I", "II", "III", "IV"].includes(year)) {
      return res.status(400).json({
        message: "Invalid year. Use I, II, III or IV.",
      });
    }

    if (Number.isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      return res.status(400).json({
        message: "CGPA must be between 0 and 10",
      });
    }

    // Validate phone ONLY when provided
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits",
      });
    }

    // Check duplicate Student ID
    const existingStudent = await Student.findOne({ studentId });

    if (existingStudent) {
      return res.status(409).json({
        message: `Student ID ${studentId} already exists`,
      });
    }

    // Create student
    const student = await Student.create({
      studentId,
      name,
      department,
      year,
      cgpa,
      phone,
    });

    console.log("Student created:", student);

    res.status(201).json({
      message: "Student added successfully",
      student,
    });
  } catch (error) {
    console.error("ADD STUDENT ERROR:", error);

    res.status(500).json({
      message: "Failed to add student",
      error: error.message,
    });
  }
});

// UPDATE STUDENT
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    let {
      studentId,
      name,
      department,
      year,
      cgpa,
      phone,
    } = req.body;

    year = year?.replace(/\s*Year\s*/i, "").trim().toUpperCase();

    student.studentId = studentId?.trim().toUpperCase();
    student.name = name?.trim();
    student.department = department?.trim().toUpperCase();
    student.year = year;
    student.cgpa = Number(cgpa);

    // Phone is optional
    student.phone = phone?.trim() || "";

    await student.save();

    res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);

    res.status(500).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
});

// DELETE STUDENT
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
});

module.exports = router;