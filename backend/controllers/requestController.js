// backend/controllers/requestController.js

const StudentRequest = require("../models/StudentRequest");

// Student IDs are stored uppercase in this collection.
// The User model keeps whatever case the user typed,
// so every comparison has to normalise both sides.
const normaliseId = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

// Resolve the student ID of the logged-in user.
const currentStudentId = (req) =>
  normaliseId(req.user?.studentId);

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
    const requestedId = normaliseId(req.params.studentId);
    const loggedInId = currentStudentId(req);

    if (!requestedId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    // A student can only read their own requests.
    // Faculty and admin may read any student's list.
    const isPrivileged =
      req.user.role === "faculty" ||
      req.user.role === "admin";

    if (!isPrivileged && requestedId !== loggedInId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own requests",
      });
    }

    const requests = await StudentRequest.find({
      studentId: requestedId,
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
    });
  }
};

// CREATE REQUEST
const createRequest = async (req, res) => {
  try {
    const {
      type,
      leaveType,
      fromDate,
      toDate,
      certificateType,
      purpose,
      reason,
    } = req.body;

    // The student ID and name always come from the
    // signed-in user, never from the request body,
    // so nobody can file a request as another student.
    const cleanStudentId = currentStudentId(req);

    if (!cleanStudentId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account has no student ID. Contact the admin.",
      });
    }

    if (!type || !reason) {
      return res.status(400).json({
        success: false,
        message:
          "Request type and reason are required",
      });
    }

    if (!["leave", "bonafide"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Request type must be leave or bonafide",
      });
    }

    const trimmedReason = String(reason).trim();

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
      studentName: req.user.name || "",
      department: req.user.department || "",
      year: req.user.year || "",
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
    });
  }
}

// APPROVE / REJECT A REQUEST
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, facultyRemark } = req.body;

    // Faculty identity comes from the token so the
    // approval record cannot be forged in the body.
    const facultyId =
      req.user.facultyId || req.user._id?.toString() || "";
    const facultyName = req.user.name || "";

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

    // Faculty may only action requests from their own
    // department. The department is read from the token,
    // never from the body, so it cannot be widened. A
    // faculty member without a department cannot action
    // any request, which is safer than silently allowing
    // cross-department decisions.
    const facultyDepartment = String(
      req.user.department || ""
    ).trim().toLowerCase();

    const requestDepartment = String(
      request.department || ""
    ).trim().toLowerCase();

    if (req.user.role === "faculty") {
      if (!facultyDepartment) {
        return res.status(403).json({
          success: false,
          message:
            "Your account has no department. Contact the admin.",
        });
      }

      if (
        requestDepartment &&
        requestDepartment !== facultyDepartment
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only action requests from your own department",
        });
      }
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
    request.facultyRemark = String(
      facultyRemark || ""
    ).trim();
    request.actionedBy = facultyId;
    request.actionedByName = facultyName;
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
    });
  }
};

// CANCEL A PENDING REQUEST (student)
const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await StudentRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Ownership is checked against the token on every
    // call. It is never skipped, so a student cannot
    // cancel somebody else's request.
    const loggedInId = currentStudentId(req);

    if (!loggedInId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account has no student ID. Contact the admin.",
      });
    }

    if (normaliseId(request.studentId) !== loggedInId) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own request",
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
