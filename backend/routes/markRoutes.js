const express = require("express");
const router = express.Router();

const Mark = require("../models/Mark");

// ======================================================
// GET ALL MARKS
// GET /api/marks
// ======================================================

router.get("/", async (req, res) => {
  try {
    const marks = await Mark.find().sort({ rollNo: 1 });

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
// GET MARKS FOR ONE STUDENT
// GET /api/marks/student/:rollNo
// ======================================================

router.get("/student/:rollNo", async (req, res) => {
  try {
    const { rollNo } = req.params;

    const marks = await Mark.findOne({
      rollNo: rollNo.trim(),
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
// CREATE / UPDATE MARKS
// PUT /api/marks/:rollNo
// ======================================================

router.put("/:rollNo", async (req, res) => {
  try {

    const { rollNo } = req.params;

    console.log("=================================");
    console.log("UPDATE MARKS REQUEST");
    console.log("Roll No:", rollNo);
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log("=================================");


    const {
      name,
      semester,
      subjects,
      overallCGPA,
      predictedRank,
    } = req.body;


    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    if (!rollNo) {
      return res.status(400).json({
        success: false,
        message: "Roll number is required",
      });
    }

    if (!name) {
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


    // -----------------------------------------------
    // Update / Create
    // -----------------------------------------------

    const updatedMarks =
      await Mark.findOneAndUpdate(
        {
          rollNo: rollNo.trim(),
        },

        {
          $set: {
            rollNo: rollNo.trim(),
            name,
            semester: semester || "Semester I",
            subjects,
            overallCGPA:
              Number(overallCGPA) || 0,
            predictedRank:
              Number(predictedRank) || 0,
          },
        },

        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );


    console.log(
      "MARKS SAVED:",
      updatedMarks
    );


    res.status(200).json({
      success: true,
      message: "Marks updated successfully",
      marks: updatedMarks,
    });


  } catch (error) {

    console.error(
      "================================="
    );

    console.error(
      "UPDATE MARKS ERROR:"
    );

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
// ======================================================

router.delete("/:rollNo", async (req, res) => {
  try {

    const { rollNo } = req.params;

    const deleted =
      await Mark.findOneAndDelete({
        rollNo: rollNo.trim(),
      });

    if (!deleted) {
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

    console.error(
      "DELETE MARKS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete marks",
      error: error.message,
    });
  }
});


module.exports = router;