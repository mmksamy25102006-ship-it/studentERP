// src/App.jsx

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Components
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./components/Login";

// Pages
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
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

// Context
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

// CSS
import "./index.css";

function DashboardLayout() {

const [sidebarOpen,setSidebarOpen] = React.useState(true);


const user = {

name:"John Doe",

role:"Student"

};
  return (
    <div className="app-container">
<Sidebar

sidebarOpen={sidebarOpen}

setSidebarOpen={setSidebarOpen}

/>

<div className={`main-container ${sidebarOpen ? "expanded" : "collapsed"}`}>
  
<Topbar

sidebarOpen={sidebarOpen}

setSidebarOpen={setSidebarOpen}

user={user}

/>
        <div className="page-container">
          <Routes>
            {/* Student */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/marks" element={<Marks />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/library" element={<Library />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/settings" element={<Settings />} />

            {/* Admin */}
            <Route
              path="/admin-dashboard"
              element={<AdminDashboard />}
            />
            <Route path="/students" element={<Students />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/reports" element={<Reports />} />

            {/* Faculty */}
            <Route
              path="/faculty-dashboard"
              element={<FacultyDashboard />}
            />

            {/* Default */}
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Login */}
              <Route path="/" element={<Login />} />

              {/* Dashboard Layout */}
              <Route path="/*" element={<DashboardLayout />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;