const express = require("express");
const router = express.Router();

const FacultySubject = require("../models/FacultySubject");

// ======================================================
// GET SUBJECTS ASSIGNED TO A FACULTY
// GET /api/faculty-subjects/faculty/:facultyId
// ======================================================

router.get("/faculty/:facultyId", async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { semester } = req.query;

    const filter = {
      facultyId: facultyId.trim(),
      isActive: true,
    };

    if (semester) {
      filter.semester = semester.trim();
    }

    const subjects = await FacultySubject.find(filter).sort({
      semester: 1,
      subject: 1,
    });

    res.status(200).json({
      success: true,
      subjects,
    });
  } catch (error) {
    console.error("GET FACULTY SUBJECTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty subjects",
      error: error.message,
    });
  }
});


// ======================================================
// GET ALL FACULTY-SUBJECT ASSIGNMENTS
// GET /api/faculty-subjects
// ======================================================

router.get("/", async (req, res) => {
  try {
    const assignments = await FacultySubject.find().sort({
      facultyId: 1,
      semester: 1,
      subject: 1,
    });

    res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("GET FACULTY SUBJECT ASSIGNMENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty subject assignments",
      error: error.message,
    });
  }
});


// ======================================================
// CREATE FACULTY-SUBJECT ASSIGNMENT
// POST /api/faculty-subjects
// ======================================================

router.post("/", async (req, res) => {
  try {
    const {
      facultyId,
      facultyName,
      subject,
      semester,
      department,
      year,
      section,
    } = req.body;

    if (!facultyId || !subject || !semester) {
      return res.status(400).json({
        success: false,
        message: "facultyId, subject and semester are required",
      });
    }

    const assignment = await FacultySubject.create({
      facultyId: facultyId.trim(),
      facultyName: facultyName || "",
      subject: subject.trim(),
      semester: semester.trim(),
      department: department || "",
      year: year || "",
      section: section || "",
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Faculty subject assigned successfully",
      assignment,
    });
  } catch (error) {
    console.error("CREATE FACULTY SUBJECT ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This faculty is already assigned to this subject for this semester",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to assign subject",
      error: error.message,
    });
  }
});


// ======================================================
// DELETE FACULTY-SUBJECT ASSIGNMENT
// DELETE /api/faculty-subjects/:id
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await FacultySubject.findByIdAndDelete(
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Faculty subject assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Faculty subject assignment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE FACULTY SUBJECT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error.message,
    });
  }
});


module.exports = router;