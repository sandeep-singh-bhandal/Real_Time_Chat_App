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
      .populate("senderId", "name profilePic")            // Populating the message for Frontend
      .populate("receiverId", "name profilePic")
      .populate({
        path: "replyTo",
        select: "text senderId receiverId imageData",
        populate: [
          { path: "senderId", select: "name profilePic" },
          { path: "receiverId", select: "name profilePic" },
          { path: "imageData", select: "url" },
        ],
      })
      .populate({
        path: "readBy",
        select: "userId",
        populate: { path: "userId", select: "name profilePic" },
      }).populate({
        path: "reactions",
        select: "userId",
        populate: { path: "userId", select: "name profilePic" },
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

    const receiver = await User.findById(receiverId);

    // Checking Blocked Status
    if (receiver.blockedUsers.includes(senderId)) {
      return res.json({ success: false, message: "You are blocked by this user" });
    }
    const sender = await User.findById(senderId);
    if (sender.blockedUsers.includes(receiverId)) {
      return res.json({ success: false, message: "Unable to send, you blocked this user" });
    }

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
      { path: "senderId", select: "name" },
      { path: "receiverId", select: "name" },
      {
        path: "replyTo",
        select: "text senderId receiverId imageData",
        populate: [
          { path: "senderId", select: "name" },
          { path: "receiverId", select: "name" },
        ],
      },
    ]);

    // Update unread count
    await User.findByIdAndUpdate(receiverId, {
      $inc: { [`unreadCounts.${senderId}`]: 1 },
    });

    // Emit realtime message to receiver and sender
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", populatedMessage);
    }

    // Response to client
    res.status(201).json({ success: true, newMessage: populatedMessage });
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

    // Emit edited message through socket
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

    // Emit deleted message id through socket
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

    // Reset unread count
    await User.findByIdAndUpdate(userId, {
      $set: { [`unreadCounts.${chattingWithUserId}`]: 0 },
    });

    // Mark all unread messages as read
    await Message.updateMany(
      {
        senderId: chattingWithUserId,
        receiverId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
        $push: {
          readBy: { userId: userId, readAt: new Date() },
        },
      }
    );

    // Fetch current user info for emit (the one who read)
    const reader = await User.findById(userId).select("name profilePic");

    // Emit to sender's socket (chattingWithUserId)
    io.to(getReceiverSocketId(chattingWithUserId)).emit("markMessageRead", {
      chattingWithUserId: userId,
      readBy: [
        {
          readAt: new Date(),
          userId: {
            _id: reader._id,
            name: reader.name,
            profilePic: reader.profilePic,
          },
        },
      ],
    });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const { userId } = req.user;

    const message = await Message.findById(messageId);

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex !== -1) {
      // Same emoji => remove reaction
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        // Change emoji
        message.reactions[existingReactionIndex].emoji = emoji;
        message.reactions[existingReactionIndex].reactedAt = new Date();
      }
    } else {
      // Add new reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const populated = await message.populate(
      "reactions.userId",
      "name profilePic"
    );

    // Emit to sender & receiver sockets
    io.to(getReceiverSocketId(message.senderId)).emit(
      "messageReaction",
      populated
    );
    io.to(getReceiverSocketId(message.receiverId)).emit(
      "messageReaction",
      populated
    );

    res.json({ success: true, message: populated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
