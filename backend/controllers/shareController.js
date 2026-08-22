const shareService = require("../services/shareService");

function handleError(res, error) {
    const msg = error.message || "Unexpected Server Error";
    let status = 500;

    if (msg.startsWith("Validation Error")) status = 400;
    else if (msg.startsWith("Unauthorized")) status = 401;
    else if (msg.startsWith("Not Found")) status = 404;
    else if (msg.startsWith("Conflict")) status = 409;
    else if (msg.startsWith("Forbidden")) status = 403;

    res.status(status).json({
        success: false,
        message: msg
    });
}

exports.shareSession = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { sessionId, sharedWith, permission } = req.body;
        const requesterId = req.user?.id;
        
        if (!requesterId || !sessionId || !Array.isArray(sharedWith) || sharedWith.length === 0) {
            return res.status(400).json({ success: false, message: "Validation Error: Invalid parameters" });
        }

        const shares = await shareService.shareSession(workspaceId, requesterId, sessionId, sharedWith, permission);
        res.status(201).json({ success: true, shares });
    } catch (error) {
        handleError(res, error);
    }
};

exports.shareMessage = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { messageId, sharedWith, permission } = req.body;
        const requesterId = req.user?.id;
        
        if (!requesterId || !messageId || !Array.isArray(sharedWith) || sharedWith.length === 0) {
            return res.status(400).json({ success: false, message: "Validation Error: Invalid parameters" });
        }

        const shares = await shareService.shareMessage(workspaceId, requesterId, messageId, sharedWith, permission);
        res.status(201).json({ success: true, shares });
    } catch (error) {
        handleError(res, error);
    }
};

exports.getShares = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const requesterId = req.user?.id;
        const resourceType = req.query.resourceType;

        if (!requesterId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Authentication required." });
        }

        const shares = await shareService.getShares(workspaceId, requesterId, resourceType);
        res.status(200).json({ success: true, shares });
    } catch (error) {
        handleError(res, error);
    }
};

exports.revokeShare = async (req, res) => {
    try {
        const { workspaceId, shareId } = req.params;
        const requesterId = req.user?.id;

        if (!requesterId) {
            return res.status(401).json({ success: false, message: "Unauthorized: Authentication required." });
        }

        await shareService.revokeShare(workspaceId, requesterId, shareId);
        res.status(200).json({ success: true, message: "Share revoked successfully" });
    } catch (error) {
        handleError(res, error);
    }
};
