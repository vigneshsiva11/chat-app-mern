import express from "express";
import { protectRoute } from "../middlewares/auth.js";
import {
    summarizeChat,
    generateSmartReplies,
    translateMessage,
    getAIStats,
    transcribeVoice,
} from "../controllers/aiController.js";
import { getModerationLogs } from "../middleware/moderationMiddleware.js";

const aiRouter = express.Router();

// AI features
aiRouter.post("/summarize", protectRoute, summarizeChat);
aiRouter.post("/smart-replies", protectRoute, generateSmartReplies);
aiRouter.post("/translate", protectRoute, translateMessage);
aiRouter.post("/transcribe", protectRoute, transcribeVoice);

// Stats and logs
aiRouter.get("/stats", protectRoute, getAIStats);
aiRouter.get("/moderation-logs", protectRoute, getModerationLogs);

export default aiRouter;
