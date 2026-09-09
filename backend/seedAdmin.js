const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createDefaultUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = [
      {
        name: "Admin",
        email: "admin@gmail.com",
        password: "admin123",
        role: "admin",
      },
      {
        name: "Faculty",
        email: "faculty@gmail.com",
        password: "faculty123",
        role: "faculty",
      },
      {
        name: "Student",
        email: "student@gmail.com",
        password: "student123",
        role: "student",
      },
    ];

    for (const userData of users) {
      const existing = await User.findOne({ email: userData.email });

      if (!existing) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
        });

        console.log(`✅ ${userData.role} created successfully`);
      } else {
        console.log(`ℹ️ ${userData.role} already exists`);
      }
    }

    console.log("🎉 Default users created.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createDefaultUsers();