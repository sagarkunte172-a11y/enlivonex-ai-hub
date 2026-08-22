/*
==================================
Workspace Controller
JWT Authentication Version
==================================
*/

const workspaceService = require("../services/workspaceService");
const sessionService = require("../services/sessionService");

const Workspace = require("../models/Workspace");
const WorkspaceMember = require("../models/WorkspaceMember");
const Session = require("../models/Session");
const usageService = require("../services/usageService");


/*
==================================
ERROR HANDLER
==================================
*/

function handleError(res, error) {

    const message =
        error?.message ||
        "Unexpected Server Error";

    let status = 500;

    if (message.startsWith("Validation Error")) {
        status = 400;
    }

    else if (message.startsWith("Not Found")) {
        status = 404;
    }

    else if (message.startsWith("Conflict")) {
        status = 409;
    }

    else if (message.startsWith("Forbidden")) {
        status = 403;
    }

    else if (
        message.includes("Cast to ObjectId failed") ||
        message.includes("Invalid ObjectId")
    ) {
        status = 400;
    }

    return res.status(status).json({
        success: false,
        message
    });
}


/*
==================================
AUTHENTICATED USER HELPER
==================================
*/

function getAuthenticatedUserId(req, res) {

    if (!req.user?.id) {

        res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required."
        });

        return null;
    }

    return req.user.id;
}


/*
==================================
CREATE WORKSPACE
==================================

POST /api/workspaces

Body:

{
    "name": "...",
    "description": "..."
}

Owner identity:
    req.user.id

Never trust ownerId
from client.
==================================
*/

exports.createWorkspace = async (req, res) => {

    try {

        const userId =
            getAuthenticatedUserId(req, res);

        if (!userId) {
            return;
        }

        const {
            name,
            description
        } = req.body || {};

        const workspace =
            await workspaceService.createWorkspace({
                name,
                description,
                ownerId: userId
            });

        return res.status(201).json({

            success: true,

            workspace

        });

    }

    catch (error) {

        console.error(
            "Create Workspace Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
JOIN WORKSPACE
==================================

POST /api/workspaces/join
==================================
*/

exports.joinWorkspace = async (req, res) => {

    try {

        const userId =
            getAuthenticatedUserId(req, res);

        if (!userId) {
            return;
        }

        const {
            inviteCode,
            alias
        } = req.body || {};

        const member =
            await workspaceService.joinWorkspace({
                inviteCode,
                userId,
                alias
            });

        return res.status(200).json({

            success: true,

            member

        });

    }

    catch (error) {

        console.error(
            "Join Workspace Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
GET USER WORKSPACES
==================================

GET /api/workspaces/user

User identity:
    req.user.id

The client cannot request
another user's workspaces.
==================================
*/

exports.getUserWorkspaces = async (req, res) => {

    try {

        const userId =
            getAuthenticatedUserId(req, res);

        if (!userId) {
            return;
        }

        const workspaces =
            await workspaceService.getUserWorkspaces(
                userId
            );

        return res.status(200).json({

            success: true,

            workspaces

        });

    }

    catch (error) {

        console.error(
            "Get User Workspaces Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
GET WORKSPACE DETAILS
==================================

GET /api/workspaces/:workspaceId

Requester:
    req.user.id

User must be an active
workspace member.
==================================
*/

exports.getWorkspaceDetails = async (req, res) => {

    try {

        const userId =
            getAuthenticatedUserId(req, res);

        if (!userId) {
            return;
        }

        const {
            workspaceId
        } = req.params;

        if (!workspaceService.isValidObjectId(workspaceId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Invalid workspace ID format."

            });
        }

        if (!workspaceId) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: workspaceId is required."

            });
        }

        /*
        ----------------------------------
        Verify workspace membership
        ----------------------------------
        */

        await WorkspaceMember.findOne({
            workspaceId,
            userId,
            status: "active"
        }).orFail(
            new Error(
                "Forbidden: Not an active workspace member."
            )
        );

        const details =
            await workspaceService.getWorkspaceDetails(
                workspaceId
            );

        return res.status(200).json({

            success: true,

            ...details

        });

    }

    catch (error) {

        console.error(
            "Get Workspace Details Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
ADD WORKSPACE MEMBER
==================================

POST /api/workspaces/:workspaceId/members

Body:

{
    "userId": "...",
    "alias": "...",
    "role": "member"
}

Requester:
    req.user.id

Only admin/owner can add.
==================================
*/

exports.addMember = async (req, res) => {

    try {

        const requesterId =
            getAuthenticatedUserId(req, res);

        if (!requesterId) {
            return;
        }

        const {
            workspaceId
        } = req.params;

        const {
            userId,
            alias,
            role
        } = req.body || {};

        if (!workspaceId) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: workspaceId is required."

            });
        }

        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: userId is required."

            });
        }

        /*
        Prevent assigning owner role through
        normal member-add endpoint.
        Ownership should remain controlled
        separately.
        */

        if (role === "owner") {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Owner role cannot be assigned through this endpoint."

            });
        }

        const member =
            await workspaceService.addMember(
                workspaceId,
                requesterId,
                {
                    userId,
                    alias,
                    role
                }
            );

        return res.status(201).json({

            success: true,

            member

        });

    }

    catch (error) {

        console.error(
            "Add Workspace Member Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
REMOVE WORKSPACE MEMBER
==================================

DELETE /api/workspaces/:workspaceId/members/:userId

:userId:
    Target member

Requester:
    req.user.id
==================================
*/

exports.removeMember = async (req, res) => {

    try {

        const requesterId =
            getAuthenticatedUserId(req, res);

        if (!requesterId) {
            return;
        }

        const {
            workspaceId,
            userId: targetUserId
        } = req.params;

        if (!workspaceId || !targetUserId) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: workspaceId and userId are required."

            });
        }

        await workspaceService.removeMember(
            workspaceId,
            requesterId,
            targetUserId
        );

        return res.status(200).json({

            success: true,

            message:
                "Member removed successfully."

        });

    }

    catch (error) {

        console.error(
            "Remove Workspace Member Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
CHANGE MEMBER ROLE
==================================

PATCH /api/workspaces/:workspaceId/members/:userId/role

Body:

{
    "role": "admin"
}

Requester:
    req.user.id

Only workspace owner.
==================================
*/

exports.changeRole = async (req, res) => {

    try {

        const requesterId =
            getAuthenticatedUserId(req, res);

        if (!requesterId) {
            return;
        }

        const {
            workspaceId,
            userId: targetUserId
        } = req.params;

        const {
            role
        } = req.body || {};

        if (!workspaceId || !targetUserId) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: workspaceId and userId are required."

            });
        }

        if (!role) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: role is required."

            });
        }

        /*
        Do not allow ownership transfer
        through the generic role endpoint.
        */

        if (role === "owner") {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Ownership transfer is not supported by this endpoint."

            });
        }

        const member =
            await workspaceService.changeRole(
                workspaceId,
                requesterId,
                targetUserId,
                role
            );

        return res.status(200).json({

            success: true,

            member

        });

    }

    catch (error) {

        console.error(
            "Change Workspace Role Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
LEAVE WORKSPACE
==================================

POST /api/workspaces/:workspaceId/leave

Requester:
    req.user.id
==================================
*/

exports.leaveWorkspace = async (req, res) => {

    try {

        const userId =
            getAuthenticatedUserId(req, res);

        if (!userId) {
            return;
        }

        const {
            workspaceId
        } = req.params;

        if (!workspaceService.isValidObjectId(workspaceId)) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Invalid workspace ID format."

            });
        }

        if (!workspaceId) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: workspaceId is required."

            });
        }

        await workspaceService.leaveWorkspace(
            workspaceId,
            userId
        );

        return res.status(200).json({

            success: true,

            message:
                "Left workspace successfully."

        });

    }

    catch (error) {

        console.error(
            "Leave Workspace Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
CREATE WORKSPACE SESSION
==================================

POST /api/workspaces/:workspaceId/sessions
==================================
*/

exports.createWorkspaceSession = async (req, res) => {

    try {

        const userId =
            getAuthenticatedUserId(req, res);

        if (!userId) {
            return;
        }

        const {
            workspaceId
        } = req.params;

        const {
            title,
            projectId,
            category
        } = req.body || {};

        if (!workspaceId) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: workspaceId is required."

            });
        }

        const session =
            await sessionService.createSession(
                userId,
                title || "New Chat",
                workspaceId,
                {
                    projectId,
                    category
                }
            );

        return res.status(201).json({

            success: true,

            session,

            activeSession: session._id

        });

    }

    catch (error) {

        console.error(
            "Create Workspace Session Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
GET WORKSPACE SESSIONS FOR
AUTHENTICATED USER
==================================

GET /api/workspaces/:workspaceId/sessions/me

User identity:
    req.user.id

This endpoint cannot access
another user's sessions.
==================================
*/

exports.getWorkspaceSessionsForUser = async (
    req,
    res
) => {

    try {

        const userId =
            getAuthenticatedUserId(req, res);

        if (!userId) {
            return;
        }

        const {
            workspaceId
        } = req.params;

        if (!workspaceId) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: workspaceId is required."

            });
        }

        /*
        Verify active membership first.
        */

        const member =
            await WorkspaceMember.findOne({
                workspaceId,
                userId,
                status: "active"
            });

        if (!member) {

            return res.status(403).json({

                success: false,

                message:
                    "Forbidden: Not an active workspace member."

            });
        }

        const sessions =
            await sessionService.getSessionsByUser(
                userId,
                workspaceId
            );

        return res.status(200).json({

            success: true,

            sessions

        });

    }

    catch (error) {

        console.error(
            "Get Workspace Sessions Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
GET ALL WORKSPACE SESSIONS
==================================

GET /api/workspaces/:workspaceId/sessions

Requester:
    req.user.id

Returns all sessions belonging
to this workspace.

Requester must be an active
workspace member.
==================================
*/

exports.getAllWorkspaceSessions = async (
    req,
    res
) => {

    try {

        const requesterId =
            getAuthenticatedUserId(req, res);

        if (!requesterId) {
            return;
        }

        const {
            workspaceId
        } = req.params;

        if (!workspaceId) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: workspaceId is required."

            });
        }

        /*
        ----------------------------------
        Verify active membership
        ----------------------------------
        */

        const member =
            await workspaceService.requireWorkspaceAdmin(
                workspaceId,
                requesterId
            );

        /*
        ----------------------------------
        Verify workspace exists
        ----------------------------------
        */

        const workspace =
            await Workspace.findOne({
                _id: workspaceId,
                isActive: true
            });

        if (!workspace) {

            return res.status(404).json({

                success: false,

                message:
                    "Not Found: Workspace not found or inactive."

            });
        }

        /*
        ----------------------------------
        Load workspace sessions
        ----------------------------------
        */

        const sessions =
            await Session.find({
                workspaceId,
                isDeleted: false
            })
                .sort({
                    updatedAt: -1
                })
                .lean();

        return res.status(200).json({

            success: true,

            sessions

        });

    }

    catch (error) {

        console.error(
            "Get All Workspace Sessions Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
GET WORKSPACE USAGE
==================================

GET /api/workspaces/:workspaceId/usage

Owner-only usage summary.
==================================
*/

exports.getWorkspaceUsage = async (
    req,
    res
) => {

    try {

        const userId =
            getAuthenticatedUserId(req, res);

        if (!userId) {
            return;
        }

        const {
            workspaceId
        } = req.params;

        await workspaceService.requireWorkspaceOwner(
            workspaceId,
            userId
        );

        const usage =
            await usageService.getWorkspaceUsage(
                workspaceId
            );

        return res.status(200).json({

            success: true,

            usage

        });

    }

    catch (error) {

        console.error(
            "Get Workspace Usage Error:",
            error
        );

        return handleError(
            res,
            error
        );
    }
};


/*
==================================
EXPORTS
==================================
*/

module.exports = exports;