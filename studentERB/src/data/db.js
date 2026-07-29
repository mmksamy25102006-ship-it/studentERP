// src/data/db.js

export const student = {
  id: "STU2026001",
  name: "John Doe",
  email: "john@example.com",
  department: "Computer Science",
  year: "III Year",
  section: "A",
  rollNo: "21CS001",
  phone: "+91 9876543210",
  address: "Chennai, Tamil Nadu",
  cgpa: 8.74,
  attendance: 92,
};

export const attendance = [
  { subject: "DBMS", percentage: 95 },
  { subject: "Operating System", percentage: 91 },
  { subject: "Computer Networks", percentage: 94 },
  { subject: "Java", percentage: 96 },
  { subject: "Software Engineering", percentage: 90 },
  { subject: "Mathematics", percentage: 87 },
];

export const marks = [
  { subject: "DBMS", internal: 46, external: 82, total: 128, grade: "A+" },
  { subject: "Operating System", internal: 44, external: 80, total: 124, grade: "A" },
  { subject: "Java", internal: 48, external: 88, total: 136, grade: "O" },
  { subject: "Computer Networks", internal: 45, external: 81, total: 126, grade: "A+" },
  { subject: "Software Engineering", internal: 43, external: 79, total: 122, grade: "A" },
];

export const timetable = [
  {
    day: "Monday",
    periods: [
      "DBMS",
      "Operating System",
      "Break",
      "Computer Networks",
      "Java",
      "Lab",
    ],
  },
  {
    day: "Tuesday",
    periods: [
      "Java",
      "DBMS",
      "Break",
      "Software Engineering",
      "Mathematics",
      "Lab",
    ],
  },
  {
    day: "Wednesday",
    periods: [
      "Computer Networks",
      "Java",
      "Break",
      "DBMS",
      "Operating System",
      "Seminar",
    ],
  },
  {
    day: "Thursday",
    periods: [
      "Mathematics",
      "DBMS",
      "Break",
      "Java",
      "Software Engineering",
      "Library",
    ],
  },
  {
    day: "Friday",
    periods: [
      "Operating System",
      "Computer Networks",
      "Break",
      "Java Lab",
      "Project",
      "Sports",
    ],
  },
];

export const fees = {
  total: 75000,
  paid: 50000,
  pending: 25000,
  dueDate: "30 July 2026",
};

export const notices = [
  {
    id: 1,
    title: "Semester Examination",
    description: "Semester exams begin on 15 December 2026.",
    date: "12 Jul 2026",
  },
  {
    id: 2,
    title: "Placement Drive",
    description: "VinFast campus recruitment starts next week.",
    date: "18 Jul 2026",
  },
  {
    id: 3,
    title: "Holiday",
    description: "College will remain closed on Independence Day.",
    date: "22 Jul 2026",
  },
];

export const libraryBooks = [
  {
    id: 1,
    title: "Database Management System",
    author: "Korth",
    status: "Borrowed",
  },
  {
    id: 2,
    title: "Operating System Concepts",
    author: "Silberschatz",
    status: "Available",
  },
  {
    id: 3,
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    status: "Borrowed",
  },
];

export const dashboardCards = [
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
    title: "Pending Fees",
    value: "₹25,000",
    color: "#E91E63",
  },
  {
    title: "Notifications",
    value: "8",
    color: "#9C27B0",
  },
];

export const weather = {
  city: "Chennai",
  temperature: 32,
  condition: "Partly Cloudy",
  humidity: 74,
  wind: 14,
};

export const users = [
  {
    id: 1,
    name: "John Doe",
    role: "Student",
    email: "john@example.com",
  },
  {
    id: 2,
    name: "Dr. Kumar",
    role: "Faculty",
    email: "kumar@college.edu",
  },
  {
    id: 3,
    name: "Administrator",
    role: "Admin",
    email: "admin@college.edu",
  },
];