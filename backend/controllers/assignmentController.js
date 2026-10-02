const Assignment = require("../models/Assignment");

// GET ASSIGNMENTS FOR A STUDENT
const getStudentAssignments = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const assignments = await Assignment.find({
      studentIds: studentId,
    }).sort({
      dueDate: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Get Student Assignments Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student assignments",
      error: error.message,
    });
  }
};

// GET ASSIGNMENTS CREATED BY A FACULTY
const getFacultyAssignments = async (req, res) => {
  try {
    const { facultyId } = req.params;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: "Faculty ID is required",
      });
    }

    const assignments = await Assignment.find({
      facultyId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Get Faculty Assignments Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty assignments",
      error: error.message,
    });
  }
};

// CREATE ASSIGNMENT
const createAssignment = async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      dueDate,
      studentIds,
    } = req.body;

    // Faculty identity comes from the token. The body may
    // still carry a facultyId from older clients, but it is
    // never trusted: a caller could otherwise create an
    // assignment attributed to somebody else.
    const facultyId =
      req.user.facultyId || req.user._id?.toString() || "";
    const facultyName = req.user.name || "";

    if (
      !title ||
      !subject ||
      !dueDate ||
      !facultyId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, subject, due date and faculty ID are required",
      });
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one student must be selected",
      });
    }

    const assignment = await Assignment.create({
      title,
      subject,
      description: description || "",
      dueDate,
      facultyId,
      facultyName: facultyName || "",
      studentIds,
    });

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error("Create Assignment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  }
};

// DELETE ASSIGNMENT
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Assignment ID is required",
      });
    }

    const existing = await Assignment.findById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Only the faculty who created the assignment may
    // delete it. The owner is compared against the token
    // identity, so another faculty member cannot remove a
    // colleague's assignment.
    const facultyId =
      req.user.facultyId || req.user._id?.toString() || "";

    if (
      String(existing.facultyId || "").trim() !==
        String(facultyId).trim()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete assignments you created",
      });
    }

    await Assignment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Assignment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentAssignments,
  getFacultyAssignments,
  createAssignment,
  deleteAssignment,
};