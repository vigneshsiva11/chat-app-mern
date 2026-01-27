import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import Chatcontainer from "../components/Chatcontainer";
import Rightsidebar from "../components/Rightsidebar";
import { chatContext } from "../../context/ChatContext.jsx";
import "../components/ChatLayout.css";

const HomePage = () => {
  const { selectedUser } = useContext(chatContext);

  return (
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1a0b3d 0%, #2d1555 50%, #1a0b3d 100%)",
      }}
    >
      {/* Purple Glow Effects */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)",
          filter: "blur(100px)",
        }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(168, 85, 247, 0) 70%)",
          filter: "blur(120px)",
        }}
      ></div>
      <div
        className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0) 70%)",
          filter: "blur(90px)",
        }}
      ></div>
      <div
        className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, rgba(147, 51, 234, 0) 70%)",
          filter: "blur(110px)",
        }}
      ></div>

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
  );
};

export default HomePage;
