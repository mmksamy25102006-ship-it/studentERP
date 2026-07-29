import React, { createContext, useContext, useEffect, useState } from "react";


// Create Context
const AuthContext = createContext();



// Provider Component
export const AuthProvider = ({ children }) => {


  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);



  // Load user data when application starts
  useEffect(() => {

    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");


    if(savedUser && savedToken){

      setUser(JSON.parse(savedUser));

      setToken(savedToken);

    }


    setLoading(false);


  }, []);





  // Login Function

  const login = (userData, jwtToken) => {


    setUser(userData);

    setToken(jwtToken);



    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );


    localStorage.setItem(
      "token",
      jwtToken
    );


  };






  // Logout Function

  const logout = () => {


    setUser(null);

    setToken(null);



    localStorage.removeItem("user");

    localStorage.removeItem("token");


  };







  return (

    <AuthContext.Provider
      value={{

        user,

        token,

        loading,

        login,

        logout,

        isAuthenticated: !!token,

      }}
    >

      {children}

    </AuthContext.Provider>

  );

};







// Custom Hook

export const useAuth = () => {


  return useContext(AuthContext);


};



export default AuthContext;