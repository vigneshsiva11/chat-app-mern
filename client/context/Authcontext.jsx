import { createContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_API_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);

  // check if user is authenticated , set the user data and connect the socket

  const checkAuth = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/check`,
        {
          headers: { token: localStorage.getItem("token") },
        },
      );
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //login function to handle usr authentication and socket connectionl

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/${state}`,
        credentials,
      );
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // logout function to handle user logout and socket disconnection

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUser([]);
    toast.success("Logged out successfully");
    if (socket) socket.disconnect();
  };

  // update profile function to handle user profile updates

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/update-profile`,
        body,
        {
          headers: { token: localStorage.getItem("token") },
        },
      );
      if (data.success) {
        setAuthUser(data.user);
        toast.success("profile updated successfully");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // connect socket function to handle socket connection and online users updates

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUser(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, []);

  const value = {
    authUser,
    onlineUsers: onlineUser,
    socket,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
