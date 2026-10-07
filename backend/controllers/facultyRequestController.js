// backend/controllers/facultyRequestController.js

const FacultyRequest = require("../models/FacultyRequest");
const User = require("../models/User");

// Faculty IDs are stored uppercase in this collection.
// The User model keeps whatever case the user typed,
// so every comparison has to normalise both sides.
const normaliseId = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

// Resolve the faculty ID of the logged-in user.
const currentFacultyId = (req) =>
  normaliseId(req.user?.facultyId);

// GET REQUESTS FILED BY THE SIGNED-IN FACULTY
const getMyRequests = async (req, res) => {
  try {
    const facultyId = currentFacultyId(req);

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account has no faculty ID. Contact the admin.",
      });
    }

    // The list is always the caller's own record. The
    // id in the path is ignored on purpose so this
    // endpoint cannot be used to read a colleague's
    // file. HOD review happens through the HOD list,
    // which is department scoped.
    const requests = await FacultyRequest.find({
      facultyId: facultyId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get My Faculty Requests Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty requests",
    });
  }
};

// GET ALL REQUESTS FOR HOD REVIEW
const getFacultyRequests = async (req, res) => {
  try {
    const {
      status,
      type,
      search,
      department,
      hodOnly,
    } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    // The principal outranks every department, so their
    // list is not narrowed to a department. Declared here
    // because the hodOnly branch below also needs it.
    const isPrincipal =
      req.user.role === "faculty" &&
      req.user.isPrincipal === true;

    // An HOD only ever sees their own department.
    // The value comes from the token, not the query
    // string, so it cannot be widened.
    if (
      !isPrincipal &&
      req.user.role === "faculty" &&
      req.user.isHod === true
    ) {
      const departmentName = String(
        req.user.department || ""
      ).trim();

      // Without a department the filter would be empty,
      // which would show every request in the college.
      // Fail closed instead and let the admin fix the
      // account.
      if (!departmentName) {
        return res.status(400).json({
          success: false,
          message:
            "Your account has no department set. Contact the admin.",
        });
      }

      filter.department = departmentName;
    } else if (department) {
      filter.department = String(department).trim();
    }

    // Countersigning HOD leave sits with whoever is above
    // the HOD: the admin, and now the principal. Both can
    // narrow their queue to just those requests, so ordinary
    // faculty leave still routes through the department HOD
    // rather than being rubber stamped twice.
    if (
      (req.user.role === "admin" || isPrincipal) &&
      hodOnly === "true"
    ) {
      const heads = await User.find({
        role: "faculty",
        isHod: true,
      }).select("facultyId");

      const headIds = heads
        .map((head) => normaliseId(head.facultyId))
        .filter(Boolean);

      filter.facultyId = { $in: headIds };
    }

    if (search) {
      const escaped = String(search)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { facultyId: new RegExp(escaped, "i") },
        { facultyName: new RegExp(escaped, "i") },
        { reason: new RegExp(escaped, "i") },
      ];
    }

    const requests = await FacultyRequest.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Get Faculty Requests Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty requests",
    });
  }
};

// GET REQUEST STATISTICS FOR THE DEPARTMENT
const getFacultyRequestStats = async (req, res) => {
  try {
    const { hodOnly } = req.query;

    const filter = {};

    // Same two rules as the list: the principal is not tied
    // to a department, and both of them may narrow the count
    // to HOD leave.
    const isPrincipal =
      req.user.role === "faculty" &&
      req.user.isPrincipal === true;

    if (
      !isPrincipal &&
      req.user.role === "faculty" &&
      req.user.isHod === true
    ) {
      const departmentName = String(
        req.user.department || ""
      ).trim();

      // Same fail closed rule as the list. An empty
      // filter here would report college wide totals.
      if (!departmentName) {
        return res.status(400).json({
          success: false,
          message:
            "Your account has no department set. Contact the admin.",
        });
      }

      filter.department = departmentName;
    }

    // Matches the list so the admin cards and the table
    // count the same set.
    if (
      (req.user.role === "admin" || isPrincipal) &&
      hodOnly === "true"
    ) {
      const heads = await User.find({
        role: "faculty",
        isHod: true,
      }).select("facultyId");

      const headIds = heads
        .map((head) => normaliseId(head.facultyId))
        .filter(Boolean);

      filter.facultyId = { $in: headIds };
    }

    const [total, pending, approved, rejected, leave, permission] =
      await Promise.all([
        FacultyRequest.countDocuments(filter),
        FacultyRequest.countDocuments({
          ...filter,
          status: "pending",
        }),
        FacultyRequest.countDocuments({
          ...filter,
          status: "approved",
        }),
        FacultyRequest.countDocuments({
          ...filter,
          status: "rejected",
        }),
        FacultyRequest.countDocuments({
          ...filter,
          type: "leave",
        }),
        FacultyRequest.countDocuments({
          ...filter,
          type: "permission",
        }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        leave,
        permission,
      },
    });
  } catch (error) {
    console.error("Get Faculty Request Stats Error:", error);

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch faculty request statistics",
    });
  }
};

// APPLY FOR LEAVE OR PERMISSION
const createFacultyRequest = async (req, res) => {
  try {
    const {
      type,
      leaveType,
      fromDate,
      toDate,
      permissionType,
      reason,
    } = req.body;

    // The faculty ID and name always come from the
    // signed-in user, never from the request body,
    // so nobody can apply on someone else's behalf.
    const cleanFacultyId = currentFacultyId(req);

    if (!cleanFacultyId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account has no faculty ID. Contact the admin.",
      });
    }

    if (!type || !reason) {
      return res.status(400).json({
        success: false,
        message:
          "Request type and reason are required",
      });
    }

    if (!["leave", "permission"].includes(type)) {
      return res.status(400).json({
        success: false,
        message:
          "Request type must be leave or permission",
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
          message:
            "To date cannot be before from date",
        });
      }

      // Block an identical pending leave request
      const duplicate = await FacultyRequest.findOne({
        facultyId: cleanFacultyId,
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
    // PERMISSION VALIDATION
    // -----------------------------------------

    if (type === "permission") {
      if (!permissionType || !permissionType.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Permission type is required for a permission request",
        });
      }

      // Only one permission in flight at a time
      const pending = await FacultyRequest.findOne({
        facultyId: cleanFacultyId,
        type: "permission",
        status: "pending",
      });

      if (pending) {
        return res.status(409).json({
          success: false,
          message:
            "You already have a permission request awaiting approval",
        });
      }
    }

    const request = await FacultyRequest.create({
      type,
      facultyId: cleanFacultyId,
      facultyName: req.user.name || "",
      department: req.user.department || "",
      designation: req.user.designation || "",
      leaveType:
        type === "leave"
          ? leaveType || "Casual Leave"
          : "Casual Leave",
      fromDate:
        type === "leave" ? new Date(fromDate) : null,
      toDate: type === "leave" ? new Date(toDate) : null,
      permissionType:
        type === "permission" ? permissionType.trim() : "",
      reason: trimmedReason,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message:
        type === "leave"
          ? "Leave request submitted successfully"
          : "Permission request submitted successfully",
      request,
    });
  } catch (error) {
    console.error("Create Faculty Request Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit request",
    });
  }
};

// APPROVE / REJECT A FACULTY REQUEST
const updateFacultyRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, hodRemark } = req.body;

    // HOD identity comes from the token so the
    // approval record cannot be forged in the body.
    const hodId =
      req.user.facultyId || req.user._id?.toString() || "";
    const hodName = req.user.name || "";

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be either approved or rejected",
      });
    }

    const request = await FacultyRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // An HOD may not approve their own request.
    // Somebody else has to countersign it.
    if (
      request.status === "pending" &&
      normaliseId(request.facultyId) === normaliseId(hodId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You cannot approve or reject your own request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "This request has already been processed",
      });
    }

    // An HOD only action requests from their own
    // department. The list endpoint is already scoped,
    // so this closes the same hole on a direct call
    // with a guessed id.
    //
    // The principal has no department to be scoped to and
    // outranks every HOD, so the check is skipped for them.
    const isPrincipal =
      req.user.role === "faculty" &&
      req.user.isPrincipal === true;

    if (
      !isPrincipal &&
      req.user.role === "faculty" &&
      req.user.isHod === true
    ) {
      const departmentName = String(
        req.user.department || ""
      ).trim();

      if (!departmentName) {
        return res.status(400).json({
          success: false,
          message:
            "Your account has no department set. Contact the admin.",
        });
      }

      if (
        normaliseId(request.department) !==
        normaliseId(departmentName)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only process requests from your own department",
        });
      }
    }

    if (
      status === "rejected" &&
      (!hodRemark || !hodRemark.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A remark is required when rejecting a request",
      });
    }

    request.status = status;
    request.hodRemark = String(hodRemark || "").trim();
    request.actionedBy = hodId;
    request.actionedByName = hodName;
    request.actionedAt = new Date();

    await request.save();

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      request,
    });
  } catch (error) {
    console.error(
      "Update Faculty Request Status Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update request",
    });
  }
};

// CANCEL A PENDING REQUEST (faculty)
const cancelFacultyRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await FacultyRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Ownership is checked against the token on every
    // call. It is never skipped, so nobody can cancel
    // a colleague's request.
    const loggedInId = currentFacultyId(req);

    if (!loggedInId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account has no faculty ID. Contact the admin.",
      });
    }

    if (normaliseId(request.facultyId) !== loggedInId) {
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
    request.hodRemark = "Cancelled by faculty";

    await request.save();

    res.status(200).json({
      success: true,
      message: "Request cancelled",
      request,
    });
  } catch (error) {
    console.error("Cancel Faculty Request Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel request",
    });
  }
};

module.exports = {
  getMyRequests,
  getFacultyRequests,
  getFacultyRequestStats,
  createFacultyRequest,
  updateFacultyRequestStatus,
  cancelFacultyRequest,
};
