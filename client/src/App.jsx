import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/Homepage";
import LoginPage from "./pages/Loginpage";
import ProfilePage from "./pages/Profilepage";
import {Toaster} from 'react-hot-toast';


const App = () => {
  const {authUser}
  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
     <Toaster /> 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/Profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
};

export default App;
