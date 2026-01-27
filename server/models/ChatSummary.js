import mongoose from "mongoose";

const chatSummarySchema = new mongoose.Schema(
    {
        conversationId: {
            type: String,
            required: true,
            index: true,
        },
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        summary: {
            type: String,
            required: true,
        },
        bulletPoints: [String],
        keyDecisions: [String],
        actionItems: [String],
        participants: [String],
        messageCount: {
            type: Number,
            default: 0,
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
            index: { expires: 0 }, // TTL index
        },
    },
    { timestamps: true }
);

// Create compound index for efficient lookups
chatSummarySchema.index({ conversationId: 1, startTime: 1, endTime: 1 });

const ChatSummary =
    mongoose.models.ChatSummary ||
    mongoose.model("ChatSummary", chatSummarySchema);

export default ChatSummary;
