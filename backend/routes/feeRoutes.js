const express = require("express");
const router = express.Router();

const Fee = require("../models/Fee");

const {
  verifyToken,
  isAdmin,
  isFacultyOrAdmin,
} = require("../middleware/authMiddleware");

// =====================================================
// GET FEES
//
// Faculty and admin see every record. A student only
// ever receives their own, filtered here on the server
// rather than in the browser.
// =====================================================

router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "student") {
      const studentId = String(
        req.user.studentId || ""
      )
        .trim()
        .toUpperCase();

      if (!studentId) {
        return res.status(403).json({
          success: false,
          message:
            "Your account has no student ID. Contact the admin.",
        });
      }

      filter.regNo = studentId;
    }

    const fees = await Fee.find(filter).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      fees,
    });
  } catch (error) {
    console.error("Get Fees Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch fees",
    });
  }
});

// =====================================================
// CREATE FEE
// =====================================================

router.post(
  "/",
  verifyToken,
  isAdmin,
  async (req, res) => {
  try {
    const {
      regNo,
      name,
      department,
      semester,
      totalFee,
      paidFee,
    } = req.body;

    if (
      !regNo ||
      !name ||
      !department ||
      !semester ||
      totalFee === undefined ||
      paidFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const total = Number(totalFee);
    const paid = Number(paidFee);

    if (Number.isNaN(total) || Number.isNaN(paid)) {
      return res.status(400).json({
        success: false,
        message: "Fee amounts must be numbers",
      });
    }

    if (total < 0 || paid < 0) {
      return res.status(400).json({
        success: false,
        message: "Fee amounts cannot be negative",
      });
    }

    if (paid > total) {
      return res.status(400).json({
        success: false,
        message: "Paid fee cannot be greater than total fee",
      });
    }

    const pending = total - paid;

    let status = "Paid";

    if (paid === 0) {
      status = "Unpaid";
    } else if (pending > 0) {
      status = "Partial";
    }

    const fee = await Fee.create({
      regNo: regNo.trim(),
      name: name.trim(),
      department: department.trim(),
      semester: semester.trim(),
      totalFee: total,
      paidFee: paid,
      pendingFee: pending,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Fee added successfully",
      fee,
    });
  } catch (error) {
    console.error("Create Fee Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create fee",
    });
  }
});

// =====================================================
// UPDATE FEE
// =====================================================

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  async (req, res) => {
  try {
    const {
      regNo,
      name,
      department,
      semester,
      totalFee,
      paidFee,
    } = req.body;

    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    const total = Number(totalFee);
    const paid = Number(paidFee);

    if (Number.isNaN(total) || Number.isNaN(paid)) {
      return res.status(400).json({
        success: false,
        message: "Fee amounts must be numbers",
      });
    }

    if (total < 0 || paid < 0) {
      return res.status(400).json({
        success: false,
        message: "Fee amounts cannot be negative",
      });
    }

    if (paid > total) {
      return res.status(400).json({
        success: false,
        message: "Paid fee cannot be greater than total fee",
      });
    }

    const pending = total - paid;

    let status = "Paid";

    if (paid === 0) {
      status = "Unpaid";
    } else if (pending > 0) {
      status = "Partial";
    }

    fee.regNo = regNo.trim();
    fee.name = name.trim();
    fee.department = department.trim();
    fee.semester = semester.trim();
    fee.totalFee = total;
    fee.paidFee = paid;
    fee.pendingFee = pending;
    fee.status = status;

    await fee.save();

    res.json({
      success: true,
      message: "Fee updated successfully",
      fee,
    });
  } catch (error) {
    console.error("Update Fee Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update fee",
    });
  }
});

// =====================================================
// DELETE FEE
// =====================================================

router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: "Fee record not found",
      });
    }

    await Fee.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Fee deleted successfully",
    });
  } catch (error) {
    console.error("Delete Fee Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete fee",
    });
  }
});

module.exports = router;