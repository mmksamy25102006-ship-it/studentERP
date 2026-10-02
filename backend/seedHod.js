// backend/seedHod.js
//
// Creates one Head of Department account so the HOD pages
// can be tried without going through the admin faculty form.
//
// The HOD is an ordinary faculty login. There is no separate
// HOD role in the login form, so the account is created with
// role "faculty" plus the isHod flag.
//
// department and facultyId are required. The HOD endpoints
// fail closed when the account has no department, so a seed
// without one would see nothing on every page.
//
// Run with: node seedHod.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

const HOD = {
  name: "Dr. Anita Sharma",
  email: "hod@gmail.com",
  password: process.env.HOD_SEED_PASSWORD || "Hod@12345",
  role: "faculty",
  facultyId: "FAC001",
  department: "Computer Science",
  designation: "Professor & Head of Department",
  experience: "12 years",
  year: "",
  phone: "9876543210",
  isHod: true,
};

async function createHod() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = HOD.email.toLowerCase().trim();

    const existing = await User.findOne({ email });

    if (existing) {
      // Repairs an account that was seeded earlier without
      // the flag or the department, which would leave the HOD
      // pages empty.
      existing.name = HOD.name;
      existing.facultyId = HOD.facultyId;
      existing.department = HOD.department;
      existing.designation = HOD.designation;
      existing.experience = HOD.experience;
      existing.phone = HOD.phone;
      existing.isHod = true;
      existing.isActive = true;

      await existing.save();

      console.log("HOD account already existed and was updated.");
    } else {
      const hashed = await bcrypt.hash(HOD.password, 10);

      await User.create({
        name: HOD.name,
        email,
        password: hashed,
        role: HOD.role,
        facultyId: HOD.facultyId,
        department: HOD.department,
        designation: HOD.designation,
        experience: HOD.experience,
        year: HOD.year,
        phone: HOD.phone,
        isHod: true,
        isActive: true,
      });

      console.log("HOD account created.");
    }

    console.log("");
    console.log("Sign in with:");
    console.log("  login page : /");
    console.log("  role       : faculty");
    console.log("  email      : " + email);
    console.log("  password   : " + HOD.password);
    console.log("");
    console.log("An HOD lands on /hod-dashboard automatically.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createHod();
