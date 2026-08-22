const Share = require("../models/Share");
const WorkspaceMember = require("../models/WorkspaceMember");
const Session = require("../models/Session");
const Message = require("../models/Message");

// Access Check Helper
async function canAccessSharedResource(userId, resourceId, resourceType) {
    if (!userId || !resourceId || !resourceType) return false;
    
    // We must lazily check isValidId since it's defined lower down or move it up
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(resourceId)) return false;    
    // Find active shares for this user and resource
    const share = await Share.findOne({
        resourceId,
        resourceType,
        sharedWith: userId,
        isActive: true
    });
    
    if (!share) return false;
    
    // Check if user is still an active workspace member
    const member = await WorkspaceMember.findOne({
        workspaceId: share.workspaceId,
        userId: userId,
        status: "active"
    });
    if (!member) return false;
    
    // Check if resource still exists and is not deleted
    if (resourceType === "session") {
        const session = await Session.findOne({ _id: resourceId, isDeleted: false });
        if (!session) return false;
    } else if (resourceType === "message") {
        const message = await Message.findOne({ _id: resourceId, isDeleted: false });
        if (!message) return false;
    }
    // "code" and "file" will just return true if share and membership exist for now.
    
    return true;
}

// Helpers for validation
const mongoose = require("mongoose");
const Workspace = require("../models/Workspace");

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function validatePermission(permission) {
    const value = permission || "view";

    if (![
        "view",
        "edit"
    ].includes(value)) {
        throw new Error(
            "Validation Error: Invalid share permission."
        );
    }

    return value;
}

function validateTargetUserIds(targetUserIds) {
    if (!Array.isArray(targetUserIds) || targetUserIds.length === 0) {
        throw new Error(
            "Validation Error: At least one target member is required."
        );
    }

    if (targetUserIds.some(targetId => !isValidId(targetId))) {
        throw new Error(
            "Validation Error: Invalid target member ID format."
        );
    }
}

async function verifyWorkspaceMembership(workspaceId, userId) {
    if (!userId || !workspaceId) throw new Error("Validation Error: Missing IDs");
    if (!isValidId(workspaceId) || !isValidId(userId)) throw new Error("Validation Error: Invalid ID format");
    
    const workspace = await Workspace.findOne({ _id: workspaceId, isActive: true });
    if (!workspace) throw new Error("Not Found: Workspace not found or inactive.");

    const member = await WorkspaceMember.findOne({ workspaceId, userId, status: "active" });
    if (!member) throw new Error("Forbidden: User is not an active member of this workspace.");
    return member;
}

async function shareSession(workspaceId, requesterId, sessionId, targetUserIds, permission) {
    if (!isValidId(sessionId)) throw new Error("Validation Error: Invalid session ID format");
    validateTargetUserIds(targetUserIds);
    const sharePermission = validatePermission(permission);
    const requester =
        await verifyWorkspaceMembership(
            workspaceId,
            requesterId
        );

    
    const session = await Session.findOne({ _id: sessionId, isDeleted: false });
    if (!session) throw new Error("Not Found: Session not found or deleted.");
    if (!session.workspaceId || session.workspaceId.toString() !== workspaceId.toString()) {
        throw new Error("Forbidden: Session does not belong to this workspace.");
    }

    const canShareAnySession =
        requester.role === "owner" ||
        requester.role === "admin";

    if (
        !canShareAnySession &&
        session.userId?.toString() !== requesterId.toString()
    ) {
        throw new Error("Forbidden: Members can only share their own sessions.");
    }
    
    const createdShares = [];
    
    for (const targetId of targetUserIds) {
        await verifyWorkspaceMembership(workspaceId, targetId);
        
        const existingShare = await Share.findOne({
            workspaceId,
            resourceType: "session",
            resourceId: sessionId,
            sharedWith: targetId,
            isActive: true
        });

        if (existingShare) {
            throw new Error(
                "Conflict: Resource is already shared with this member."
            );
        }

        const share = await Share.create({
            workspaceId,
            resourceType: "session",
            resourceId: sessionId,
            sharedBy: requesterId,
            sharedWith: targetId,
            permission: sharePermission
        });

        createdShares.push(share);
    }
    return createdShares;
}

async function shareMessage(workspaceId, requesterId, messageId, targetUserIds, permission) {
    if (!isValidId(messageId)) throw new Error("Validation Error: Invalid message ID format");
    validateTargetUserIds(targetUserIds);
    const sharePermission = validatePermission(permission);
    const requester =
        await verifyWorkspaceMembership(
            workspaceId,
            requesterId
        );

    
    const message = await Message.findOne({ _id: messageId, isDeleted: false });
    if (!message) throw new Error("Not Found: Message not found or deleted.");
    
    const session = await Session.findOne({ _id: message.sessionId, isDeleted: false });
    if (!session) throw new Error("Not Found: Associated session not found or deleted.");
    if (!session.workspaceId || session.workspaceId.toString() !== workspaceId.toString()) {
        throw new Error("Forbidden: Message session does not belong to this workspace.");
    }

    const canShareAnyMessage =
        requester.role === "owner" ||
        requester.role === "admin";

    if (
        !canShareAnyMessage &&
        session.userId?.toString() !== requesterId.toString()
    ) {
        throw new Error("Forbidden: Members can only share messages from their own sessions.");
    }
    
    const createdShares = [];
    
    for (const targetId of targetUserIds) {
        await verifyWorkspaceMembership(workspaceId, targetId);
        
        const existingShare = await Share.findOne({
            workspaceId,
            resourceType: "message",
            resourceId: messageId,
            sharedWith: targetId,
            isActive: true
        });

        if (existingShare) {
            throw new Error(
                "Conflict: Resource is already shared with this member."
            );
        }

        const share = await Share.create({
            workspaceId,
            resourceType: "message",
            resourceId: messageId,
            sharedBy: requesterId,
            sharedWith: targetId,
            permission: sharePermission
        });

        createdShares.push(share);
    }
    return createdShares;
}

async function getShares(workspaceId, requesterId, resourceType) {
    await verifyWorkspaceMembership(workspaceId, requesterId);
    
    const query = {
        workspaceId,
        sharedWith: requesterId,
        isActive: true
    };
    
    if (resourceType) {
        query.resourceType = resourceType;
    }
    
    return await Share.find(query).sort({ createdAt: -1 });
}

async function revokeShare(workspaceId, requesterId, shareId) {
    if (!isValidId(shareId)) throw new Error("Validation Error: Invalid share ID format");
    await verifyWorkspaceMembership(workspaceId, requesterId);

    
    const share = await Share.findOne({ _id: shareId, workspaceId });
    if (!share) throw new Error("Not Found: Share not found.");
    
    if (share.sharedBy.toString() !== requesterId.toString()) {
        throw new Error("Forbidden: You do not have permission to revoke this share.");
    }
    
    share.isActive = false;
    await share.save();
    return share;
}

module.exports = {
    canAccessSharedResource,
    shareSession,
    shareMessage,
    getShares,
    revokeShare
};
