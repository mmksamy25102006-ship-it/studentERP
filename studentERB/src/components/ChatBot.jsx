// src/components/ChatBot.jsx

import React, { useState } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaTimes,
  FaComments,
} from "react-icons/fa";
import "./ChatBot.css";

const ChatBot = () => {
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! Welcome to NEXUS ERP.\nHow can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");

  const getBotReply = (message) => {
    message = message.toLowerCase();

    if (message.includes("attendance")) {
      return "Your current attendance is 92%.";
    }

    if (message.includes("cgpa") || message.includes("gpa")) {
      return "Your current CGPA is 8.74.";
    }

    if (message.includes("fees")) {
      return "Pending fee amount is ₹25,000.";
    }

    if (message.includes("library")) {
      return "You have 2 borrowed books.";
    }

    if (message.includes("exam")) {
      return "Semester exams start from 15 December.";
    }

    if (message.includes("timetable")) {
      return "Your timetable is available in the Timetable section.";
    }

    if (message.includes("hello") || message.includes("hi")) {
      return "Hello 👋 How can I assist you?";
    }

    return "Sorry, I couldn't understand. Please try another question.";
  };

  const sendMessage = () => {
    if (input.trim() === "") return;

    const userMessage = {
      sender: "user",
      text: input,
    };

    const botMessage = {
      sender: "bot",
      text: getBotReply(input),
    };

    setMessages([...messages, userMessage, botMessage]);

    setInput("");
  };

  return (
    <>
      {/* Floating Button */}

      <button
        className="chat-toggle"
        onClick={() => setOpen(!open)}
      >
        {open ? <FaTimes /> : <FaComments />}
      </button>

      {/* Chat Window */}

      {open && (
        <div className="chat-container">

          <div className="chat-header">
            <FaRobot />
            <span>NEXUS AI Assistant</span>
          </div>

          <div className="chat-body">

            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "user"
                    ? "message user"
                    : "message bot"
                }
              >
                {msg.text}
              </div>
            ))}

          </div>

          <div className="chat-footer">

            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
            />

            <button onClick={sendMessage}>
              <FaPaperPlane />
            </button>

          </div>

        </div>
      )}
    </>
  );
};

export default ChatBot;