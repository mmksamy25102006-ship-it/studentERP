import React, { createContext, useContext, useState } from "react";


// Create Context

const NotificationContext = createContext();




// Provider Component

export const NotificationProvider = ({ children }) => {


  const [notifications, setNotifications] = useState([

    {
      id: 1,
      title: "Exam Notification",
      message: "Semester exam starts tomorrow.",
      type: "warning",
      read: false,
      date: "24 July 2026",
    },


    {
      id: 2,
      title: "Fee Reminder",
      message: "Please pay your pending fees.",
      type: "danger",
      read: false,
      date: "24 July 2026",
    },


    {
      id: 3,
      title: "Attendance Updated",
      message: "Your attendance record has been updated.",
      type: "success",
      read: true,
      date: "23 July 2026",
    },


  ]);








  // Add Notification

  const addNotification = (notification) => {


    const newNotification = {

      id: Date.now(),

      read: false,

      date: new Date().toLocaleDateString(),

      ...notification,

    };


    setNotifications((prev)=>[

      newNotification,

      ...prev

    ]);


  };









  // Mark Single Notification Read

  const markAsRead = (id) => {


    setNotifications((prev)=>

      prev.map((item)=>

        item.id === id

        ?

        {
          ...item,
          read:true
        }

        :

        item

      )

    );


  };









  // Delete Notification

  const removeNotification = (id)=>{


    setNotifications((prev)=>

      prev.filter(

        (item)=>item.id !== id

      )

    );


  };









  // Clear All Notifications

  const clearNotifications = ()=>{


    setNotifications([]);


  };









  // Unread Count

  const unreadCount = notifications.filter(

    (item)=>!item.read

  ).length;









return (

<NotificationContext.Provider

value={{

notifications,

addNotification,

markAsRead,

removeNotification,

clearNotifications,

unreadCount,

}}

>


{children}


</NotificationContext.Provider>


);


};








// Custom Hook

export const useNotification = ()=>{


return useContext(NotificationContext);


};



export default NotificationContext;