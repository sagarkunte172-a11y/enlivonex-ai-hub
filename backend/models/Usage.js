const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            default: null
        },
        codeConversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CodeConversation",
            default: null
        },
        model: {
            type: String,
            required: true,
            trim: true
        },
        inputTokens: {
            type: Number,
            required: true,
            min: 0
        },
        outputTokens: {
            type: Number,
            required: true,
            min: 0
        },
        totalTokens: {
            type: Number,
            required: true,
            min: 0
        },
        tokensEstimated: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

usageSchema.index({ workspaceId: 1, userId: 1, createdAt: -1 });
usageSchema.index({ workspaceId: 1, sessionId: 1, createdAt: -1 });
usageSchema.index({ workspaceId: 1, codeConversationId: 1, createdAt: -1 });

module.exports = mongoose.model("Usage", usageSchema);
