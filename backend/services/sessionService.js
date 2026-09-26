const mongoose = require("mongoose");

const Session = require("../models/Session");
const Workspace = require("../models/Workspace");
const WorkspaceMember = require("../models/WorkspaceMember");
const Share = require("../models/Share");

let Project = null;

try {
    Project = require("../models/Project");
} catch (error) {
    Project = null;
}


/*
==================================
HELPERS
==================================
*/

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}


/*
==================================
SESSION ACCESS
==================================

Returns:

{
    allowed: true,
    session
}

OR

{
    allowed: false,
    status,
    message
}
==================================
*/

async function canAccessSession(userId, sessionId) {

    if (!isValidId(sessionId)) {
        return {
            allowed: false,
            status: 400,
            message: "Validation Error: Invalid session ID."
        };
    }

    /*
    ----------------------------------
    Anonymous personal session
    ----------------------------------

    Anonymous sessions are allowed only
    when the caller also has no identity.
    ----------------------------------
    */

    const session = await Session.findOne({
        _id: sessionId,
        isDeleted: false
    }).lean();

    if (!session) {
        return {
            allowed: false,
            status: 404,
            message: "Not Found: Session does not exist."
        };
    }


    /*
    ==================================
    PERSONAL SESSION
    ==================================
    */

    if (
        session.workspaceId === null ||
        session.workspaceId === undefined
    ) {

        /*
        Anonymous personal session
        */

        if (!session.userId) {

            if (userId === null || userId === undefined) {

                return {
                    allowed: true,
                    session
                };

            }

            return {
                allowed: false,
                status: 403,
                message:
                    "Forbidden: This personal session belongs to an anonymous user."
            };
        }


        /*
        Authenticated personal session
        */

        if (!userId || !isValidId(userId)) {

            return {
                allowed: false,
                status: 403,
                message:
                    "Forbidden: Authentication required to access this session."
            };

        }


        if (
            session.userId.toString() !==
            userId.toString()
        ) {

            return {
                allowed: false,
                status: 403,
                message:
                    "Forbidden: You do not have access to this session."
            };

        }


        return {
            allowed: true,
            session
        };
    }


    /*
    ==================================
    WORKSPACE SESSION
    ==================================
    */

    if (!userId || !isValidId(userId)) {

        return {
            allowed: false,
            status: 403,
            message:
                "Forbidden: Authentication required for workspace sessions."
        };

    }


    if (!isValidId(session.workspaceId)) {

        return {
            allowed: false,
            status: 403,
            message:
                "Forbidden: Invalid workspace associated with this session."
        };

    }


    /*
    ----------------------------------
    Verify workspace
    ----------------------------------
    */

    const workspace = await Workspace.findOne({
        _id: session.workspaceId,
        isActive: true
    }).lean();

    if (!workspace) {

        return {
            allowed: false,
            status: 404,
            message:
                "Not Found: Workspace does not exist or is inactive."
        };

    }


    /*
    ----------------------------------
    Verify active membership
    ----------------------------------
    */

    const member = await WorkspaceMember.findOne({
        workspaceId: session.workspaceId,
        userId,
        status: "active"
    }).lean();

    if (!member) {

        return {
            allowed: false,
            status: 403,
            message:
                "Forbidden: You are not an active member of this workspace."
        };

    }


    /*
    ----------------------------------
    Owner / admin access
    ----------------------------------
    */

    const isOwner =
        session.userId &&
        session.userId.toString() === userId.toString();

    const isAdmin =
        member.role === "owner" ||
        member.role === "admin";


    if (isOwner || isAdmin) {

        return {
            allowed: true,
            session
        };

    }


    /*
    ----------------------------------
    Explicit session share
    ----------------------------------
    */

    const share = await Share.findOne({
        workspaceId: session.workspaceId,
        resourceType: "session",
        resourceId: session._id,
        sharedWith: userId,
        isActive: true
    }).lean();


    if (!share) {

        return {
            allowed: false,
            status: 403,
            message:
                "Forbidden: This workspace session has not been shared with you."
        };

    }


    return {
        allowed: true,
        session,
        permission: share.permission || "view",
        shared: true
    };
}


/*
==================================
CREATE SESSION
==================================
*/

async function createSession(
    userId,
    title = "New Chat",
    workspaceId = null,
    options = {}
) {

    /*
    ----------------------------------
    Validate user
    ----------------------------------
    */

    if (
        userId !== null &&
        userId !== undefined &&
        !isValidId(userId)
    ) {

        throw new Error(
            "Validation Error: Invalid user ID."
        );

    }


    const sessionData = {

        userId:
            userId ?? null,

        title:
            title?.trim() || "New Chat"

    };


    /*
    ==================================
    PERSONAL SESSION
    ==================================
    */

    if (
        workspaceId === null ||
        workspaceId === undefined ||
        workspaceId === ""
    ) {

        sessionData.workspaceId = null;

        return await Session.create(
            sessionData
        );

    }


    /*
    ==================================
    WORKSPACE SESSION
    ==================================
    */

    if (!isValidId(workspaceId)) {

        throw new Error(
            "Validation Error: Invalid workspace ID."
        );

    }


    if (!userId) {

        throw new Error(
            "Forbidden: Authentication required for workspace sessions."
        );

    }


    /*
    ----------------------------------
    Validate workspace
    ----------------------------------
    */

    const workspace =
        await Workspace.findOne({
            _id: workspaceId,
            isActive: true
        });

    if (!workspace) {

        throw new Error(
            "Not Found: Workspace does not exist or is inactive."
        );

    }


    /*
    ----------------------------------
    Validate membership
    ----------------------------------
    */

    const member =
        await WorkspaceMember.findOne({
            workspaceId,
            userId,
            status: "active"
        });

    if (!member) {

        throw new Error(
            "Forbidden: User is not an active workspace member."
        );

    }


    /*
    ----------------------------------
    Validate category
    ----------------------------------
    */

    const allowedCategories = [
        "general",
        "coding",
        "design",
        "research",
        "planning",
        "debugging"
    ];

    if (
        options.category &&
        !allowedCategories.includes(
            options.category
        )
    ) {

        throw new Error(
            "Validation Error: Invalid session category."
        );

    }


    /*
    ----------------------------------
    Validate project
    ----------------------------------
    */

    if (options.projectId) {

        if (!Project) {

            throw new Error(
                "Validation Error: Project support is not available."
            );

        }


        if (!isValidId(options.projectId)) {

            throw new Error(
                "Validation Error: Invalid project ID."
            );

        }


        const project =
            await Project.findOne({
                _id: options.projectId,
                workspaceId,
                status: "active"
            });

        if (!project) {

            throw new Error(
                "Forbidden: Project does not belong to this workspace."
            );

        }


        sessionData.projectId =
            options.projectId;
    }


    /*
    ----------------------------------
    Workspace metadata
    ----------------------------------
    */

    sessionData.workspaceId =
        workspaceId;


    if (options.category) {

        sessionData.category =
            options.category;

    }


    return await Session.create(
        sessionData
    );
}


/*
==================================
GET PERSONAL SESSIONS
==================================
*/

async function getSessionsByUser(
    userId,
    workspaceId = null
) {

    /*
    Personal sessions only
    */

    if (
        workspaceId === null ||
        workspaceId === undefined
    ) {

        /*
        Anonymous user
        */

        if (userId === null || userId === undefined) {

            return await Session.find({
                userId: null,
                workspaceId: null,
                isDeleted: false
            })
                .sort({
                    updatedAt: -1
                })
                .lean();

        }


        /*
        Authenticated user
        */

        if (!isValidId(userId)) {

            throw new Error(
                "Validation Error: Invalid user ID."
            );

        }


        return await Session.find({

            userId,

            workspaceId: null,

            isDeleted: false

        })
            .sort({
                updatedAt: -1
            })
            .lean();
    }


    /*
    ==================================
    SPECIFIC WORKSPACE SESSIONS
    ==================================
    */

    if (!isValidId(userId)) {

        throw new Error(
            "Validation Error: Invalid user ID."
        );

    }


    if (!isValidId(workspaceId)) {

        throw new Error(
            "Validation Error: Invalid workspace ID."
        );

    }


    return await Session.find({

        userId,

        workspaceId,

        isDeleted: false

    })
        .sort({
            updatedAt: -1
        })
        .lean();
}


/*
==================================
GET WORKSPACE SESSIONS
==================================
*/

async function getWorkspaceSessions(
    userId,
    workspaceId
) {

    if (!isValidId(userId)) {

        throw new Error(
            "Validation Error: Invalid user ID."
        );

    }


    if (!isValidId(workspaceId)) {

        throw new Error(
            "Validation Error: Invalid workspace ID."
        );

    }


    /*
    ----------------------------------
    Workspace validation
    ----------------------------------
    */

    const workspace =
        await Workspace.findOne({
            _id: workspaceId,
            isActive: true
        });

    if (!workspace) {

        throw new Error(
            "Not Found: Workspace does not exist or is inactive."
        );

    }


    /*
    ----------------------------------
    Membership validation
    ----------------------------------
    */

    const member =
        await WorkspaceMember.findOne({
            workspaceId,
            userId,
            status: "active"
        });

    if (!member) {

        throw new Error(
            "Forbidden: Not an active workspace member."
        );

    }


    /*
    ----------------------------------
    Fetch sessions
    ----------------------------------
    */

    return await Session.find({

        workspaceId,

        isDeleted: false

    })
        .sort({
            updatedAt: -1
        })
        .lean();
}


/*
==================================
GET SESSION BY ID
==================================

This remains a low-level lookup.

Controllers that need authorization
must use canAccessSession().
==================================
*/

async function getSessionById(
    sessionId
) {

    if (!isValidId(sessionId)) {

        throw new Error(
            "Validation Error: Invalid session ID."
        );

    }


    return await Session.findOne({

        _id: sessionId,

        isDeleted: false

    }).lean();
}


/*
==================================
RENAME SESSION
==================================
*/

async function renameSession(
    sessionId,
    title
) {

    if (!isValidId(sessionId)) {

        throw new Error(
            "Validation Error: Invalid session ID."
        );

    }


    if (!title?.trim()) {

        throw new Error(
            "Validation Error: Session title is required."
        );

    }


    return await Session.findOneAndUpdate(

        {
            _id: sessionId,
            isDeleted: false
        },

        {
            title: title.trim(),
            updatedAt: new Date()
        },

        {
            new: true
        }

    );
}


/*
==================================
UPDATE LAST MESSAGE
==================================
*/

async function updateLastMessage(
    sessionId,
    lastMessage,
    lastModel
) {

    if (!isValidId(sessionId)) {

        throw new Error(
            "Validation Error: Invalid session ID."
        );

    }


    return await Session.findOneAndUpdate(

        {
            _id: sessionId,
            isDeleted: false
        },

        {
            lastMessage,
            lastModel,
            updatedAt: new Date()
        },

        {
            new: true
        }

    );
}


/*
==================================
TOUCH SESSION
==================================
*/

async function touchSession(
    sessionId
) {

    if (!isValidId(sessionId)) {

        throw new Error(
            "Validation Error: Invalid session ID."
        );

    }


    return await Session.findOneAndUpdate(

        {
            _id: sessionId,
            isDeleted: false
        },

        {
            updatedAt: new Date()
        },

        {
            new: true
        }

    );
}


/*
==================================
PIN SESSION
==================================
*/

async function pinSession(
    sessionId,
    isPinned
) {

    if (!isValidId(sessionId)) {

        throw new Error(
            "Validation Error: Invalid session ID."
        );

    }


    return await Session.findOneAndUpdate(

        {
            _id: sessionId,
            isDeleted: false
        },

        {
            isPinned: Boolean(isPinned),
            updatedAt: new Date()
        },

        {
            new: true
        }

    );
}


/*
==================================
ARCHIVE SESSION
==================================
*/

async function archiveSession(
    sessionId,
    isArchived
) {

    if (!isValidId(sessionId)) {

        throw new Error(
            "Validation Error: Invalid session ID."
        );

    }


    return await Session.findOneAndUpdate(

        {
            _id: sessionId,
            isDeleted: false
        },

        {
            isArchived: Boolean(isArchived),
            updatedAt: new Date()
        },

        {
            new: true
        }

    );
}


/*
==================================
DELETE SESSION
==================================
*/

async function deleteSession(
    sessionId
) {

    if (!isValidId(sessionId)) {

        throw new Error(
            "Validation Error: Invalid session ID."
        );

    }


    return await Session.findOneAndUpdate(

        {
            _id: sessionId,
            isDeleted: false
        },

        {
            isDeleted: true,
            updatedAt: new Date()
        },

        {
            new: true
        }

    );
}


/*
==================================
RESTORE SESSION
==================================
*/

async function restoreSession(
    sessionId
) {

    if (!isValidId(sessionId)) {

        throw new Error(
            "Validation Error: Invalid session ID."
        );

    }


    return await Session.findOneAndUpdate(

        {
            _id: sessionId
        },

        {
            isDeleted: false,
            updatedAt: new Date()
        },

        {
            new: true
        }

    );
}


/*
==================================
EXPORTS
==================================
*/

module.exports = {

    canAccessSession,

    createSession,

    getSessionsByUser,

    getWorkspaceSessions,

    getSessionById,

    renameSession,

    updateLastMessage,

    touchSession,

    pinSession,

    archiveSession,

    deleteSession,

    restoreSession

};
