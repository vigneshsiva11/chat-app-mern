import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// User Signup Controller

export const Signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const user = await User.findOne({ email });

    if (user) {
      return res.json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newuser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newuser._id);

    res.json({
      success: true,
      message: "User Account created successfully",
      userData: newuser,
      token,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// User Login Controller

export const login = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;
    const userData = await User.findOne({ email });

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);

    res.json({
      success: true,
      message: "User Account created successfully",
      userData: userData,
      token,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// check user is authenticated or not

export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// update user profile controller

export const updateProfile = async (req, res) => {
  try {
    const { profilepic, bio, fullName } = req.body;
    const userId = req.user._id;
    let updateduser;

    if (!profilepic) {
      updateduser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true },
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilepic);
      updateduser = await User.findByIdAndUpdate(
        userId,
        { profilepic: upload.secure_url, bio, fullName },
        { new: true },
      );
    }
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updateduser,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
