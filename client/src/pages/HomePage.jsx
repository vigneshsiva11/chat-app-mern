import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import Chatcontainer from "../components/Chatcontainer";
import Rightsidebar from "../components/Rightsidebar";
import AnimatedBackground from "../components/AnimatedBackground";
import { chatContext } from "../../context/ChatContext.jsx";
import "../components/ChatLayout.css";

const HomePage = () => {
  const { selectedUser } = useContext(chatContext);

  return (
    <AnimatedBackground>
      <div className="w-full h-screen relative">
        {/* Main Container */}
        <div className="chat-main-container">
          <div
            className={`chat-grid-wrapper ${selectedUser ? "user-selected" : ""}`}
          >
            <Sidebar />
            <Chatcontainer />
            <Rightsidebar />
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default HomePage;
