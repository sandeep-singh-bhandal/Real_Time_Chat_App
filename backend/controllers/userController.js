import generateToken from "../utils/tokenGenerator.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

//Registering User - /api/user/register
export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Checking if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "User Already Exists" });

    // Creating the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Genrating JWT token and setting it in cookies
    generateToken(user._id, res);

    res.status(201).json({
      success: true,
      message: "Account Successfully Created",
      user: { email: user.email, name: user.name },
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

//Login User - /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.json({
        success: false,
        message: "Incorrect Email and Password ",
      });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({
        success: false,
        message: "Incorrect Email or Password ",
      });

    generateToken(user._id, res);

    res.json({
      success: true,
      message: "Log in Successfully",
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.log(err.message);
    res.json({ success: false, message: err.message });
  }
};

// Logout User - /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged Out Successfully" });
  } catch (err) {
    console.log(err.message);
    res.json({ success: false, message: err.message });
  }
};

//Check Auth - /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId).select("-password");
    return res.json({ success: true, user });
  } catch (err) {
    console.log(err.message);
    res.json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const profilePic = req.file;
  const { userId } = req.user;

  try {
    let uploadResponse;
    if (profilePic) {
      uploadResponse = await cloudinary.uploader.upload(profilePic.path);
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      profilePic
        ? {
            name,
            email,
            profilePic: uploadResponse.secure_url,
          }
        : {
            name,
            email,
          },
      { new: true }
    );
    res
      .status(200)
      .json({ success: true, message: "Profile updated", updatedUser });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
