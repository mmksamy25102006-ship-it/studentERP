import React from "react";
import { useAuth } from "./context/AuthContext";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Components
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./components/Login";
import AdminLogin from "./components/AdminLogin";

// Pages
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Assignments from "./pages/Assignments";
import Marks from "./pages/Marks";
import Prediction from "./pages/Prediction";
import TimetablePage from "./pages/TimetablePage";
import Exams from "./pages/Exams";
import Fees from "./pages/Fees";
import Library from "./pages/Library";
import Notices from "./pages/Notices";
import Settings from "./pages/Settings";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Students";
import Faculty from "./pages/Faculty";
import Courses from "./pages/Courses";
import Reports from "./pages/Reports";

// Faculty
import MyClasses from "./pages/faculty/MyClasses";
import FacultyAttendance from "./pages/faculty/FacultyAttendance";
import FacultyMarks from "./pages/faculty/FacultyMarks";
import FacultyAssignments from "./pages/faculty/FacultyAssignments";
import FacultyTimetable from "./pages/faculty/FacultyTimetable";
import FacultyNotification from "./pages/faculty/FacultyNotification";

// Admin
import Department from "./pages/admin/Department";
import Result from "./pages/admin/Result";
import AdminFees from "./pages/admin/Fees";

// Context
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

// CSS
import "./index.css";


// =====================================================
// DASHBOARD LAYOUT
// =====================================================

function DashboardLayout() {
  // ONE SIDEBAR STATE FOR THE ENTIRE ERP
  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");

    if (saved === null) {
      return true;
    }

    return saved !== "true";
  });

  const { user, loading, isAuthenticated } = useAuth();

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return <div>Loading...</div>;
  }

  // ===================================================
  // AUTHENTICATION
  // ===================================================

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // ===================================================
  // SIDEBAR TOGGLE
  // ===================================================

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => {
      const newValue = !prev;

      // Save collapsed state
      localStorage.setItem(
        "sidebarCollapsed",
        String(!newValue)
      );

      return newValue;
    });
  };

  // ===================================================
  // LAYOUT
  // ===================================================

  return (
    <div className="app-container">

      {/* ===============================================
          SIDEBAR
      =============================================== */}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* ===============================================
          MAIN CONTAINER
      =============================================== */}

      <div
        className={`main-container ${
          sidebarOpen ? "expanded" : "collapsed"
        }`}
      >

        {/* =============================================
            TOPBAR
        ============================================= */}

        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
        />

        {/* =============================================
            PAGE CONTAINER
        ============================================= */}

        <div className="page-container">

          <Routes>

            {/* =========================================
                STUDENT
            ========================================= */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/attendance"
              element={<Attendance />}
            />

            <Route
              path="/marks"
              element={<Marks />}
            />

            <Route
              path="/assignments"
              element={<Assignments />}
            />

            <Route
              path="/prediction"
              element={<Prediction />}
            />

            <Route
              path="/studenttimetable"
              element={<TimetablePage />}
            />

            <Route
              path="/fees"
              element={<Fees />}
            />

            <Route
              path="/library"
              element={<Library />}
            />

            <Route
              path="/notices"
              element={<Notices />}
            />

            {/* =========================================
                SETTINGS
            ========================================= */}

            <Route
              path="/settings"
              element={
                <Settings
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
              }
            />

            {/* =========================================
                FACULTY TIMETABLE / NOTICES
            ========================================= */}

            <Route
              path="/faculty/timetable"
              element={<FacultyTimetable />}
            />

            <Route
              path="/faculty/notices"
              element={<FacultyNotification />}
            />

            {/* =========================================
                ADMIN
            ========================================= */}

            <Route
              path="/adminexams"
              element={<Exams />}
            />

            <Route
              path="/admin-dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/departments"
              element={<Department />}
            />

            <Route
              path="/admin/results"
              element={<Result />}
            />

            <Route
              path="/admin/fees"
              element={<AdminFees />}
            />

            <Route
              path="/adminstudents"
              element={<Students />}
            />

            <Route
              path="/adminfaculty"
              element={<Faculty />}
            />

            <Route
              path="/admincourses"
              element={<Courses />}
            />

            <Route
              path="/adminreports"
              element={<Reports />}
            />

            {/* =========================================
                FACULTY
            ========================================= */}

            <Route
              path="/faculty-dashboard"
              element={<FacultyDashboard />}
            />

            <Route
              path="/faculty/classes"
              element={<MyClasses />}
            />

            <Route
              path="/faculty/attendance"
              element={<FacultyAttendance />}
            />

            <Route
              path="/faculty/marks"
              element={<FacultyMarks />}
            />

            <Route
              path="/faculty/assignments"
              element={<FacultyAssignments />}
            />

            {/* =========================================
                DEFAULT
            ========================================= */}

            <Route
              path="*"
              element={
                user?.role === "admin" ? (
                  <Navigate
                    to="/admin-dashboard"
                    replace
                  />
                ) : user?.role === "faculty" ? (
                  <Navigate
                    to="/faculty-dashboard"
                    replace
                  />
                ) : user?.role === "student" ? (
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                ) : (
                  <Navigate
                    to="/"
                    replace
                  />
                )
              }
            />

          </Routes>

        </div>
      </div>
    </div>
  );
}


// =====================================================
// APP
// =====================================================

function App() {
  return (
    <ThemeProvider>

      <AuthProvider>

        <NotificationProvider>

          <BrowserRouter>

            <Routes>

              {/* =========================================
                  LOGIN
              ========================================= */}

              <Route
                path="/"
                element={<Login />}
              />

              <Route
                path="/admin-login"
                element={<AdminLogin />}
              />

              {/* =========================================
                  DASHBOARD LAYOUT
              ========================================= */}

              <Route
                path="/*"
                element={<DashboardLayout />}
              />

            </Routes>

          </BrowserRouter>

        </NotificationProvider>

      </AuthProvider>

    </ThemeProvider>
  );
}

export default App;