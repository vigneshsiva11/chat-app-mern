import { aiService } from "../services/aiService.js";
import ModerationLog from "../models/ModerationLog.js";
import User from "../models/user.js";

/**
 * Content moderation middleware for message sending
 * Checks for toxic content before allowing message delivery
 */
export const moderateMessage = async (req, res, next) => {
  try {
    const { text } = req.body;

    // Skip moderation if no text (images only) or if moderation is disabled
    if (!text || process.env.MODERATION_ENABLED === "false") {
      req.body.aiProcessed = false;
      return next();
    }

    // Call AI moderation service with timeout
    const moderationPromise = aiService.moderateContent(text);
    const timeoutPromise = new Promise(
      (_, reject) =>
        setTimeout(() => reject(new Error("Moderation timeout")), 10000), // 10 second timeout
    );

    const moderationResult = await Promise.race([
      moderationPromise,
      timeoutPromise,
    ]);

    // Log the moderation check
    console.log(`Moderation check for user ${req.user._id}:`, {
      flagged: moderationResult.flagged,
      severity: moderationResult.severity,
    });

    if (moderationResult.flagged) {
      // Log the violation
      await ModerationLog.create({
        userId: req.user._id,
        messageText: text,
        moderationScore:
          moderationResult.severity === "high"
            ? 0.9
            : moderationResult.severity === "medium"
              ? 0.6
              : 0.3,
        categories: moderationResult.categories,
        severity: moderationResult.severity,
        action: "blocked",
        reason: moderationResult.reason,
      });

      // Increment user violation count
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { moderationViolations: 1 },
      });

      // Check if user should be banned (e.g., 5 violations)
      const user = await User.findById(req.user._id);
      if (user.moderationViolations >= 5 && !user.isBanned) {
        await User.findByIdAndUpdate(req.user._id, { isBanned: true });
        return res.status(403).json({
          success: false,
          message:
            "Your account has been banned due to repeated violations of community guidelines",
          banned: true,
        });
      }

      // Block the message
      return res.status(400).json({
        success: false,
        message:
          "Your message contains inappropriate content and cannot be sent",
        moderation: {
          flagged: true,
          severity: moderationResult.severity,
          reason: moderationResult.reason,
          categories: Object.keys(moderationResult.categories).filter(
            (k) => moderationResult.categories[k],
          ),
        },
        violations: user.moderationViolations,
      });
    }

    // Message is clean - proceed
    req.body.aiProcessed = true;
    req.body.isToxic = false;
    req.body.moderationScore = 0;

    // Log as allowed (for auditing)
    await ModerationLog.create({
      userId: req.user._id,
      messageText: text,
      moderationScore: 0,
      categories: {},
      severity: "low",
      action: "allowed",
    });

    next();
  } catch (error) {
    console.error("Moderation error:", error.message);

    // FAIL OPEN - if moderation fails, allow the message through
    // This prevents blocking all messages if AI service is down
    console.warn("⚠️ Moderation bypassed due to error - message allowed");
    req.body.aiProcessed = false;
    req.body.moderationError = true;
    next();
  }
};

/**
 * Check if user is banned
 */
export const checkBanStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      console.error("User not found in ban check:", req.user._id);
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been banned due to violations of community guidelines",
        banned: true,
      });
    }

    next();
  } catch (error) {
    console.error("Ban check error:", error.message);
    // Allow message to proceed if ban check fails
    console.warn("⚠️ Ban check bypassed due to error");
    next();
  }
};

/**
 * Get moderation logs for a user (admin only)
 */
export const getModerationLogs = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};

    const logs = await ModerationLog.find(query)
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, logs });
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch moderation logs",
    });
  }
};
