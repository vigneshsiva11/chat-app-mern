import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import { moderateMessage, checkBanStatus } from "../middleware/moderationMiddleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  markMessageAsSeen,
  deleteMessage,
  editMessage,
  addReaction,
  removeReaction,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, checkBanStatus, moderateMessage, sendMessage);
messageRouter.put("/edit/:id", protectRoute, editMessage);
messageRouter.delete("/delete/:id", protectRoute, deleteMessage);
messageRouter.post("/react/:id", protectRoute, addReaction);
messageRouter.delete("/react/:id", protectRoute, removeReaction);

export default messageRouter;
