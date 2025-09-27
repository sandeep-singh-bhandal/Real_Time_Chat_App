import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import { generateToken } from "../utils/tokenGenerator.js";

// Sign up a new user
export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    // Checking if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "User Already Exists" });

    // Creating the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id, "7d");

    res.cookie("token", token, {
      httpOnly: true, // prevent JS to access the cookie
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiration time
    });
    return res.json({
      success: true,
      message: "Account Successfully Created",
      user: { email: user.email, name: user.name },
    });
  } catch (err) {
    console.log(err.message);
    res.json({ success: false, message: err.message });
  }
};

//Login User - /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
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

    const token = generateToken(user._id, "7d");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      success: true,
      message: "Log in Successfully",
      user: { email: user.email, name: user.name },
    });
  } catch (err) {
    console.log(err.message);
    res.json({ success: false, message: err.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, bio } = req.body;
    const userId = req.user.user._id;

    let updatedUser;
    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          bio,
          fullName,
          profilePic: uploadResponse.secure_url,
        },
        { new: true }
      );
    }
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.log(err.message);
    res.json({ success: false, message: err.message });
  }
};
