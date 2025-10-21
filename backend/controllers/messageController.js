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
    })
      .populate("senderId", "name profilePic")
      .populate("receiverId", "name profilePic")
      .populate({
        path: "replyTo",
        select: "text senderId receiverId imageData",
        populate: [
          { path: "senderId", select: "name profilePic" },
          { path: "receiverId", select: "name profilePic" },
          { path: "imageData", select: "url" },
        ],
      });

    res.status(200).json({ messages });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, replyTo } = req.body;
    const image = req.file;
    const { id: receiverId } = req.params;
    const senderId = req.user.userId;

    let imageData = {};
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image.path);
      imageData.url = uploadResponse.secure_url;
      imageData.publicId = uploadResponse.public_id;
    }

    // Create message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      imageData,
      replyTo: JSON.parse(replyTo)?._id || null,
    });

    // Populate sender, receiver, and reply info for frontend
    const populatedMessage = await newMessage.populate([
      { path: "senderId", select: "name profilePic" },
      { path: "receiverId", select: "name profilePic" },
      {
        path: "replyTo",
        select: "text senderId receiverId imageData",
        populate: [
          { path: "senderId", select: "name profilePic" },
          { path: "receiverId", select: "name profilePic" },
        ],
      },
    ]);

    // Update unread count
    await User.findByIdAndUpdate(receiverId, {
      $inc: { [`unreadCounts.${senderId}`]: 1 },
    });

    // Emit realtime message to receiver (and sender if needed)
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", populatedMessage);
    }

    // Send to client
    res.status(201).json({ newMessage: populatedMessage });
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { editedMessageText, messageId } = req.body;

    // Find the message
    const targetMessage = await Message.findById(messageId);

    if (!targetMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // If the new message is same as the old one
    if (editedMessageText === targetMessage.text) {
      return res.json({ success: false, message: "No changes detected" });
    }

    // Update and save
    targetMessage.text = editedMessageText;
    targetMessage.isEditted = true;
    await targetMessage.save();

    io.emit("messageEditted", { messageId, newText: editedMessageText });

    res.json({ success: true, message: "Message edited successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
export const deleteMessage = async (req, res) => {
  try {
    const { deletedMessageId } = req.params;

    // Find the message
    const targetMessage = await Message.findById(deletedMessageId);

    if (!targetMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // Mark isDelete flag true
    targetMessage.isDeleted = true;
    targetMessage.isEditted = false;
    await targetMessage.save();

    io.emit("messageDeleted", { deletedMessageId });

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUnreadCounts = async (req, res) => {
  try {
    const { userId } = req.user;
    const unreadMessages = await User.findById(userId).select("unreadCounts");
    res.json({ unreadMessages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id: chattingWithUserId } = req.params;
    await User.findByIdAndUpdate(userId, {
      $set: { [`unreadCounts.${chattingWithUserId}`]: 0 },
    });

    await Message.updateMany(
      {
        senderId: chattingWithUserId,
        receiverId: userId,
        isRead: false,
      },
      { $set: { isRead: true, seenAt: new Date() } }
    );

    io.to(getReceiverSocketId(chattingWithUserId)).emit("markMessageRead", {
      chattingWithUserId: userId,
      seenAt: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
