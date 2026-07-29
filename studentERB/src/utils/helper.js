// src/utils/helper.js


// Capitalize first letter
export const capitalize = (text = "") => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};


// Get initials from name
export const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};


// Format Date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


// Format Time
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};


// Format Date & Time
export const formatDateTime = (date) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};


// Currency Format
export const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};


// Percentage Format
export const formatPercentage = (value = 0) => {
  return `${Number(value).toFixed(2)}%`;
};


// Generate Random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 10);
};


// Calculate GPA
export const calculateGPA = (marks = []) => {
  if (!marks.length) return 0;

  const total = marks.reduce((sum, mark) => sum + mark, 0);

  return (total / marks.length / 10).toFixed(2);
};


// Attendance Percentage
export const attendancePercentage = (present, total) => {
  if (!total) return "0%";

  return ((present / total) * 100).toFixed(2) + "%";
};


// Debounce Function
export const debounce = (func, delay = 500) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, delay);
  };
};


// LocalStorage Helpers
export const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFromStorage = (key) => {
  const value = localStorage.getItem(key);

  return value ? JSON.parse(value) : null;
};

export const removeFromStorage = (key) => {
  localStorage.removeItem(key);
};


// Email Validation
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


// Phone Validation (India)
export const validatePhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone);
};


// Password Validation
export const validatePassword = (password) => {
  return password.length >= 6;
};


// Loading Delay
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};