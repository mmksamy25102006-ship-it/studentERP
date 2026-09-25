const express = require("express");
const router = express.Router();

const Mark = require("../models/Mark");
const FacultySubject = require("../models/FacultySubject");


const {
  verifyToken,
  isFaculty,
} = require("../middleware/authMiddleware");

// ======================================================
// VALID SEMESTERS
// ======================================================

const VALID_SEMESTERS = [
  "Semester I",
  "Semester II",
  "Semester III",
  "Semester IV",
  "Semester V",
  "Semester VI",
];

// ======================================================
// NORMALIZE SUBJECT NAME
// ======================================================

const normalizeSubject = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

// ======================================================
// GET ALL MARKS
// GET /api/marks
// ======================================================

router.get("/", async (req, res) => {
  try {
    const marks = await Mark.find().sort({
      rollNo: 1,
      semester: 1,
    });

    res.status(200).json(marks);
  } catch (error) {
    console.error("GET ALL MARKS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch marks",
      error: error.message,
    });
  }
});

// ======================================================
// GET CURRENT / ONE STUDENT MARKS
// GET /api/marks/student/:rollNo
//
// Keeps existing API working.
// Returns latest updated semester.
// ======================================================

router.get("/student/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;

    const marks = await Mark.findOne({
      rollNo: rollNo.trim(),
    }).sort({
      updatedAt: -1,
    });

    if (!marks) {
      return res.status(404).json({
        success: false,
        message: "Marks not found",
      });
    }

    res.status(200).json(marks);
  } catch (error) {
    console.error("GET STUDENT MARKS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student marks",
      error: error.message,
    });
  }
});

// ======================================================
// GET ALL SEMESTER MARKS FOR ONE STUDENT
// GET /api/marks/student/:rollNo/semesters
// ======================================================

router.get("/student/:rollNo/semesters", async (req, res) => {
  try {
    const { rollNo } = req.params;

    const marks = await Mark.find({
      rollNo: rollNo.trim(),
    }).sort({
      semester: 1,
    });

    res.status(200).json({
      success: true,
      marks,
    });
  } catch (error) {
    console.error(
      "GET STUDENT SEMESTER MARKS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch semester marks",
      error: error.message,
    });
  }
});

// ======================================================
// CREATE / UPDATE MARKS
// PUT /api/marks/:rollNo
//
// IMPORTANT:
// Faculty can update ONLY subjects assigned to them.
//
// req.user.facultyId must come from authentication.
// ======================================================

router.put(
  "/:rollNo",
  verifyToken,
  isFaculty,
  async (req, res) => {
      try {
    const { rollNo } = req.params;

    console.log("=================================");
    console.log("UPDATE MARKS REQUEST");
    console.log("Roll No:", rollNo);
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("Authenticated User:", req.user);
    console.log("=================================");

    const {
      name,
      semester,
      subjects,
      overallCGPA,
      predictedRank,
    } = req.body;

    // --------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------

    if (!rollNo || !rollNo.trim()) {
      return res.status(400).json({
        success: false,
        message: "Roll number is required",
      });
    }

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Student name is required",
      });
    }

    if (!Array.isArray(subjects)) {
      return res.status(400).json({
        success: false,
        message: "Subjects must be an array",
      });
    }

    const cleanSemester = String(
      semester || "Semester I"
    ).trim();

    // --------------------------------------------------
    // SEMESTER VALIDATION
    // --------------------------------------------------

    if (!VALID_SEMESTERS.includes(cleanSemester)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid semester. Use Semester I to Semester VI.",
      });
    }

    // --------------------------------------------------
    // GET LOGGED-IN FACULTY
    // --------------------------------------------------

    const facultyId = req.user?.facultyId;

    if (!facultyId) {
      return res.status(401).json({
        success: false,
        message:
          "Unauthorized. Logged-in faculty information not found.",
      });
    }

    console.log("Faculty ID:", facultyId);
    console.log("Semester:", cleanSemester);

    // --------------------------------------------------
    // GET SUBJECTS ASSIGNED TO THIS FACULTY
    // --------------------------------------------------

    const facultyAssignments =
      await FacultySubject.find({
        facultyId: String(facultyId).trim(),
        semester: cleanSemester,
        isActive: true,
      });

    if (!facultyAssignments.length) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to any subjects for this semester.",
      });
    }

    // --------------------------------------------------
    // CREATE SET OF AUTHORIZED SUBJECTS
    // --------------------------------------------------

    const authorizedSubjects = new Set(
      facultyAssignments.map((item) =>
        normalizeSubject(item.subject)
      )
    );

    console.log(
      "Authorized Subjects:",
      Array.from(authorizedSubjects)
    );

    // --------------------------------------------------
    // FIND EXISTING STUDENT + SEMESTER RECORD
    // --------------------------------------------------

    let marksRecord = await Mark.findOne({
      rollNo: rollNo.trim(),
      semester: cleanSemester,
    });

    // --------------------------------------------------
    // IF NO RECORD EXISTS, CREATE ONE
    // --------------------------------------------------

    if (!marksRecord) {
      marksRecord = new Mark({
        rollNo: rollNo.trim(),
        name: String(name).trim(),
        semester: cleanSemester,
        subjects: [],
        overallCGPA: 0,
        predictedRank: 0,
      });
    } else {
      // Update student name only.
      marksRecord.name = String(name).trim();
    }

    // --------------------------------------------------
    // TRACK WHICH SUBJECTS WERE ACTUALLY UPDATED
    // --------------------------------------------------

    let updatedSubjectCount = 0;
    const rejectedSubjects = [];

    // --------------------------------------------------
    // UPDATE ONLY AUTHORIZED SUBJECTS
    // --------------------------------------------------

    for (const incomingSubject of subjects) {
      if (!incomingSubject) {
        continue;
      }

      const subjectName = String(
        incomingSubject.subject || ""
      ).trim();

      if (!subjectName) {
        continue;
      }

      const normalizedName =
        normalizeSubject(subjectName);

      // ------------------------------------------------
      // BACKEND AUTHORIZATION CHECK
      // ------------------------------------------------

      if (!authorizedSubjects.has(normalizedName)) {
        rejectedSubjects.push(subjectName);
        continue;
      }

      // ------------------------------------------------
      // FIND EXISTING SUBJECT
      // ------------------------------------------------

      const existingSubject =
        marksRecord.subjects.find(
          (item) =>
            normalizeSubject(item.subject) ===
            normalizedName
        );

      // ------------------------------------------------
      // UPDATE EXISTING SUBJECT
      // ------------------------------------------------

      if (existingSubject) {
        existingSubject.subject = subjectName;

        if (
          incomingSubject.credits !== undefined
        ) {
          existingSubject.credits =
            Number(incomingSubject.credits) || 0;
        }

        if (
          incomingSubject.internal1 !== undefined
        ) {
          existingSubject.internal1 =
            Number(incomingSubject.internal1) || 0;
        }

        if (
          incomingSubject.internal2 !== undefined
        ) {
          existingSubject.internal2 =
            Number(incomingSubject.internal2) || 0;
        }

        if (
          incomingSubject.assignment !== undefined
        ) {
          existingSubject.assignment =
            Number(incomingSubject.assignment) || 0;
        }

        if (
          incomingSubject.lab !== undefined
        ) {
          existingSubject.lab =
            Number(incomingSubject.lab) || 0;
        }

        if (incomingSubject.grade !== undefined) {
          existingSubject.grade =
            incomingSubject.grade;
        }

        if (
          incomingSubject.gradePoints !== undefined
        ) {
          existingSubject.gradePoints =
            Number(incomingSubject.gradePoints) || 0;
        }

        // Store which faculty updated this subject.
        existingSubject.facultyId =
          String(facultyId).trim();
      }

      // ------------------------------------------------
      // ADD NEW SUBJECT
      // ------------------------------------------------

      else {
        marksRecord.subjects.push({
          subject: subjectName,

          credits:
            Number(incomingSubject.credits) || 3,

          internal1:
            Number(incomingSubject.internal1) || 0,

          internal2:
            Number(incomingSubject.internal2) || 0,

          assignment:
            Number(incomingSubject.assignment) || 0,

          lab:
            Number(incomingSubject.lab) || 0,

          grade:
            incomingSubject.grade || "-",

          gradePoints:
            Number(incomingSubject.gradePoints) || 0,

          facultyId:
            String(facultyId).trim(),
        });
      }

      updatedSubjectCount++;
    }

    // --------------------------------------------------
    // NOTHING WAS UPDATED
    // --------------------------------------------------

    if (updatedSubjectCount === 0) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update any of the submitted subjects.",
        rejectedSubjects,
      });
    }

    // --------------------------------------------------
    // DO NOT REPLACE OTHER FACULTY'S SUBJECTS
    // --------------------------------------------------
    //
    // marksRecord.subjects already contains all existing
    // subjects. We only changed authorized subjects above.
    //
    // Therefore subjects belonging to other faculties
    // remain untouched.
    // --------------------------------------------------

    // Keep these values compatible with your existing API.
    if (overallCGPA !== undefined) {
      const cgpa = Number(overallCGPA);

      if (!Number.isNaN(cgpa)) {
        marksRecord.overallCGPA = cgpa;
      }
    }

    if (predictedRank !== undefined) {
      const rank = Number(predictedRank);

      if (!Number.isNaN(rank)) {
        marksRecord.predictedRank = rank;
      }
    }

    // --------------------------------------------------
    // SAVE
    // --------------------------------------------------

    const updatedMarks = await marksRecord.save();

    console.log("MARKS SAVED:");
    console.log(updatedMarks);

    console.log(
      "Updated Subject Count:",
      updatedSubjectCount
    );

    if (rejectedSubjects.length > 0) {
      console.log(
        "Rejected Subjects:",
        rejectedSubjects
      );
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Marks updated successfully",
      marks: updatedMarks,
      updatedSubjectCount,
      rejectedSubjects,
    });
  } catch (error) {
    console.error(
      "================================="
    );

    console.error("UPDATE MARKS ERROR:");

    console.error(error);

    console.error(
      "================================="
    );

    res.status(500).json({
      success: false,
      message: "Failed to update marks",
      error: error.message,
    });
  }
});

// ======================================================
// DELETE MARKS
// DELETE /api/marks/:rollNo
//
// Deletes all semester records for that student.
// ======================================================

router.delete("/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;

    const deleted = await Mark.deleteMany({
      rollNo: rollNo.trim(),
    });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Marks not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Marks deleted successfully",
    });
  } catch (error) {
    console.error("DELETE MARKS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete marks",
      error: error.message,
    });
  }
});

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;