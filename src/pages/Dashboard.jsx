// src/pages/Dashboard.jsx

import React from "react";

import DashboardCards from "../components/DashboardCards";
import AttendanceChart from "../components/AttendanceChart";
import GPAChart from "../components/GPAChart";
import Timetable from "../components/Timetable";
import Notification from "../components/Notification";
import WeatherCard from "../components/WeatherCard";
import Calendar from "../components/Calendar";
import QRCodeCard from "../components/QRCodeCard";
import ChatBot from "../components/ChatBot";

import "./Dashboard.css";

const Dashboard = () => {
  return (
<div className="dashboard-page">

  {/* Welcome Banner */}

  <div className="dashboard-banner">
    <div className="banner-left">
      <span className="badge">
        ● AI Powered ERP
      </span>

      <h1>Welcome Back 👋</h1>

      <p>
        Manage students, attendance, academics and AI services from one place.
      </p>
    </div>

    <div className="banner-right">
      <div className="date-card">
        <h3>Today's Status</h3>
        <span>Monday</span>
      </div>
    </div>
  </div>

  {/* Dashboard Cards */}

  <DashboardCards />

  {/* Charts */}

  <div className="dashboard-grid">
    <div className="grid-item large">
      <AttendanceChart />
    </div>

    <div className="grid-item large">
      <GPAChart />
    </div>
  </div>

  {/* Weather + Calendar */}

  <div className="dashboard-grid">

    <div className="grid-item">
      <WeatherCard />
    </div>

    <div className="grid-item">
      <Calendar />
    </div>

  </div>

  {/* Timetable */}

  <Timetable />

  {/* Notification */}

  <div className="dashboard-grid">

    <div className="grid-item">
      <Notification />
    </div>

    <div className="grid-item">
      <QRCodeCard />
    </div>

  </div>

  {/* AI */}

  <ChatBot />

</div>
  );
};

export default Dashboard;