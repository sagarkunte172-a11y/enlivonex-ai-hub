const mongoose = require("mongoose");
const { askCodeAssistant } = require("../services/codeAssistantService");
const { chooseCodeModel } = require("../services/modelRouter");
const CodeConversation = require("../models/CodeConversation");
const Workspace = require("../models/Workspace");
const WorkspaceMember = require("../models/WorkspaceMember");
const Project = require("../models/Project");
const Share = require("../models/Share");
const { recordWorkspaceUsage } = require("../services/usageService");

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

async function accessConversation(userId, conversationId) {
    if (!validId(conversationId)) return { status: 400, message: "Validation Error: Invalid conversation ID." };
    const conversation = await CodeConversation.findOne({ _id: conversationId, isDeleted: false });
    if (!conversation) return { status: 404, message: "Not Found: Code conversation unavailable." };
    if (!conversation.workspaceId) {
        if (conversation.ownerId.toString() === userId) return { conversation, permission: "owner", canShare: false };
        return { status: 403, message: "Forbidden: You cannot access this conversation." };
    }
    const workspace = await Workspace.findOne({ _id: conversation.workspaceId, isActive: true }).lean();
    if (!workspace) return { status: 404, message: "Not Found: Workspace unavailable." };
    const member = await WorkspaceMember.findOne({ workspaceId: conversation.workspaceId, userId, status: "active" }).lean();
    if (!member) return { status: 403, message: "Forbidden: You are not an active workspace member." };
    if (conversation.ownerId.toString() === userId) return { conversation, permission: "owner", canShare: true };
    if (["owner", "admin"].includes(member.role)) return { conversation, permission: "edit", canShare: true };
    const share = await Share.findOne({ workspaceId: conversation.workspaceId, resourceType: "code", resourceId: conversation._id, sharedWith: userId, isActive: true }).lean();
    if (!share) return { status: 403, message: "Forbidden: This Code Assistant conversation has not been shared with you." };
    return { conversation, permission: share.permission || "view", share, canShare: false };
}

async function createConversation(req, res) {
    try {
        const userId = req.user?.id;
        const { workspaceId = null, projectId = null, title } = req.body || {};
        if (workspaceId && !validId(workspaceId)) return res.status(400).json({ success: false, message: "Validation Error: Invalid workspace ID." });
        if (projectId && !validId(projectId)) return res.status(400).json({ success: false, message: "Validation Error: Invalid project ID." });
        if (projectId && !workspaceId) return res.status(400).json({ success: false, message: "Validation Error: Project chats require a workspace." });
        if (workspaceId) {
            const member = await WorkspaceMember.findOne({ workspaceId, userId, status: "active" }).lean();
            const workspace = await Workspace.findOne({ _id: workspaceId, isActive: true }).lean();
            if (!member || !workspace) return res.status(403).json({ success: false, message: "Forbidden: Active workspace membership required." });
        }
        if (projectId) {
            const project = await Project.findOne({ _id: projectId, workspaceId, status: "active" }).lean();
            if (!project) return res.status(404).json({ success: false, message: "Not Found: Project unavailable in this workspace." });
        }
        const conversation = await CodeConversation.create({ ownerId: userId, workspaceId, projectId, title: title || "Code Assistant Chat" });
        return res.status(201).json({ success: true, conversation });
    } catch (error) {
        console.error("Code conversation create error:", error.message);
        return res.status(500).json({ success: false, message: "Unable to create Code Assistant conversation." });
    }
}

async function listConversations(req, res) {
    try {
        const userId = req.user.id;
        const { workspaceId, projectId, scope = "mine" } = req.query;
        if (workspaceId) {
            if (!validId(workspaceId)) return res.status(400).json({ success: false, message: "Validation Error: Invalid workspace ID." });
            const member = await WorkspaceMember.findOne({ workspaceId, userId, status: "active" }).lean();
            const workspace = await Workspace.findOne({ _id: workspaceId, isActive: true }).lean();
            if (!member || !workspace) return res.status(403).json({ success: false, message: "Forbidden: Active workspace membership required." });
        }
        if (projectId && !validId(projectId)) return res.status(400).json({ success: false, message: "Validation Error: Invalid project ID." });
        if (projectId) {
            if (!workspaceId) return res.status(400).json({ success: false, message: "Validation Error: Project filtering requires a workspace." });
            const project = await Project.findOne({ _id: projectId, workspaceId, status: "active" }).lean();
            if (!project) return res.status(404).json({ success: false, message: "Not Found: Project unavailable in this workspace." });
        }
        const ownQuery = { ownerId: userId, isDeleted: false };
        if (workspaceId) ownQuery.workspaceId = workspaceId;
        else {
            const memberships = await WorkspaceMember.find({ userId, status: "active" }).select("workspaceId").lean();
            const activeWorkspaces = await Workspace.find({ _id: { $in: memberships.map((member) => member.workspaceId) }, isActive: true }).select("_id").lean();
            ownQuery.$or = [{ workspaceId: null }, { workspaceId: { $in: activeWorkspaces.map((workspace) => workspace._id) } }];
        }
        if (projectId) ownQuery.projectId = projectId;
        let conversations;
        if (scope === "shared") {
            const shares = await Share.find({ sharedWith: userId, resourceType: "code", isActive: true, ...(workspaceId ? { workspaceId } : {}) }).select("resourceId workspaceId").lean();
            const ids = shares.map((item) => item.resourceId);
            conversations = await CodeConversation.find({ _id: { $in: ids }, isDeleted: false, ...(projectId ? { projectId } : {}) }).select("-messages").sort({ updatedAt: -1 }).lean();
            const liveIds = new Set((await WorkspaceMember.find({ userId, status: "active" }).select("workspaceId").lean()).map((m) => m.workspaceId.toString()));
            const activeWorkspaces = new Set((await Workspace.find({ _id: { $in: conversations.map((item) => item.workspaceId).filter(Boolean) }, isActive: true }).select("_id").lean()).map((workspace) => workspace._id.toString()));
            conversations = conversations.filter((item) => item.workspaceId && liveIds.has(item.workspaceId.toString()) && activeWorkspaces.has(item.workspaceId.toString()));
        } else {
            conversations = await CodeConversation.find(ownQuery).select("-messages").sort({ updatedAt: -1 }).lean();
        }
        return res.json({ success: true, conversations });
    } catch (error) {
        console.error("Code conversation list error:", error.message);
        return res.status(500).json({ success: false, message: "Unable to load Code Assistant history." });
    }
}

async function getConversation(req, res) {
    const access = await accessConversation(req.user.id, req.params.id);
    if (!access.conversation) return res.status(access.status).json({ success: false, message: access.message });
    return res.json({ success: true, conversation: access.conversation, permission: access.permission, canShare: access.canShare });
}

async function shareConversation(req, res) {
    try {
        const access = await accessConversation(req.user.id, req.params.id);
        const { sharedWith, permission = "view" } = req.body || {};
        if (!access.conversation) return res.status(access.status).json({ success: false, message: access.message });
        const conversation = access.conversation;
        if (!conversation.workspaceId || !access.canShare) return res.status(403).json({ success: false, message: "Forbidden: Only the owner or workspace admin can share this conversation." });
        if (!Array.isArray(sharedWith) || !sharedWith.length || !["view", "edit"].includes(permission)) return res.status(400).json({ success: false, message: "Validation Error: Select members and a valid permission." });
        const created = [];
        for (const targetId of sharedWith) {
            if (!validId(targetId) || targetId === req.user.id) continue;
            const member = await WorkspaceMember.findOne({ workspaceId: conversation.workspaceId, userId: targetId, status: "active" }).lean();
            if (!member) continue;
            const duplicate = await Share.findOne({ workspaceId: conversation.workspaceId, resourceType: "code", resourceId: conversation._id, sharedWith: targetId, isActive: true });
            if (duplicate) continue;
            created.push(await Share.create({ workspaceId: conversation.workspaceId, resourceType: "code", resourceId: conversation._id, sharedBy: req.user.id, sharedWith: targetId, permission }));
        }
        return res.status(201).json({ success: true, shares: created });
    } catch (error) {
        console.error("Code conversation share error:", error.message);
        return res.status(500).json({ success: false, message: "Unable to share Code Assistant conversation." });
    }
}

async function codeAssistant(req, res) {
    try {
        const { prompt, model, conversationId } = req.body || {};
        const userId = req.user?.id;
        if (typeof prompt !== "string" || !prompt.trim()) return res.status(400).json({ success: false, message: "Code Assistant prompt is required." });
        const cleanPrompt = prompt.trim();
        let conversation = null;
        if (conversationId) {
            const access = await accessConversation(userId, conversationId);
            if (!access.conversation) return res.status(access.status).json({ success: false, message: access.message });
            if (access.permission === "view") return res.status(403).json({ success: false, message: "Forbidden: This shared conversation is view-only." });
            conversation = access.conversation;
        }
        const selectedModel = chooseCodeModel(model);
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked", "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive", "X-Model-Name": selectedModel.name, "X-Model-ID": selectedModel.model, "X-Model-Reason": selectedModel.reason || "Code Assistant" });
        const result = await askCodeAssistant(cleanPrompt, selectedModel, (chunk) => {
            if (!res.writableEnded && typeof chunk === "string" && chunk.length) res.write(chunk);
        });
        if (conversation) {
            conversation.messages.push({ role: "user", content: cleanPrompt });
            conversation.messages.push({ role: "assistant", content: result.answer, model: { name: selectedModel.name, id: selectedModel.model } });
            conversation.model = selectedModel.model;
            conversation.lastMessage = cleanPrompt.slice(0, 500);
            if (conversation.title === "Code Assistant Chat" || conversation.title === "Workspace Code Assistant") conversation.title = cleanPrompt.slice(0, 80);
            await conversation.save();
            if (conversation.workspaceId) {
                await recordWorkspaceUsage({
                    workspaceId: conversation.workspaceId,
                    userId,
                    codeConversationId: conversation._id,
                    model: selectedModel.model,
                    input: cleanPrompt,
                    output: result.answer
                });
            }
        }
        if (!res.writableEnded) res.end();
    } catch (error) {
        console.error("Code Assistant Controller Error:", error.message);
        if (!res.headersSent) return res.status(500).json({ success: false, message: "Code Assistant failed." });
        if (!res.writableEnded) res.end();
    }
}

module.exports = { codeAssistant, createConversation, listConversations, getConversation, shareConversation };
