// src/utils/constants.js

// ===========================================
// App Information
// ===========================================

export const APP_NAME = "Nexus ERP";

export const APP_VERSION = "1.0.0";

export const COMPANY_NAME = "Nexus College";

export const API_BASE_URL = "http://localhost:5000/api";


// ===========================================
// Roles
// ===========================================

export const USER_ROLES = {
  ADMIN: "admin",
  FACULTY: "faculty",
  STUDENT: "student",
};


// ===========================================
// Attendance
// ===========================================

export const ATTENDANCE_STATUS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LEAVE: "Leave",
};


// ===========================================
// Theme
// ===========================================

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};


// ===========================================
// Notification Types
// ===========================================

export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};


// ===========================================
// Routes
// ===========================================

export const ROUTES = {
  LOGIN: "/",

  DASHBOARD: "/dashboard",

  ATTENDANCE: "/attendance",

  MARKS: "/marks",

  PREDICTION: "/prediction",

  TIMETABLE: "/timetable",

  EXAMS: "/exams",

  FEES: "/fees",

  LIBRARY: "/library",

  NOTICES: "/notices",

  SETTINGS: "/settings",

  STUDENTS: "/students",

  FACULTY: "/faculty",

  COURSES: "/courses",

  REPORTS: "/reports",

  ADMIN_DASHBOARD: "/admin-dashboard",

  FACULTY_DASHBOARD: "/faculty-dashboard",
};


// ===========================================
// Local Storage Keys
// ===========================================

export const STORAGE_KEYS = {
  TOKEN: "token",

  USER: "user",

  THEME: "theme",
};


// ===========================================
// Default Dashboard Cards
// ===========================================

export const DASHBOARD_STATS = [

  {
    title: "Attendance",
    value: "92%",
    color: "#4CAF50",
  },

  {
    title: "CGPA",
    value: "8.74",
    color: "#3F51B5",
  },

  {
    title: "Courses",
    value: "6",
    color: "#FF9800",
  },

  {
    title: "Fees Pending",
    value: "₹25,000",
    color: "#E91E63",
  },

];


// ===========================================
// Semester List
// ===========================================

export const SEMESTERS = [

  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",

];


// ===========================================
// Departments
// ===========================================

export const DEPARTMENTS = [

  "Computer Science",

  "Information Technology",

  "Electronics",

  "Mechanical",

  "Civil",

  "Electrical",

  "Artificial Intelligence",

  "Data Science",

];


// ===========================================
// Default Profile Image
// ===========================================

export const DEFAULT_PROFILE =
  "/images/default-profile.png";


// ===========================================
// Pagination
// ===========================================

export const PAGE_SIZE = 10;


// ===========================================
// Loader Delay
// ===========================================

export const LOADER_TIME = 1000;