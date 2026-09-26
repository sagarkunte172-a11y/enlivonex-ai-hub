const mongoose = require("mongoose");

const codeMessageSchema = new mongoose.Schema({
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    model: { name: String, id: String },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

const codeConversationSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", default: null },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
    title: { type: String, default: "Code Assistant Chat", trim: true },
    model: { type: String, default: "qwen2.5-coder:7b" },
    messages: { type: [codeMessageSchema], default: [] },
    lastMessage: { type: String, default: "" },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

codeConversationSchema.index({ ownerId:  1, workspaceId: 1, projectId: 1, isDeleted: 1, updatedAt: -1 });

module.exports = mongoose.models.CodeConversation || mongoose.model("CodeConversation", codeConversationSchema);
