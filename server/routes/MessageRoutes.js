import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  markMessageAsSeen,
  deleteMessage,
  addReaction,
  removeReaction,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.delete("/delete/:id", protectRoute, deleteMessage);
messageRouter.post("/react/:id", protectRoute, addReaction);
messageRouter.delete("/react/:id", protectRoute, removeReaction);

export default messageRouter;
