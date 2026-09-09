import { useState } from "react";
import axios from "axios";
import "./FacultyNotification.css";

function FacultyNotification() {

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const sendNotification = async () => {

        if (!title || !message) {
            alert("Please fill all fields");
            return;
        }

        try {

            await axios.post(
                "http://localhost:5000/api/notifications",
                {
                    title,
                    message,
                }
            );

            alert("Notification Sent Successfully");

            setTitle("");
            setMessage("");

        } catch (err) {

            alert("Error sending notification");

        }

    };

    return (

        <div className="notification-container">

            <div className="notification-card">

                <h2>Send Notification</h2>

                <input
                    type="text"
                    placeholder="Notification Title"
                    value={title}
                    onChange={(e)=>setTitle(e.target.value)}
                />

                <textarea
                    rows="8"
                    placeholder="Write notification here..."
                    value={message}
                    onChange={(e)=>setMessage(e.target.value)}
                />

                <button onClick={sendNotification}>
                    Send Notification
                </button>

            </div>

        </div>

    );

}

export default FacultyNotification;