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
import Requests from "./pages/Requests";
import Settings from "./pages/Settings";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Students from "./pages/Students";
import Faculty from "./pages/Faculty";
import Courses from "./pages/Courses";
import Reports from "./pages/Reports";
import StudentProfile from "./pages/StudentProfile";
import Profile from "./pages/Profile";

// Faculty
import MyClasses from "./pages/faculty/MyClasses";
import FacultyAttendance from "./pages/faculty/FacultyAttendance";
import FacultyMarks from "./pages/faculty/FacultyMarks";
import FacultyAssignments from "./pages/faculty/FacultyAssignments";
import FacultyTimetable from "./pages/faculty/FacultyTimetable";
import FacultyNotification from "./pages/faculty/FacultyNotification";
import FacultyProfile from "./pages/FacultyProfile";
import FacultyLibrary from "./pages/faculty/FacultyLibrary";
import FacultyRequests from "./pages/faculty/FacultyRequests";
import FacultyLeave from "./pages/faculty/FacultyLeave";

// Head of Department
// The HOD is a faculty member with the isHod flag, so
// these sit next to the faculty pages.
import HodDashboard from "./pages/hod/HodDashboard";
import HodFacultyRequests from "./pages/hod/HodFacultyRequests";
import HodStudentRequests from "./pages/hod/HodStudentRequests";
import HodDepartment from "./pages/hod/HodDepartment";

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
// HOD ONLY
//
// The backend already rejects non HOD calls on the HOD
// endpoints. This guard only stops the page from
// rendering for the wrong role, so the user is sent
// back to their own dashboard instead of an error
// screen.
// =====================================================

function HodOnly({ children }) {
  const { user } = useAuth();

  // An admin is admitted because an HOD cannot approve
  // their own leave, which leaves the admin as the only
  // countersigner. The isHod middleware on the server
  // already permits this.
  if (user?.isHod || user?.role === "admin") {
    return children;
  }

  return (
    <Navigate
      to={
        user?.role === "faculty"
          ? "/faculty-dashboard"
          : "/dashboard"
      }
      replace
    />
  );
}


// =====================================================
// ROLE GUARDS
//
// DashboardLayout only checks that someone is signed in,
// not which role they have. Without these wrappers a
// student could navigate straight to /adminstudents,
// /adminfaculty, /faculty/marks and so on. The page would
// render and any new API query would fail on the backend's
// role check, but the layout and admin UI should not even
// appear for the wrong role. Each wrapper bounces the user
// to the landing page of their own role instead.
// =====================================================

function RequireRole({ roles, children }) {
  const { user } = useAuth();

  if (user && roles.includes(user.role)) {
    return children;
  }

  const fallback =
    user?.role === "admin"
      ? "/admin-dashboard"
      : user?.role === "faculty"
        ? user?.isHod
          ? "/hod-dashboard"
          : "/faculty-dashboard"
        : user?.role === "student"
          ? "/dashboard"
          : "/";

  return <Navigate to={fallback} replace />;
}

function AdminOnly({ children }) {
  return <RequireRole roles={["admin"]}>{children}</RequireRole>;
}

function FacultyOnly({ children }) {
  // The HOD is a faculty member, so "faculty" covers both.
  return (
    <RequireRole roles={["faculty"]}>{children}</RequireRole>
  );
}

function StudentOnly({ children }) {
  return (
    <RequireRole roles={["student"]}>{children}</RequireRole>
  );
}

// Any signed-in user may open a profile page reached from
// a QR code. It just must not be open to the anonymous
// public, which is what the current route does.
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return children;
  }

  return <Navigate to="/" replace />;
}


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
              element={
                <StudentOnly>
                  <Dashboard />
                </StudentOnly>
              }
            />
<Route
              path="/profile"
              element={
                <StudentOnly>
                  <Profile />
                </StudentOnly>
              }
            />
            <Route
              path="/attendance"
              element={
                <StudentOnly>
                  <Attendance />
                </StudentOnly>
              }
            />

            <Route
              path="/marks"
              element={
                <StudentOnly>
                  <Marks />
                </StudentOnly>
              }
            />

            <Route
              path="/assignments"
              element={
                <StudentOnly>
                  <Assignments />
                </StudentOnly>
              }
            />

            <Route
              path="/prediction"
              element={
                <StudentOnly>
                  <Prediction />
                </StudentOnly>
              }
            />

            <Route
              path="/studenttimetable"
              element={
                <StudentOnly>
                  <TimetablePage />
                </StudentOnly>
              }
            />

            <Route
              path="/fees"
              element={
                <StudentOnly>
                  <Fees />
                </StudentOnly>
              }
            />

            <Route
              path="/library"
              element={
                <StudentOnly>
                  <Library />
                </StudentOnly>
              }
            />

            <Route
              path="/notices"
              element={
                <StudentOnly>
                  <Notices />
                </StudentOnly>
              }
            />

            <Route
              path="/requests"
              element={
                <StudentOnly>
                  <Requests />
                </StudentOnly>
              }
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
              element={
                <FacultyOnly>
                  <FacultyTimetable />
                </FacultyOnly>
              }
            />

            <Route
              path="/faculty/notices"
              element={
                <FacultyOnly>
                  <FacultyNotification />
                </FacultyOnly>
              }
            />

            {/* =========================================
                ADMIN
            ========================================= */}

            <Route
              path="/adminexams"
              element={
                <AdminOnly>
                  <Exams />
                </AdminOnly>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <AdminOnly>
                  <AdminDashboard />
                </AdminOnly>
              }
            />

            <Route
              path="/admin/departments"
              element={
                <AdminOnly>
                  <Department />
                </AdminOnly>
              }
            />

            <Route
              path="/admin/results"
              element={
                <AdminOnly>
                  <Result />
                </AdminOnly>
              }
            />

            <Route
              path="/admin/fees"
              element={
                <AdminOnly>
                  <AdminFees />
                </AdminOnly>
              }
            />

            <Route
              path="/adminstudents"
              element={
                <AdminOnly>
                  <Students />
                </AdminOnly>
              }
            />

            <Route
              path="/adminfaculty"
              element={
                <AdminOnly>
                  <Faculty />
                </AdminOnly>
              }
            />

            <Route
              path="/admincourses"
              element={
                <AdminOnly>
                  <Courses />
                </AdminOnly>
              }
            />

            <Route
              path="/adminreports"
              element={
                <AdminOnly>
                  <Reports />
                </AdminOnly>
              }
            />

            {/* =========================================
                FACULTY
            ========================================= */}

            <Route
              path="/faculty-dashboard"
              element={
                <FacultyOnly>
                  <FacultyDashboard />
                </FacultyOnly>
              }
            />

            <Route
              path="/faculty/classes"
              element={
                <FacultyOnly>
                  <MyClasses />
                </FacultyOnly>
              }
            />

            <Route
              path="/faculty/attendance"
              element={
                <FacultyOnly>
                  <FacultyAttendance />
                </FacultyOnly>
              }
            />

            <Route
              path="/faculty/marks"
              element={
                <FacultyOnly>
                  <FacultyMarks />
                </FacultyOnly>
              }
            />

            <Route
              path="/faculty/assignments"
              element={
                <FacultyOnly>
                  <FacultyAssignments />
                </FacultyOnly>
              }
            />

            <Route
              path="/faculty/profile"
              element={
                <FacultyOnly>
                  <FacultyProfile />
                </FacultyOnly>
              }
            />

            <Route
              path="/faculty/library"
              element={
                <FacultyOnly>
                  <FacultyLibrary />
                </FacultyOnly>
              }
            />

            <Route
              path="/faculty/requests"
              element={
                <FacultyOnly>
                  <FacultyRequests />
                </FacultyOnly>
              }
            />

            <Route
              path="/faculty/myleave"
              element={
                <FacultyOnly>
                  <FacultyLeave />
                </FacultyOnly>
              }
            />

            {/* =========================================
                HEAD OF DEPARTMENT
            ========================================= */}

            <Route
              path="/hod-dashboard"
              element={
                <HodOnly>
                  <HodDashboard />
                </HodOnly>
              }
            />

            <Route
              path="/hod/faculty-requests"
              element={
                <HodOnly>
                  <HodFacultyRequests />
                </HodOnly>
              }
            />

            <Route
              path="/hod/student-requests"
              element={
                <HodOnly>
                  <HodStudentRequests />
                </HodOnly>
              }
            />

            <Route
              path="/hod/department"
              element={
                <HodOnly>
                  <HodDepartment />
                </HodOnly>
              }
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
                    to={
                      user?.isHod
                        ? "/hod-dashboard"
                        : "/faculty-dashboard"
                    }
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

<BrowserRouter basename="/studentERP">

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
              <Route
                path="/student/:studentId"
                element={
                  <RequireAuth>
                    <StudentProfile />
                  </RequireAuth>
                }
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
