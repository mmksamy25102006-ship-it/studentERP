// backend/server.js

const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load Environment Variables
dotenv.config();

// Database Connection
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const markRoutes = require("./routes/markRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");

// New routes for multi-user ERP
const attendanceRoutes = require("./routes/attendanceRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const facultySubjectRoutes = require("./routes/facultySubjectRoutes");
const feeRoutes = require("./routes/feeRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const requestRoutes = require("./routes/requestRoutes");
const facultyRequestRoutes = require("./routes/facultyRequestRoutes");
// Initialize Express
const app = express();

// Connect Database
connectDB();

// Middleware

// CORS is restricted to the deployed frontend and local
// development. A fully open Origin header lets any website
// send state-changing requests authenticated with a stolen
// token.
const allowedOrigins = [
  "https://mmksamy25102006-ship-it.github.io",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, Postman, the Render
      // health check) send no Origin header and are allowed.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to NEXUS ERP Backend API",
  });
});

// =========================
// API Routes
// =========================
app.get("/api/test-deployment", (req, res) => {
  res.json({
    success: true,
    message: "Latest StudentERP backend is running",
    version:
      process.env.RENDER_GIT_COMMIT ||
      process.env.COMMIT_REF ||
      "local",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/marks", markRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/faculty", facultyRoutes);
// Attendance API
app.use("/api/attendance", attendanceRoutes);

// Assignment API
app.use("/api/assignments", assignmentRoutes);
app.use("/api/faculty-subjects", facultySubjectRoutes);
app.use("/api/fees", feeRoutes);

// Library API
app.use("/api/library", libraryRoutes);

// Leave / Bonafide requests
app.use("/api/requests", requestRoutes);

// Faculty leave / permission requests, approved by the HOD
app.use(
  "/api/faculty-requests",
  facultyRequestRoutes
);

// =========================
// 404 Route
// =========================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// =========================
// Global Error Handler
// =========================

app.use((err, req, res, _next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// =========================
// Start Server
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
// Render deployment refresh
