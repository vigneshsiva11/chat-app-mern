import React, { useState, useContext } from "react";
import AnimatedBackground from "../components/AnimatedBackground";
import assets from "../assets/assets";
import { AuthContext } from "../../context/Authcontext";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [Fullname, setFullname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [bio, setbio] = useState("");
  const [isDataSubmitted, setisDataSubmitted] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currState === "Sign up" && !isDataSubmitted) {
      setisDataSubmitted(true);
      return;
    }
    login(currState === "Sign up" ? "signup" : "login", {
      fullName: Fullname,
      email,
      password,
      bio,
    });
  };

  return (
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center">
        {/* Welcome Screen - Chat Icon and Branding */}
        <div className={`flex flex-col items-center gap-8 transition-all duration-700 ${isFormVisible ? 'mr-8 max-md:mr-4' : ''}`}>
          {/* Chat Icon Button with Glow */}
          <div
            onClick={() => setIsFormVisible(!isFormVisible)}
            className={`relative rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-110 ${isFormVisible ? 'w-20 h-20' : 'w-32 h-32'}`}
            style={{
              background: 'rgba(168, 85, 247, 0.3)',
              backdropFilter: 'blur(10px)',
              animation: 'glowPulse 2s ease-in-out infinite'
            }}
          >
            <div className={`flex gap-2 transition-all duration-300 ${isFormVisible ? 'scale-75' : ''}`}>
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>

          {/* QuickChat Text */}
          <h1 className={`font-bold text-white tracking-wide transition-all duration-500 ${isFormVisible ? 'text-4xl' : 'text-6xl'}`}>
            QuickChat
          </h1>

          {/* Popup Instruction - Only visible when form is hidden */}
          {!isFormVisible && (
            <div
              className="relative px-6 py-3 rounded-full text-white text-center max-w-xs"
              style={{
                background: 'rgba(139, 92, 246, 0.4)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                animation: 'popupBounce 2s ease-in-out infinite'
              }}
            >
              <p className="text-lg font-medium" style={{ animation: 'instructionPulse 2s ease-in-out infinite' }}>
                Click the button to {currState === "Sign up" ? "sign up" : "login"}
              </p>
              {/* Arrow pointing up */}
              <div
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45"
                style={{
                  background: 'rgba(139, 92, 246, 0.4)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              ></div>
            </div>
          )}
        </div>



        {/* Form - Slides in from right */}
        {isFormVisible && (
          <form
            onSubmit={onSubmitHandler}
            className="relative w-[420px] p-8 rounded-2xl shadow-2xl max-md:w-[90%]"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              animation: 'scaleIn 0.5s ease-out'
            }}
          >
            <h2 className="font-semibold text-2xl text-white mb-6 flex justify-between items-center">
              {currState}
              {isDataSubmitted && (
                <img
                  onClick={() => setisDataSubmitted(false)}
                  src={assets.arrow_icon}
                  alt=""
                  className="w-5 cursor-pointer"
                />
              )}
            </h2>

            {currState === "Sign up" && !isDataSubmitted && (
              <input
                onChange={(e) => setFullname(e.target.value)}
                value={Fullname}
                type="text"
                className="w-full p-3 mb-4 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                placeholder="Full Name"
                required
              />
            )}

            {!isDataSubmitted && (
              <>
                <input
                  onChange={(e) => setemail(e.target.value)}
                  value={email}
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full p-3 mb-4 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                />
                <input
                  onChange={(e) => setpassword(e.target.value)}
                  value={password}
                  type="password"
                  placeholder="Enter password"
                  required
                  className="w-full p-3 mb-4 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                />
              </>
            )}

            {currState === "Sign up" && isDataSubmitted && (
              <textarea
                onChange={(e) => setbio(e.target.value)}
                value={bio}
                rows={4}
                className="w-full p-3 mb-4 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                placeholder="Provide short bio..."
                required
              ></textarea>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-semibold cursor-pointer transition-transform hover:scale-[1.02] mb-4"
              style={{
                background: 'linear-gradient(90deg, #a855f7 0%, #7c3aed 100%)'
              }}
            >
              {currState === "Sign up" ? "create Account" : "login now"}
            </button>


            <div className="flex flex-col gap-2">
              {currState === "Sign up" ? (
                <p className="text-sm text-gray-200">
                  Already have an account?{" "}
                  <span
                    onClick={() => {
                      setCurrState("Login");
                      setisDataSubmitted(false);
                    }}
                    className="font-medium text-purple-300 cursor-pointer hover:underline"
                  >
                    Login here
                  </span>
                </p>
              ) : (
                <p className="text-sm text-gray-200">
                  Create an account{" "}
                  <span
                    onClick={() => {
                      setCurrState("Sign up");
                    }}
                    className="font-medium text-purple-300 cursor-pointer hover:underline"
                  >
                    Click here
                  </span>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </AnimatedBackground>
  );
};

export default LoginPage;
