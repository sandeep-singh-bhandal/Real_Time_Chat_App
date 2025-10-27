import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: String,
      default: ""
    },
    otpExpiry: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
