import express from "express";
import {
  Signup,
  checkAuth,
  login,
  updateProfile,
} from "../controllers/usercontroller.js";
import { protectRoute } from "../middlewares/auth.js";

const userrouter = express.Router();

userrouter.post("/signup", Signup);
userrouter.post("/login", login);
userrouter.put("/update-profile", protectRoute, updateProfile);
userrouter.get("/check", protectRoute, checkAuth);

export default userrouter;
