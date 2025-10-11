import Message from "../models/Message.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId, io } from "../utils/socket.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user.userId;
    const messages = await Message.find({
      $or: [
        {
          senderId,
          receiverId,
        },
        {
          senderId: receiverId,
          receiverId: senderId,
        },
      ],
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLatestMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user.userId;

    const latestMessage = await Message.find({
      $or: [
        {
          senderId,
          receiverId,
        },
        {
          senderId: receiverId,
          receiverId: senderId,
        },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(1);
    res.status(200).json({ latestMessage });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const image = req.file;
    const { id: receiverId } = req.params;
    const senderId = req.user.userId;

    let imageData = {};
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image.path);
      imageData.url = uploadResponse.secure_url;
      imageData.publicId = uploadResponse.public_id;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      imageData,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({ newMessage });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
