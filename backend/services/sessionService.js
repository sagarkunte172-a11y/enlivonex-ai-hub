const mongoose = require("mongoose");

const Session = require("../models/Session");
const Workspace = require("../models/Workspace");
const WorkspaceMember = require("../models/WorkspaceMember");
const Share = require("../models/Share");
const Project = require("../models/Project");


/*
==================================
ObjectId Validator
==================================
*/

function isValidId(id) {

    return Boolean(
        id &&
        mongoose.Types.ObjectId.isValid(id)
    );

}


/*
==================================
Access Validator
==================================

Determines whether an authenticated
user can access a session.

Personal session:
    Only session owner.

Workspace session:
    Any active workspace member.

Authentication identity must come
from the server-side authenticated
request and NOT from client data.
==================================
*/

async function canAccessSession(
    userId,
    sessionId
) {

    if (userId !== null && !isValidId(userId)) {

        return {
            allowed: false,
            status: 401,
            message:
                "Unauthorized: Invalid user identity."
        };

    }


    if (!isValidId(sessionId)) {

        return {
            allowed: false,
            status: 400,
            message:
                "Validation Error: Invalid session ID."
        };

    }


    const session =
        await Session.findOne({

            _id: sessionId,

            isDeleted: false

        });


    if (!session) {

        return {
            allowed: false,
            status: 404,
            message:
                "Session not found."
        };

    }


    /*
    ==================================
    Personal Session
    ==================================
    */

    if (!session.workspaceId) {

        if (
            (session.userId || userId) &&
            (!session.userId || !userId ||
                session.userId.toString() !==
                    userId.toString())
        ) {

            return {
                allowed: false,
                status: 403,
                message:
                    "Forbidden: Personal session access denied."
            };

        }


        return {

            allowed: true,

            session

        };

    }


    /*
    ==================================
    Workspace Session
    ==================================
    */

    const workspace =
        await Workspace.findOne({

            _id:
                session.workspaceId,

            isActive: true

        });


    if (!workspace) {

        return {

            allowed: false,

            status: 404,

            message:
                "Workspace not found or inactive."

        };

    }


    const member =
        await WorkspaceMember.findOne({

            workspaceId:
                session.workspaceId,

            userId,

            status:
                "active"

        });


    if (!member) {

        return {

            allowed: false,

            status: 403,

            message:
                "Forbidden: Not an active workspace member."

        };

    }

    const isOwner =
        session.userId &&
        session.userId.toString() === userId.toString();

    const hasElevatedAccess =
        member.role === "owner" ||
        member.role === "admin";

    if (!isOwner && !hasElevatedAccess) {

        const share =
            await Share.findOne({
                workspaceId: session.workspaceId,
                resourceType: "session",
                resourceId: session._id,
                sharedWith: userId,
                isActive: true
            });

        if (!share) {

            return {
                allowed: false,
                status: 403,
                message:
                    "Forbidden: Workspace session access has not been shared with this member."
            };
        }
    }


    return {

        allowed: true,

        session

    };

}


/*
==================================
Create Session
==================================
*/

async function createSession(

    userId,

    title = "New Chat",

    workspaceId = null,

    options = {}

) {

    try {

        /*
        ==================================
        User Validation
        ==================================
        */

        if (userId !== null && !isValidId(userId)) {

            throw new Error(
                "Validation Error: Invalid user ID."
            );

        }


        /*
        ==================================
        Session Data
        ==================================
        */

        const sessionData = {

            userId,

            title:
                title?.trim() || "New Chat"

        };


        /*
        ==================================
        Personal Session
        ==================================
        */

        if (!workspaceId) {

            return await Session.create(
                sessionData
            );

        }

        if (
            options.projectId &&
            !isValidId(options.projectId)
        ) {

            throw new Error(
                "Validation Error: Invalid project ID."
            );
        }

        if (
            options.category &&
            ![
                "general",
                "coding",
                "design",
                "research",
                "planning",
                "debugging"
            ].includes(options.category)
        ) {

            throw new Error(
                "Validation Error: Invalid session category."
            );
        }


        /*
        ==================================
        Workspace ID Validation
        ==================================
        */

        if (!isValidId(workspaceId)) {

            throw new Error(
                "Validation Error: Invalid workspace ID."
            );

        }


        /*
        ==================================
        Workspace Validation
        ==================================
        */

        const workspace =
            await Workspace.findOne({

                _id:
                    workspaceId,

                isActive:
                    true

            });


        if (!workspace) {

            throw new Error(
                "Not Found: Workspace does not exist or is inactive."
            );

        }


        /*
        ==================================
        Membership Validation
        ==================================
        */

        const member =
            await WorkspaceMember.findOne({

                workspaceId,

                userId,

                status:
                    "active"

            });


        if (!member) {

            throw new Error(
                "Forbidden: User is not an active workspace member."
            );

        }


        /*
        ==================================
        Create Workspace Session
        ==================================
        */

        sessionData.workspaceId =
            workspaceId;

        if (options.projectId) {

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

        if (options.category) {
            sessionData.category =
                options.category;
        }


        return await Session.create(
            sessionData
        );

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Get Sessions By User
==================================

Personal sessions:
    userId + workspaceId null

Workspace sessions:
    userId ownership is NOT enough,
    therefore workspace sessions are
    retrieved separately through
    getWorkspaceSessions().
==================================
*/

async function getSessionsByUser(

    userId,

    workspaceId = null

) {

    try {

        if (userId !== null && !isValidId(userId)) {

            throw new Error(
                "Validation Error: Invalid user ID."
            );

        }


        const filter = {

            isDeleted:
                false,

            userId

        };


        /*
        ==================================
        Personal Sessions
        ==================================
        */

        if (
            workspaceId === null ||
            workspaceId === undefined
        ) {

            filter.workspaceId =
                null;

        }


        /*
        ==================================
        Specific Workspace
        ==================================
        */

        else {

            if (!isValidId(workspaceId)) {

                throw new Error(
                    "Validation Error: Invalid workspace ID."
                );

            }

            filter.workspaceId =
                workspaceId;

        }


        return await Session.find(
            filter
        )
            .sort({

                updatedAt:
                    -1

            })
            .lean();

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Get Workspace Sessions
==================================

Returns sessions belonging to an
active workspace that the user is
currently a member of.
==================================
*/

async function getWorkspaceSessions(

    userId,

    workspaceId

) {

    try {

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
        ==================================
        Workspace Validation
        ==================================
        */

        const workspace =
            await Workspace.findOne({

                _id:
                    workspaceId,

                isActive:
                    true

            });


        if (!workspace) {

            throw new Error(
                "Not Found: Workspace does not exist or is inactive."
            );

        }


        /*
        ==================================
        Membership Validation
        ==================================
        */

        const member =
            await WorkspaceMember.findOne({

                workspaceId,

                userId,

                status:
                    "active"

            });


        if (!member) {

            throw new Error(
                "Forbidden: Not an active workspace member."
            );

        }


        /*
        ==================================
        Fetch Sessions
        ==================================
        */

        return await Session.find({

            workspaceId,

            isDeleted:
                false

        })
            .sort({

                updatedAt:
                    -1

            })
            .lean();

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Get Session By ID
==================================
*/

async function getSessionById(
    sessionId
) {

    try {

        if (!isValidId(sessionId)) {

            throw new Error(
                "Validation Error: Invalid session ID."
            );

        }


        return await Session.findOne({

            _id:
                sessionId,

            isDeleted:
                false

        });

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Rename Session
==================================

NOTE:
Authorization must be checked by
the controller/service caller before
calling this mutation.
==================================
*/

async function renameSession(

    sessionId,

    title

) {

    try {

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

                _id:
                    sessionId,

                isDeleted:
                    false

            },

            {

                title:
                    title.trim(),

                updatedAt:
                    new Date()

            },

            {

                new:
                    true

            }

        );

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Update Last Message
==================================
*/

async function updateLastMessage(

    sessionId,

    lastMessage,

    lastModel

) {

    try {

        if (!isValidId(sessionId)) {

            throw new Error(
                "Validation Error: Invalid session ID."
            );

        }


        return await Session.findOneAndUpdate(

            {

                _id:
                    sessionId,

                isDeleted:
                    false

            },

            {

                lastMessage,

                lastModel,

                updatedAt:
                    new Date()

            },

            {

                new:
                    true

            }

        );

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Touch Session
==================================
*/

async function touchSession(

    sessionId

) {

    try {

        if (!isValidId(sessionId)) {

            throw new Error(
                "Validation Error: Invalid session ID."
            );

        }


        return await Session.findOneAndUpdate(

            {

                _id:
                    sessionId,

                isDeleted:
                    false

            },

            {

                updatedAt:
                    new Date()

            },

            {

                new:
                    true

            }

        );

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Pin Session
==================================
*/

async function pinSession(

    sessionId,

    isPinned

) {

    try {

        if (!isValidId(sessionId)) {

            throw new Error(
                "Validation Error: Invalid session ID."
            );

        }


        return await Session.findOneAndUpdate(

            {

                _id:
                    sessionId,

                isDeleted:
                    false

            },

            {

                isPinned:
                    Boolean(isPinned),

                updatedAt:
                    new Date()

            },

            {

                new:
                    true

            }

        );

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Archive Session
==================================
*/

async function archiveSession(

    sessionId,

    isArchived

) {

    try {

        if (!isValidId(sessionId)) {

            throw new Error(
                "Validation Error: Invalid session ID."
            );

        }


        return await Session.findOneAndUpdate(

            {

                _id:
                    sessionId,

                isDeleted:
                    false

            },

            {

                isArchived:
                    Boolean(isArchived),

                updatedAt:
                    new Date()

            },

            {

                new:
                    true

            }

        );

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Soft Delete Session
==================================
*/

async function deleteSession(

    sessionId

) {

    try {

        if (!isValidId(sessionId)) {

            throw new Error(
                "Validation Error: Invalid session ID."
            );

        }


        return await Session.findOneAndUpdate(

            {

                _id:
                    sessionId,

                isDeleted:
                    false

            },

            {

                isDeleted:
                    true,

                updatedAt:
                    new Date()

            },

            {

                new:
                    true

            }

        );

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Restore Session
==================================
*/

async function restoreSession(

    sessionId

) {

    try {

        if (!isValidId(sessionId)) {

            throw new Error(
                "Validation Error: Invalid session ID."
            );

        }


        return await Session.findOneAndUpdate(

            {

                _id:
                    sessionId

            },

            {

                isDeleted:
                    false,

                updatedAt:
                    new Date()

            },

            {

                new:
                    true

            }

        );

    }

    catch (error) {

        throw error;

    }

}


/*
==================================
Exports
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