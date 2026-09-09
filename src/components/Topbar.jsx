import React, { useState, useEffect } from "react";

import {
  FaBars,
  FaSearch,
  FaMoon,
  FaSun,
  FaBell,
  FaExpand,
  FaCompress,
  FaUserCircle,
  FaUserGraduate,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import useTheme from "../hooks/useTheme";
import useAuth from "../hooks/useAuth";
// import { useTheme } from "../context/ThemeContext";
// import { useNotification } from "../context/NotificationContext";
import useNotification from "../hooks/useNotification";

import "./Topbar.css";


const Topbar = ({
  sidebarOpen,
  setSidebarOpen,
}) => {


  const navigate = useNavigate();



  // Theme Hook

  const {
    darkMode,
    toggleTheme
  } = useTheme();




  // Auth Hook

  const {
    user,
    logout
  } = useAuth();




  // Notification Context

  const {
    unreadCount
  } = useNotification();




  const [showProfile,setShowProfile] = useState(false);

  const [fullscreen,setFullscreen] = useState(false);

  const [currentTime,setCurrentTime] = useState(new Date());





  // Live Date Time

  useEffect(()=>{


    const timer = setInterval(()=>{

      setCurrentTime(new Date());

    },1000);



    return ()=>clearInterval(timer);


  },[]);







  // Fullscreen

  const toggleFullscreen = () => {


    if(!document.fullscreenElement){


      document.documentElement.requestFullscreen();

      setFullscreen(true);


    }
    else{


      document.exitFullscreen();

      setFullscreen(false);


    }

  };







  // Logout

  const handleLogout = () => {


    logout();

    navigate("/");


  };







  return (

<header className="topbar">



{/* LEFT SECTION */}

<div className="topbar-left">


<button

className="menu-btn"

onClick={() => setSidebarOpen(!sidebarOpen)}

>

<FaBars/>

</button>




{/* 
<div className="navbar-logo">
  <FaUserGraduate />
  <span>NEXUS ERP</span>
</div> */}







<div className="search-box1">


<FaSearch/>


<input

type="text"

placeholder="Search students, courses..."

/>


</div>



</div>








{/* RIGHT SECTION */}

<div className="topbar-right">





{/* Date */}

<div className="date-time">

<h4>

{currentTime.toLocaleDateString()}

</h4>


<span>

{currentTime.toLocaleTimeString()}

</span>


</div>









{/* Theme Toggle */}

<button

className="icon-btn"

onClick={toggleTheme}

>

{

darkMode

?

<FaSun/>

:

<FaMoon/>

}

</button>









{/* Full Screen */}

<button

className="icon-btn"

onClick={toggleFullscreen}

>

{

fullscreen

?

<FaCompress/>

:

<FaExpand/>

}


</button>









{/* Notification */}

<button

className="icon-btn notification-btn"

onClick={()=>navigate("/notices")}

>


<FaBell/>

{unreadCount > 0 && (
  <span className="badge1">
    {unreadCount}
  </span>
)}


</button>










{/* Profile */}

<div className="profile-area">



<button

className="profile-btn"

onClick={()=>setShowProfile(!showProfile)}

>


<FaUserCircle className="profile-icon"/>



<div className="profile-info">


<h4>

{user?.name || "Admin"}

</h4>


<span>

{user?.role || "Administrator"}

</span>


</div>


</button>









{
showProfile && (

<div className="profile-dropdown">



<div
  className="dropdown-item"
  onClick={() => {
    const role = (user?.role || "").toLowerCase();

    if (role === "admin") {
      navigate("/admin-dashboard");
    } else if (role === "faculty") {
      navigate("/faculty-dashboard");
    } else {
      navigate("/dashboard");
    }

    setShowProfile(false);
  }}
>
  <FaUserCircle />
  Profile
</div>








<div

className="dropdown-item"

onClick={()=>navigate("/settings")}

>

<FaCog/>

Settings

</div>









<div

className="dropdown-item logout"

onClick={handleLogout}

>


<FaSignOutAlt/>

Logout


</div>





</div>

)

}





</div>





</div>



</header>

  );

};


export default Topbar;
