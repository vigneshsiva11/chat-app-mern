import React, { useContext } from "react";
import Sidebar from "../components/Sidebar";
import Chatcontainer from "../components/Chatcontainer";
import Rightsidebar from "../components/Rightsidebar";
import { chatContext } from "../../context/ChatContext.jsx";

const HomePage = () => {
  const { selectedUser } = useContext(chatContext);

  return (
    <div
      className="w-full h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a0b3d 0%, #2d1555 50%, #1a0b3d 100%)',
      }}
    >
      {/* Purple Glow Effects */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)',
          filter: 'blur(100px)',
        }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(168, 85, 247, 0) 70%)',
          filter: 'blur(120px)',
        }}
      ></div>
      <div
        className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, rgba(124, 58, 237, 0) 70%)',
          filter: 'blur(90px)',
        }}
      ></div>
      <div
        className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, rgba(147, 51, 234, 0) 70%)',
          filter: 'blur(110px)',
        }}
      ></div>

      {/* Main Container */}
      <div className="w-full h-screen flex items-center justify-center sm:px-[8%] relative z-10">
        <div
          className={`rounded-2xl overflow-hidden w-full h-[90vh] grid grid-cols-1 relative ${selectedUser
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : "md:grid-cols-2"
            }`}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}
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
