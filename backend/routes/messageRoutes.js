import { Router } from "express";
import { protectRoute } from "../middlewares/authUser.js";
import {
  getMessages,
  sendMessage,
  getUserForSidebar,
} from "../controllers/messageController.js";
import { upload } from "../utils/multer.js";

const messageRouter = Router();

messageRouter.get("/user", protectRoute, getUserForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.post(
  "/send/:id",
  protectRoute,
  upload.single("image"),
  sendMessage
);

export default messageRouter;
