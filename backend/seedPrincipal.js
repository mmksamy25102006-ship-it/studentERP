// backend/seedPrincipal.js
//
// Creates one Principal account so the principal pages can
// be tried without going through the admin faculty form.
//
// The principal is an ordinary faculty login. There is no
// separate role in the login form, so the account is created
// with role "faculty" plus the isPrincipal flag - the same
// arrangement as the HOD and isHod.
//
// A department is set even though the principal is not tied
// to one: the faculty request endpoints skip the department
// filter whenever isPrincipal is true, but leaving it blank
// would make the admin's faculty form refuse to save the
// account (department is required there).
//
// Run with: node seedPrincipal.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

// Atlas is reached through an SRV record. Some networks,
// usually a router or an ISP resolver, answer SRV queries
// with ECONNREFUSED even though everything else resolves,
// which surfaces as a confusing connection error. When that
// happens the lookup is retried against public resolvers.
const FALLBACK_DNS = ["1.1.1.1", "8.8.8.8"];

async function connect() {
  try {
    return await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    const isDnsFailure =
      error.code === "querySrv" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND";

    if (!isDnsFailure) {
      throw error;
    }

    console.log(
      "The system resolver could not look up the Atlas SRV record."
    );
    console.log("Retrying with public resolvers " + FALLBACK_DNS.join(", "));

    require("dns").setServers(FALLBACK_DNS);

    return mongoose.connect(process.env.MONGO_URI);
  }
}

const PRINCIPAL = {
  name: "Dr. S. Menon",
  email: "principal@gmail.com",
  password: process.env.PRINCIPAL_SEED_PASSWORD || "Principal@12345",
  role: "faculty",
  facultyId: "FAC002",
  department: "Computer Science",
  designation: "Principal",
  experience: "20 years",
  phone: "9876543210",
  isPrincipal: true,
};

async function createPrincipal() {
  try {
    await connect();

    const email = PRINCIPAL.email.toLowerCase().trim();

    const existing = await User.findOne({ email });

    if (existing) {
      // Repairs an account that was seeded earlier without
      // the flag, which would land the principal on the
      // ordinary faculty dashboard.
      existing.name = PRINCIPAL.name;
      existing.facultyId = PRINCIPAL.facultyId;
      existing.department = PRINCIPAL.department;
      existing.designation = PRINCIPAL.designation;
      existing.experience = PRINCIPAL.experience;
      existing.phone = PRINCIPAL.phone;
      existing.isPrincipal = true;
      existing.isActive = true;

      await existing.save();

      console.log("Principal account already existed and was updated.");
    } else {
      const hashed = await bcrypt.hash(PRINCIPAL.password, 10);

      await User.create({
        name: PRINCIPAL.name,
        email,
        password: hashed,
        role: PRINCIPAL.role,
        facultyId: PRINCIPAL.facultyId,
        department: PRINCIPAL.department,
        designation: PRINCIPAL.designation,
        experience: PRINCIPAL.experience,
        phone: PRINCIPAL.phone,
        isPrincipal: true,
        isActive: true,
      });

      console.log("Principal account created.");
    }

    console.log("");
    console.log("Sign in with:");
    console.log("  login page : /");
    console.log("  role       : faculty");
    console.log("  email      : " + email);
    console.log("  password   : " + PRINCIPAL.password);
    console.log("");
    console.log("A principal lands on /principal-dashboard automatically.");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createPrincipal();
