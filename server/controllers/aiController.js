import { aiService } from "../services/aiService.js";
import { cacheService } from "../services/cacheService.js";
import Message from "../models/message.js";
import ChatSummary from "../models/ChatSummary.js";
import User from "../models/User.js";

/**
 * Summarize chat conversation
 * POST /api/ai/summarize
 */
export const summarizeChat = async (req, res) => {
    try {
        console.log("Summarize Request received");
        const { receiverId, startTime, endTime } = req.body;
        const senderId = req.user._id;

        // Create conversation ID (sorted to ensure consistency)
        const convId = [senderId.toString(), receiverId]
            .sort()
            .join("_");

        // Generate cache key
        const cacheKey = `summary_${convId}_${startTime || "all"}_${endTime || "now"}`;

        // Check cache first
        const cached = cacheService.get(cacheKey);
        if (cached) {
            return res.json({ success: true, summary: cached, cached: true });
        }

        // Build query
        const query = {
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        };

        if (startTime) query.createdAt = { $gte: new Date(startTime) };
        if (endTime) {
            query.createdAt = query.createdAt || {};
            query.createdAt.$lte = new Date(endTime);
        }

        // Fetch messages
        const messages = await Message.find(query)
            .populate("senderId", "fullName")
            .sort({ createdAt: 1 })
            .limit(500); // Limit to prevent huge prompts

        if (messages.length === 0) {
            return res.json({
                success: false,
                message: "No messages found in the specified range",
            });
        }

        // Format for AI
        const formatted = messages
            .map((m) => `${m.senderId.fullName}: ${m.text || "[Image]"}`)
            .join("\n");

        // Generate summary with AI
        const summary = await aiService.summarizeConversation(formatted);

        // Add metadata
        summary.messageCount = messages.length;
        summary.generatedAt = new Date();

        // Cache for 24 hours
        cacheService.set(cacheKey, summary, 86400);

        // Save to database with TTL of 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await ChatSummary.create({
            conversationId: convId,
            participants: [senderId, receiverId],
            startTime: startTime || messages[0].createdAt,
            endTime: endTime || messages[messages.length - 1].createdAt,
            summary: JSON.stringify(summary),
            bulletPoints: summary.bulletPoints,
            keyDecisions: summary.keyDecisions,
            actionItems: summary.actionItems,
            participantNames: summary.participants || [], // AI-extracted names
            messageCount: messages.length,
            expiresAt,
        });

        res.json({ success: true, summary, cached: false });
    } catch (error) {
        console.error("Summarization error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate summary",
            error: error.message,
        });
    }
};

/**
 * Generate smart reply suggestions
 * POST /api/ai/smart-replies
 */
export const generateSmartReplies = async (req, res) => {
    try {
        const { messageText, conversationContext } = req.body;

        if (!messageText) {
            return res.status(400).json({
                success: false,
                message: "Message text is required",
            });
        }

        // Cache key based on message text
        const cacheKey = `replies_${messageText.substring(0, 50)}`;

        // Check cache (5 minute TTL)
        const cached = cacheService.get(cacheKey);
        if (cached) {
            return res.json({ success: true, suggestions: cached, cached: true });
        }

        // Generate replies
        const suggestions = await aiService.generateSmartReplies(
            messageText,
            conversationContext
        );

        // Cache for 5 minutes
        cacheService.set(cacheKey, suggestions, 300);

        res.json({ success: true, suggestions, cached: false });
    } catch (error) {
        console.error("Smart reply error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate replies",
            suggestions: ["Thanks!", "Got it", "Let me check"],
        });
    }
};

/**
 * Translate message to target language
 * POST /api/ai/translate
 */
export const translateMessage = async (req, res) => {
    try {
        console.log("🌐 Translate Request received");
        const { messageId, targetLanguage } = req.body;

        if (!messageId || !targetLanguage) {
            return res.status(400).json({
                success: false,
                message: "Message ID and target language are required",
            });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        if (!message.text) {
            return res.status(400).json({
                success: false,
                message: "Cannot translate image messages",
            });
        }

        // Check if translation already exists
        const existing = message.translations?.find(
            (t) => t.language === targetLanguage
        );

        if (existing) {
            return res.json({
                success: true,
                translation: {
                    original: message.text,
                    translated: existing.text,
                    language: targetLanguage,
                },
                cached: true,
            });
        }

        // Translate with AI
        const translated = await aiService.translateText(
            message.text,
            targetLanguage
        );

        // Save translation to message
        if (!message.translations) message.translations = [];
        message.translations.push({
            language: targetLanguage,
            text: translated,
            translatedAt: new Date(),
        });

        await message.save();

        res.json({
            success: true,
            translation: {
                original: message.text,
                translated,
                language: targetLanguage,
            },
            cached: false,
        });
    } catch (error) {
        console.error("Translation error:", error);
        res.status(500).json({
            success: false,
            message: "Translation failed",
            error: error.message,
        });
    }
};

/**
 * Get AI usage statistics (admin only)
 * GET /api/ai/stats
 */
export const getAIStats = async (req, res) => {
    try {
        const cacheStats = cacheService.stats();
        const summaryCount = await ChatSummary.countDocuments();

        res.json({
            success: true,
            stats: {
                cacheSize: cacheStats.size,
                cachedKeys: cacheStats.keys,
                totalSummaries: summaryCount,
            },
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get stats",
        });
    }
};

/**
 * Transcribe voice message to text
 * POST /api/ai/transcribe
 */
export const transcribeVoice = async (req, res) => {
    try {
        console.log("🎤 Voice transcription request received");
        const { audioData, mimeType } = req.body;

        if (!audioData) {
            return res.status(400).json({
                success: false,
                message: "Audio data is required",
            });
        }

        // Extract base64 data if it includes the data URL prefix
        let base64Audio = audioData;
        if (audioData.includes("base64,")) {
            base64Audio = audioData.split("base64,")[1];
        }

        // Transcribe the audio using AI service
        const transcription = await aiService.transcribeAudio(
            base64Audio,
            mimeType || "audio/webm"
        );

        res.json({
            success: true,
            transcription: transcription,
        });
    } catch (error) {
        console.error("Voice transcription error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to transcribe audio",
            error: error.message,
        });
    }
};
