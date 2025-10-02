import { Router } from "express";
import { protectRoute } from "../middlewares/authUser.js";
import {
  getMessages,
  sendMessage,
  getUserForSidebar,
} from "../controllers/messageController.js";

const messageRouter = Router();

messageRouter.get("/user", protectRoute, getUserForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.post("/send/:id", protectRoute, sendMessage);

export default messageRouter;
