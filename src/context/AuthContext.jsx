import React, { createContext, useContext, useEffect, useState } from "react";

// Create Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================
  // Load saved user when application starts
  // =========================================
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);

        setUser(parsedUser);
        setToken(savedToken);
      }
    } catch (error) {
      console.error("Error loading authentication data:", error);

      // Clear corrupted authentication data
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================
  // Login Function
  // =========================================
  const login = (userData, jwtToken) => {
    // Keep all user information returned by backend
    // including:
    // studentId
    // facultyId
    // department
    // year
    // phone
    // profileImage

    const loggedInUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,

      studentId: userData.studentId || null,
      facultyId: userData.facultyId || null,

      department: userData.department || "",
      year: userData.year || "",
      phone: userData.phone || "",
      profileImage: userData.profileImage || "",
    };

    setUser(loggedInUser);
    setToken(jwtToken);

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );

    localStorage.setItem(
      "token",
      jwtToken
    );

    // Also save IDs separately for easy access
    // from existing StudentERP pages.
    if (loggedInUser.studentId) {
      localStorage.setItem(
        "studentId",
        loggedInUser.studentId
      );
    } else {
      localStorage.removeItem("studentId");
    }

    if (loggedInUser.facultyId) {
      localStorage.setItem(
        "facultyId",
        loggedInUser.facultyId
      );
    } else {
      localStorage.removeItem("facultyId");
    }
  };

  // =========================================
  // Logout Function
  // =========================================
  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    localStorage.removeItem("studentId");
    localStorage.removeItem("facultyId");
  };

  // =========================================
  // Authentication Status
  // =========================================
  const isAuthenticated = !!token;

  // =========================================
  // Provider
  // =========================================
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================================
// Custom Hook
// =========================================
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
