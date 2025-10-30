import generateToken from "../utils/tokenGenerator.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId, io } from "../utils/socket.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";

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
      lastSeen: Date.now(),
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
      user: { _id: user._id, email: user.email, name: user.name, profilePic: user.profilePic },
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
  const { name, bio } = req.body;
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
          bio,
          profilePic: uploadResponse.secure_url,
        }
        : {
          name,
          bio,
        },
      { new: true }
    ).select("name bio");
    res
      .status(200)
      .json({ success: true, message: "Profile updated", updatedUser });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/user/block/:userId
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.user; // logged-in user
    const { userId: toBlockId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: toBlockId },
    });

    io.to(getReceiverSocketId(toBlockId)).emit("userBlocked", {
      blockedByUserId: userId,
      blockedUserId: toBlockId,
    });

    res.json({ success: true, message: "User blocked successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/user/unblock/:userId
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const { userId: toUnblockId } = req.params;

    await User.findByIdAndUpdate(userId, {
      $pull: { blockedUsers: toUnblockId },
    });
    io.to(getReceiverSocketId(toUnblockId)).emit("userUnblocked", {
      unBlockedByUserId: userId,
      unBlockedUserId: toUnblockId,
    });
    res.json({ success: true, message: "User unblocked successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const { userId } = req.user;
    const blockedUsers = await User.findById(userId).select("blockedUsers").populate("blockedUsers", "name");
    res.status(200).json({ success: true, blockedUsers: blockedUsers.blockedUsers });
  } catch (error) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });
    const code = Math.floor(100000 + Math.random() * 900000);
    await User.findOneAndUpdate(
      { email },
      { otp: code, otpExpiry: Date.now() + 15 * 60 * 1000 }
    );


    await sendOtpEmail(email, code)
    
    res.json({ success: true, message: "Code sent successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
    console.log(err.message);
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!otp || otp.length < 6) {
      return res.json({
        success: false,
        message: "Please enter the 6 digit code",
      });
    }

    const user = await User.findOne({ email });
    if (user.otp === "" || user.otp !== otp) {
      return res.json({
        success: false,
        message: "Incorrect Code",
      });
    }
    if (user.otpExpiry < Date.now()) {
      return res.json({
        success: false,
        message: "Otp Expired",
      });
    }
    user.otp = "";
    user.otpExpiry = null;
    user.isEmailVerified = true;
    await user.save();

    res.json({ success: true, message: "Email verified" });
  } catch (err) {
    res.json({ success: false, error: err.message });
    console.log(err.message);
  }
};

export const changeEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const { userId } = req.user;
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.json({ success: false, message: "Email already in use" });
    }
    await User.findByIdAndUpdate(userId, { email: newEmail, isEmailVerified: false });
    res.json({ success: true, message: "Email updated successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
    console.log(err.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.user;
    const user = await User.findById(userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Current password is incorrect" });
    }
    const isNewPasswordSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isNewPasswordSameAsCurrent) {
      return res.json({ success: false, message: "New password cannot be the same as the current password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.json({ success: false, error: err.message });
    console.log(err.message);
  }
}

export const chatPreferences = async (req, res) => {
  try {
    const { userId } = req.user;
    const { isReadReceiptEnabled, isTypingIndicatorEnabled, isNotificationSoundEnabled } = req.body;
    const user = await User.findById(userId);
    user.chatPreferences.isReadReceiptEnabled = isReadReceiptEnabled;
    user.chatPreferences.isTypingIndicatorEnabled = isTypingIndicatorEnabled;
    user.chatPreferences.isNotificationSoundEnabled = isNotificationSoundEnabled;
    await user.save();
    res.json({ success: true, message: "Chat preferences updated successfully", chatPreferences: user.chatPreferences });
  } catch (err) {
    res.json({ success: false, error: err.message });
    console.log(err.message);
  }
}

export const privacySettingsController = async (req, res) => {
  try {
    const { userId } = req.user;
    const { lastSeenVisibility, onlineStatusVisibility, profilePictureVisibility, bioVisibility } = req.body;
    const user = await User.findById(userId);
    user.privacySettings.lastSeenVisibility = lastSeenVisibility;
    user.privacySettings.onlineStatusVisibility = onlineStatusVisibility;
    user.privacySettings.profilePictureVisibility = profilePictureVisibility;
    user.privacySettings.bioVisibility = bioVisibility;
    await user.save();
    res.json({ success: true, message: "Privacy settings updated successfully", privacySettings: user.privacySettings });
  } catch (err) {
    res.json({ success: false, error: err.message });
    console.log(err.message);
  }
}