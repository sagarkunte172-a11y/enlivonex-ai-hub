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
            message:
                "Unauthorized: Authentication required."
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

Accepted identifiers:

- userId
- identifier
- email
- username
- nickname

The service resolves these to the
stable internal User._id.

Requester:
    req.user.id
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
            identifier,
            email,
            username,
            nickname,
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

        const targetIdentifier =
            identifier ||
            userId ||
            email ||
            username ||
            nickname;

        if (
            typeof targetIdentifier !== "string" ||
            !targetIdentifier.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Enl ID, email, username, nickname, or user ID is required."

            });
        }

        /*
        ----------------------------------
        Prevent assigning owner role
        ----------------------------------
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
                    identifier,
                    email,
                    username,
                    nickname,
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

exports.searchWorkspaceUsers = async (req, res) => {
    try {
        const requesterId = getAuthenticatedUserId(req, res);
        if (!requesterId) return;

        const { workspaceId } = req.params;
        const users = await workspaceService.searchWorkspaceUsers(
            workspaceId,
            requesterId,
            req.query?.query
        );

        return res.status(200).json({ success: true, users });
    } catch (error) {
        return handleError(res, error);
    }
};


/*
==================================
REMOVE WORKSPACE MEMBER
==================================

DELETE /api/workspaces/:workspaceId/members/:userId
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
DELETE WORKSPACE
==================================

DELETE /api/workspaces/:workspaceId

Only the workspace owner can
delete the workspace.

The service performs the actual
authorization and workspace-scoped
cleanup.

IMPORTANT:

This endpoint only deletes records
belonging to the specified workspace.

Solo/personal Chat and Code
Assistant data is NOT deleted.
==================================
*/

exports.deleteWorkspace = async (req, res) => {

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

        if (
            !workspaceService.isValidObjectId(
                workspaceId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Invalid workspace ID format."

            });
        }

        const result =
            await workspaceService.deleteWorkspace(
                workspaceId,
                userId
            );

        return res.status(200).json({

            success: true,

            message:
                "Workspace deleted successfully.",

            result

        });

    }

    catch (error) {

        console.error(
            "Delete Workspace Error:",
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

            activeSession:
                session._id

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

Requester must be admin/owner.
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

        await workspaceService.requireWorkspaceAdmin(
            workspaceId,
            requesterId
        );

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
