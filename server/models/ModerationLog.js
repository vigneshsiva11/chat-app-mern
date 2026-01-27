import mongoose from "mongoose";

const moderationLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        messageText: {
            type: String,
            required: true,
        },
        moderationScore: {
            type: Number,
        },
        categories: {
            hate: { type: Boolean, default: false },
            violence: { type: Boolean, default: false },
            sexual: { type: Boolean, default: false },
            harassment: { type: Boolean, default: false },
            self_harm: { type: Boolean, default: false },
            spam: { type: Boolean, default: false },
        },
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "low",
        },
        action: {
            type: String,
            enum: ["blocked", "warned", "allowed"],
            required: true,
        },
        reason: String,
    },
    { timestamps: true }
);

// Index for querying user violations
moderationLogSchema.index({ userId: 1, createdAt: -1 });

const ModerationLog =
    mongoose.models.ModerationLog ||
    mongoose.model("ModerationLog", moderationLogSchema);

export default ModerationLog;
