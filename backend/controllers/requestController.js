// backend/controllers/requestController.js

const StudentRequest = require("../models/StudentRequest");

// Build a certificate number like BON/2026/STU001/0007
const buildCertificateNumber = async (studentId) => {
  const year = new Date().getFullYear();

  const count = await StudentRequest.countDocuments({
    type: "bonafide",
    status: "approved",
  });

  const sequence = String(count + 1).padStart(4, "0");

  return `BON/${year}/${studentId}/${sequence}`;
};

// GET REQUESTS FOR A STUDENT
const getStudentRequests = async (req, res) => {
  try {
    const studentId = String(req.params.studentId)
      .trim()
      .toUpperCase();

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const requests = await StudentRequest.find({
      studentId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get Student Requests Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student requests",
      error: error.message,
    });
  }
};

// GET ALL REQUESTS
const getRequests = async (req, res) => {
  try {
    const { status, type, search } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    if (search) {
      const escaped = String(search)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { studentId: new RegExp(escaped, "i") },
        { studentName: new RegExp(escaped, "i") },
        { reason: new RegExp(escaped, "i") },
      ];
    }

    const requests = await StudentRequest.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get Requests Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
};

// GET REQUEST STATISTICS
const getRequestStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected, leave, bonafide] =
      await Promise.all([
        StudentRequest.countDocuments(),
        StudentRequest.countDocuments({ status: "pending" }),
        StudentRequest.countDocuments({ status: "approved" }),
        StudentRequest.countDocuments({ status: "rejected" }),
        StudentRequest.countDocuments({ type: "leave" }),
        StudentRequest.countDocuments({ type: "bonafide" }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        leave,
        bonafide,
      },
    });
  } catch (error) {
    console.error("Get Request Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch request statistics",
      error: error.message,
    });
  }
};

// CREATE REQUEST
const createRequest = async (req, res) => {
  try {
    const {
      type,
      studentId,
      studentName,
      department,
      year,
      leaveType,
      fromDate,
      toDate,
      certificateType,
      purpose,
      reason,
    } = req.body;

    if (!type || !studentId || !reason) {
      return res.status(400).json({
        success: false,
        message:
          "Request type, student ID and reason are required",
      });
    }

    if (!["leave", "bonafide"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Request type must be leave or bonafide",
      });
    }

    const cleanStudentId = String(studentId)
      .trim()
      .toUpperCase();

    const trimmedReason = reason.trim();

    if (trimmedReason.length < 10) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a reason of at least 10 characters",
      });
    }

    // -----------------------------------------
    // LEAVE VALIDATION
    // -----------------------------------------

    if (type === "leave") {
      if (!fromDate || !toDate) {
        return res.status(400).json({
          success: false,
          message:
            "From date and to date are required for leave",
        });
      }

      const start = new Date(fromDate);
      const end = new Date(toDate);

      if (end < start) {
        return res.status(400).json({
          success: false,
          message: "To date cannot be before from date",
        });
      }

      // Block an identical pending leave request
      const duplicate = await StudentRequest.findOne({
        studentId: cleanStudentId,
        type: "leave",
        status: "pending",
        fromDate: start,
        toDate: end,
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "You already have a pending leave request for these dates",
        });
      }
    }

    // -----------------------------------------
    // BONAFIDE VALIDATION
    // -----------------------------------------

    if (type === "bonafide") {
      if (!purpose || !purpose.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Purpose is required for a bonafide request",
        });
      }

      // Only one bonafide in flight at a time
      const pending = await StudentRequest.findOne({
        studentId: cleanStudentId,
        type: "bonafide",
        status: "pending",
      });

      if (pending) {
        return res.status(409).json({
          success: false,
          message:
            "You already have a bonafide request awaiting approval",
        });
      }
    }

    const request = await StudentRequest.create({
      type,
      studentId: cleanStudentId,
      studentName: studentName || "",
      department: department || "",
      year: year || "",
      leaveType:
        type === "leave"
          ? leaveType || "Casual Leave"
          : "Casual Leave",
      fromDate: type === "leave" ? new Date(fromDate) : null,
      toDate: type === "leave" ? new Date(toDate) : null,
      certificateType:
        type === "bonafide" ? certificateType || "" : "",
      purpose: type === "bonafide" ? purpose.trim() : "",
      reason: trimmedReason,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message:
        type === "leave"
          ? "Leave request submitted successfully"
          : "Bonafide request submitted successfully",
      request,
    });
  } catch (error) {
    console.error("Create Request Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit request",
      error: error.message,
    });
  }
}

// APPROVE / REJECT A REQUEST
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      facultyRemark,
      facultyId,
      facultyName,
    } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be either approved or rejected",
      });
    }

    const request = await StudentRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "This request has already been processed",
      });
    }

    if (
      status === "rejected" &&
      (!facultyRemark || !facultyRemark.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A remark is required when rejecting a request",
      });
    }

    request.status = status;
    request.facultyRemark = (facultyRemark || "").trim();
    request.actionedBy = facultyId || "";
    request.actionedByName = facultyName || "";
    request.actionedAt = new Date();

    // Issue the certificate number once approved
    if (status === "approved" && request.type === "bonafide") {
      if (!request.certificateNumber) {
        request.certificateNumber =
          await buildCertificateNumber(request.studentId);
      }

      request.issuedDate = new Date();
    }

    await request.save();

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      request,
    });
  } catch (error) {
    console.error("Update Request Status Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update request",
      error: error.message,
    });
  }
};

// CANCEL A PENDING REQUEST (student)
const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.query;

    const request = await StudentRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // A student can only cancel their own request
    if (
      studentId &&
      request.studentId !==
        String(studentId).trim().toUpperCase()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only cancel your own request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only a pending request can be cancelled",
      });
    }

    request.status = "cancelled";
    request.facultyRemark = "Cancelled by student";

    await request.save();

    res.status(200).json({
      success: true,
      message: "Request cancelled",
      request,
    });
  } catch (error) {
    console.error("Cancel Request Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel request",
      error: error.message,
    });
  }
};

module.exports = {
  getStudentRequests,
  getRequests,
  getRequestStats,
  createRequest,
  updateRequestStatus,
  cancelRequest,
};
