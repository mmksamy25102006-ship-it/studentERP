const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");

const {
  verifyToken,
  isAdmin,
  isFacultyOrAdmin,
  isHod,
} = require("../middleware/authMiddleware");

// Produces a 12 character password with at least one from
// each class: upper, lower, digit and special. Used when
// the admin creates a faculty account without a password.
const randomFacultyPassword = () => {
  const pools = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnpqrstuvwxyz",
    "23456789",
    "!@#$%",
  ];

  const all = pools.join("");

  const pick = (set) =>
    set[Math.floor(Math.random() * set.length)];

  const password = Array.from({ length: 12 }).fill(null);

  // Guarantee one character from each class...
  pools.forEach((pool, index) => {
    password[index] = pick(pool);
  });

  // ...then fill the rest from the full alphabet.
  for (let i = pools.length; i < password.length; i++) {
    password[i] = pick(all);
  }

  return password.join("");
};

// =====================================================
// GET ALL FACULTY
// =====================================================

router.get(
  "/",
  verifyToken,
  isFacultyOrAdmin,
  async (req, res) => {
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
    });
  }
});

// =====================================================
// GET MY DEPARTMENT FACULTY
//
// The HOD sees only their own department. The value is
// read from the token rather than the query string, so
// it cannot be widened to another department.
// =====================================================

router.get(
  "/department/mine",
  verifyToken,
  isHod,
  async (req, res) => {
  try {
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

    const faculty = await User.find({
      role: "faculty",
      department: departmentName,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(faculty);
  } catch (error) {
    console.error("Get Department Faculty Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch department faculty",
    });
  }
});

// =====================================================
// GET FACULTY BY FACULTY ID
// =====================================================

router.get(
  "/:facultyId",
  verifyToken,
  isFacultyOrAdmin,
  async (req, res) => {
  try {
    const facultyId = req.params.facultyId.trim();

    const faculty = await User.findOne({
      role: "faculty",
      facultyId: new RegExp(
        `^${facultyId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i"
      ),
    }).select("-password");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    res.status(200).json({
      success: true,
      faculty,
    });
  } catch (error) {
    console.error("Get Faculty By ID Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch faculty",
    });
  }
});

// =====================================================
// CREATE FACULTY
// =====================================================

router.post(
  "/",
  verifyToken,
  isAdmin,
  async (req, res) => {
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
      isHod,
      isPrincipal,
    } = req.body;

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

    // The previous default of "Faculty@123" was a known
    // value, the same for every account, and it is not in
    // this codebase's seed data. A guessed faculty email
    // plus that well-known password would sign straight in.
    // If the admin does not supply a password, generate a
    // random one and hand it back once in the response so
    // they can pass it to the faculty member.
    const generatedPassword =
      !password || !String(password).trim()
        ? randomFacultyPassword()
        : String(password).trim();

    // Hash password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

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

      // Marks this account as Head of Department
      isHod: isHod === true,

      // Marks this account as the Principal. Same pattern
      // as isHod: a flag on a faculty login, no new role.
      isPrincipal: isPrincipal === true,

      isActive: true,
    });

    const facultyResponse = faculty.toObject();

    delete facultyResponse.password;

    res.status(201).json({
      success: true,
      message: "Faculty created successfully",
      faculty: facultyResponse,

      // Only ever returned once, at creation time, and only
      // when the admin did not supply a password. It is
      // deliberately absent on every read/update call.
      ...(generatedPassword
        ? { temporaryPassword: generatedPassword }
        : {}),
    });
  } catch (error) {
    console.error("Create Faculty Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create faculty",
    });
  }
});

// =====================================================
// UPDATE MY OWN PROFILE
//
// A faculty member may correct their own contact details.
// Everything that defines who they are inside the college
// - faculty ID, email, department, designation and the
// isHod / isPrincipal flags - stays behind the admin route
// below, so none of those fields are read here.
//
// Registered ahead of PUT /:id on purpose: Express matches
// in declaration order and "me" would otherwise be read as
// an id and rejected by isAdmin.
// =====================================================

router.put(
  "/me",
  verifyToken,
  isFacultyOrAdmin,
  async (req, res) => {
  try {
    const faculty = await User.findOne({
      _id: req.user._id,
      role: "faculty",
    });

    if (!faculty) {
      return res.status(403).json({
        success: false,
        message: "Faculty access only.",
      });
    }

    const { name, phone, experience } = req.body;

    if (name !== undefined) {
      const cleanName = String(name).trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      faculty.name = cleanName;
    }

    if (phone !== undefined) {
      faculty.phone = String(phone).trim();
    }

    if (experience !== undefined) {
      faculty.experience = String(experience).trim();
    }

    await faculty.save();

    const facultyResponse = faculty.toObject();

    delete facultyResponse.password;

    res.json({
      success: true,
      message: "Profile updated successfully",
      faculty: facultyResponse,
    });
  } catch (error) {
    console.error("Update Own Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

// =====================================================
// UPDATE FACULTY
// =====================================================

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  async (req, res) => {
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
      isHod,
      isPrincipal,
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

    // Promote or demote this account as Head of
    // Department. Only an admin reaches this route.
    if (isHod !== undefined) {
      faculty.isHod = isHod === true;
    }

    // Same for the Principal. Leaving the field out of the
    // body leaves the flag alone, so an edit that does not
    // touch it cannot quietly demote the principal.
    if (isPrincipal !== undefined) {
      faculty.isPrincipal = isPrincipal === true;
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
    });
  }
});

// =====================================================
// DELETE FACULTY
// =====================================================

router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  async (req, res) => {
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
    });
  }
});

module.exports = router;