import { Router } from "express";
import { protectRoute } from "../middlewares/authUser.js";
import {
  getMessages,
  sendMessage,
  getUserForSidebar,
  getLatestMessage,
  getUnreadCounts,
  markAsRead,
  editMessage,
} from "../controllers/messageController.js";
import { upload } from "../utils/multer.js";

const messageRouter = Router();

messageRouter.get("/user", protectRoute, getUserForSidebar);
messageRouter.get("/get-unread-messages", protectRoute, getUnreadCounts);
messageRouter.patch("/edit-message", protectRoute, editMessage);
messageRouter.get("/get-latest/:id", protectRoute, getLatestMessage);
messageRouter.patch("/mark-as-read/:id", protectRoute, markAsRead);
messageRouter.post(
  "/send/:id",
  protectRoute,
  upload.single("image"),
  sendMessage
);
messageRouter.get("/:id", protectRoute, getMessages);

export default messageRouter;
