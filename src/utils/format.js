// src/utils/format.js

// Format Date
export const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Format Time
export const formatTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

// Format Date & Time
export const formatDateTime = (date) => {
  if (!date) return "";

  return `${formatDate(date)} ${formatTime(date)}`;
};

// Format Currency (Indian Rupees)
export const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format Percentage
export const formatPercentage = (value = 0) => {
  return `${Number(value).toFixed(2)}%`;
};

// Format GPA
export const formatGPA = (gpa = 0) => {
  return Number(gpa).toFixed(2);
};

// Format Number
export const formatNumber = (number = 0) => {
  return new Intl.NumberFormat("en-IN").format(number);
};

// Format Phone Number
export const formatPhone = (phone = "") => {
  if (phone.length !== 10) return phone;

  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
};

// Format Name
export const formatName = (name = "") => {
  return name
    .trim()
    .split(" ")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
};

// Format Attendance
export const formatAttendance = (present, total) => {
  if (!total) return "0%";

  return `${((present / total) * 100).toFixed(2)}%`;
};

// Format File Size
export const formatFileSize = (bytes = 0) => {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return (
    (bytes / Math.pow(1024, i)).toFixed(2) +
    " " +
    sizes[i]
  );
};

// Truncate Text
export const truncateText = (text = "", length = 50) => {
  if (text.length <= length) return text;

  return text.substring(0, length) + "...";
};

// Format Status
export const formatStatus = (status = "") => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Convert to Title Case
export const titleCase = (text = "") => {
  return text.replace(
    /\w\S*/g,
    (word) =>
      word.charAt(0).toUpperCase() +
      word.substring(1).toLowerCase()
  );
};