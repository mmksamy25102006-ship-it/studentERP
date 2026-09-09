# 🎓 StudentERP

> A modern, full-stack Student Management and Academic Management System built with React, Node.js, Express.js, and MongoDB.

StudentERP is a web-based ERP platform designed to manage students, faculty, academic activities, attendance, marks, courses, assignments, timetable, notifications, and other student-related operations from a centralized system.

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [User Roles](#-user-roles)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Project Structure](#-project-structure)
- [Frontend](#-frontend)
- [Backend](#-backend)
- [Database](#-database)
- [Authentication](#-authentication)
- [Student Module](#-student-module)
- [Faculty Module](#-faculty-module)
- [Admin Module](#-admin-module)
- [Attendance System](#-attendance-system)
- [Marks System](#-marks-system)
- [Assignment System](#-assignment-system)
- [Timetable System](#-timetable-system)
- [Notification System](#-notification-system)
- [API Endpoints](#-api-endpoints)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Project](#-running-the-project)
- [Build for Production](#-build-for-production)
- [Deployment](#-deployment)
- [GitHub](#-github)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

# 📖 About the Project

StudentERP is a full-stack educational management platform that connects administrators, faculty members, and students.

The system provides separate dashboards and permissions for different users.

### Main objectives

- Manage student information
- Manage faculty information
- Manage courses and subjects
- Manage student attendance
- Manage academic marks
- Manage assignments
- Display timetable
- Display notifications
- Provide student academic information
- Provide faculty management tools
- Provide administrator controls
- Store academic data securely in MongoDB
- Provide a modern responsive user interface

---

# ✨ Features

## 🔐 Authentication

- Login system
- JWT-based authentication
- Protected routes
- Role-based access
- Persistent login using local storage
- Secure password storage
- Separate dashboards for different users

---

## 👨‍🎓 Student Features

Students can access:

- Student Dashboard
- Profile
- Attendance
- Marks
- GPA / CGPA
- Courses
- Assignments
- Timetable
- Notifications
- Academic information

### Student Dashboard

The dashboard provides an overview of:

- Total subjects
- Attendance
- Marks
- Assignments
- Notifications
- Academic information

---

# 👨‍🏫 Faculty Features

Faculty members can manage:

- Students
- Attendance
- Marks
- Assignments
- Courses
- Academic information

### Faculty Attendance

Faculty can:

- Select a class
- Select a subject
- Select a date
- Mark students as Present
- Mark students as Absent
- Save attendance
- Update attendance records

Attendance is stored in MongoDB and displayed on the student's Attendance page.

---

# 👨‍💼 Admin Features

Administrators can manage the overall ERP system.

Admin functionality includes:

- Student management
- Faculty management
- Course management
- User management
- Academic management
- Dashboard statistics
- System-level controls

---

# 👥 User Roles

StudentERP supports three main roles:

| Role | Access |
|------|--------|
| Admin | Complete system management |
| Faculty | Academic and student management |
| Student | Personal academic information |

---

# 🛠 Technology Stack

## Frontend

- React.js
- JavaScript
- Vite
- React Router
- Axios
- React Icons
- CSS
- Framer Motion
- Chart.js

## Backend

- Node.js
- Express.js
- JavaScript
- REST API
- JWT Authentication
- Mongoose

## Database

- MongoDB
- MongoDB Atlas
- MongoDB Compass

## Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Postman
- Docker / Docker Desktop

---

# 🏗 Project Architecture

StudentERP follows a client-server architecture.

```text
                    ┌─────────────────────┐
                    │      StudentERP     │
                    │      Web System     │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼────────┐           ┌────────▼────────┐
        │ React Frontend │           │ Node/Express API│
        │     Vite       │◄─────────►│     Backend     │
        └────────────────┘           └────────┬────────┘
                                              │
                                      ┌───────▼────────┐
                                      │     MongoDB     │
                                      │ Atlas / Local   │
                                      └─────────────────┘


# Project Structure

 StudentERP/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── assets/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/
│   │
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore




src/
│
├── components/
│   ├── Sidebar.jsx
│   ├── Topbar.jsx
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Students.jsx
│   ├── Faculty.jsx
│   ├── Courses.jsx
│   ├── Attendance.jsx
│   ├── Marks.jsx
│   ├── Assignments.jsx
│   ├── Timetable.jsx
│   └── Notifications.jsx
│
├── context/
│   ├── AuthContext.jsx
│   └── NotificationContext.jsx
│
└── api.js

⚛️ React Components


src/
│
├── components/
│   ├── Sidebar.jsx
│   ├── Topbar.jsx
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Students.jsx
│   ├── Faculty.jsx
│   ├── Courses.jsx
│   ├── Attendance.jsx
│   ├── Marks.jsx
│   ├── Assignments.jsx
│   ├── Timetable.jsx
│   └── Notifications.jsx
│
├── context/
│   ├── AuthContext.jsx
│   └── NotificationContext.jsx
│
└── api.js




If your actual login uses **email + password instead of Login ID**, use:

```markdown
# 🔐 Login Credentials

| Role | Email / Login ID | Password |
|------|------------------|----------|
| Admin | admin@example.com | YOUR_ADMIN_PASSWORD |
| Faculty | faculty@example.com | YOUR_FACULTY_PASSWORD |
| Student | student@example.com | YOUR_STUDENT_PASSWORD |






# 👥 Student & Faculty Login Credentials

## 👨‍🎓 Student Users

| Name | Login ID | Password | Role |
|------|----------|----------|------|
| John Doe | STU001 | student123 | Student |
| Rahul Kumar | STU002 | student123 | Student |
| Priya Sharma | STU003 | student123 | Student |
| Arun Kumar | STU004 | student123 | Student |
| Sneha Raj | STU005 | student123 | Student |

### Student Access

Student users can access:

- 📊 Student Dashboard
- 👤 Profile
- 📅 Attendance
- 📈 Marks
- 📚 Courses
- 📝 Assignments
- 🕐 Timetable
- 🔔 Notifications
- 🎓 GPA / CGPA

---

## 👨‍🏫 Faculty Users

| Name | Login ID | Password | Role |
|------|----------|----------|------|
| Dr. Kumar | FAC001 | faculty123 | Faculty |
| Mr. Rajesh | FAC002 | faculty123 | Faculty |
| Ms. Priya | FAC003 | faculty123 | Faculty |
| Mr. Arun | FAC004 | faculty123 | Faculty |
| Ms. Sneha | FAC005 | faculty123 | Faculty |

### Faculty Access

Faculty users can access:

- 📊 Faculty Dashboard
- 👨‍🎓 Student Management
- 📅 Attendance Management
- 📈 Marks Management
- 📝 Assignment Management
- 📚 Course Management
- 🔔 Notifications

---

## 🔐 Login Example

### Student

```text
Login ID: STU001
Password: student123
Role: Student