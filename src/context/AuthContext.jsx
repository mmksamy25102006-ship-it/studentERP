import { createContext, useContext, useEffect, useState } from "react";

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

      // Head of Department flag. The HOD signs in through
      // the faculty login, so this is what unlocks the HOD
      // pages and approval rights.
      isHod: userData.isHod === true,

      // Same arrangement one level up: the principal signs
      // in through the faculty login, and this flag is what
      // unlocks the principal pages and the college wide
      // leave queue.
      isPrincipal: userData.isPrincipal === true,

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
  // Patch the signed-in user after a profile save
  // =========================================
  //
  // The sidebar and header read name/phone off `user`, so a
  // field changed on the profile page would stay stale until
  // the next login without this. Only the stored copy is
  // patched; the authority for it is the server response.
  const updateUser = (patch) => {
    setUser((current) => {
      if (!current) {
        return current;
      }

      const next = { ...current, ...patch };

      localStorage.setItem("user", JSON.stringify(next));

      if (next.facultyId) {
        localStorage.setItem("facultyId", next.facultyId);
      }

      return next;
    });
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
        updateUser,
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
