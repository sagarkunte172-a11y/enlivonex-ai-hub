/*
==================================
Session Controller
MongoDB + JWT Version
==================================
*/

const {
    createSession,
    getSessionsByUser,
    canAccessSession,
    deleteSession
} = require("../services/sessionService");

const {
    getMessages
} = require("../services/messageService");


/*
==================================
ERROR HANDLER
==================================
*/

function handleControllerError(
    res,
    error,
    fallbackMessage
) {

    console.error(
        fallbackMessage,
        error
    );


    const message =
        error?.message ||
        fallbackMessage;


    /*
    ==================================
    Validation
    ==================================
    */

    if (
        message.startsWith(
            "Validation Error:"
        )
    ) {

        return res.status(400).json({

            success: false,

            message

        });

    }


    /*
    ==================================
    Forbidden
    ==================================
    */

    if (
        message.startsWith(
            "Forbidden:"
        )
    ) {

        return res.status(403).json({

            success: false,

            message

        });

    }


    /*
    ==================================
    Not Found
    ==================================
    */

    if (
        message.startsWith(
            "Not Found:"
        )
    ) {

        return res.status(404).json({

            success: false,

            message

        });

    }


    /*
    ==================================
    Conflict
    ==================================
    */

    if (
        message.startsWith(
            "Conflict:"
        )
    ) {

        return res.status(409).json({

            success: false,

            message

        });

    }


    /*
    ==================================
    Unauthorized
    ==================================
    */

    if (
        message.startsWith(
            "Unauthorized:"
        )
    ) {

        return res.status(401).json({

            success: false,

            message

        });

    }


    /*
    ==================================
    Internal Error
    ==================================
    */

    return res.status(500).json({

        success: false,

        message: fallbackMessage

    });

}


/*
==================================
AUTHENTICATED USER HELPER
==================================
*/

function getAuthenticatedUserId(req) {

    /*
    ==================================
    IMPORTANT SECURITY RULE

    NEVER trust:

    req.body.userId
    req.query.userId
    req.params.userId

    User identity comes ONLY from JWT.
    ==================================
    */

    const userId =
        req.user?.id;


    if (!userId) {

        throw new Error(
            "Unauthorized: Authenticated user identity is missing"
        );

    }


    return userId;

}


/*
==================================
GET ALL PERSONAL SESSIONS
==================================

GET:

/api/sessions

Identity:

req.user.id

Only personal sessions belonging
to the authenticated user should
be returned.
==================================
*/

async function getSessions(req, res) {

    try {

        const userId =
            getAuthenticatedUserId(req);


        /*
        ==================================
        workspaceId = null

        This endpoint intentionally returns
        PERSONAL sessions only.
        ==================================
        */

        const sessions =
            await getSessionsByUser(
                userId,
                null
            );


        return res.status(200).json({

            success: true,

            sessions,

            activeSession:
                sessions.length > 0
                    ? sessions[0]._id
                    : null

        });

    } catch (error) {

        return handleControllerError(
            res,
            error,
            "Failed to load sessions."
        );

    }

}


/*
==================================
CREATE NEW PERSONAL SESSION
==================================

POST:

/api/session/new

Identity:

req.user.id

IMPORTANT:

The normal solo endpoint creates
a PERSONAL session.

Workspace sessions should use
the dedicated workspace endpoint.
==================================
*/

async function createNewSession(
    req,
    res
) {

    try {

        const userId =
            getAuthenticatedUserId(req);


        /*
        ==================================
        IMPORTANT

        Do NOT allow the frontend to turn
        this personal endpoint into an
        arbitrary workspace session.

        Workspace sessions should be
        created through workspaceController.
        ==================================
        */

        const session =
            await createSession(
                userId,
                "New Chat",
                null
            );


        return res.status(201).json({

            success: true,

            session,

            activeSession:
                session._id

        });

    } catch (error) {

        return handleControllerError(
            res,
            error,
            "Failed to create session."
        );

    }

}


/*
==================================
SWITCH SESSION
==================================

POST:

/api/session/switch

Body:

{
    sessionId
}

Identity:

req.user.id
==================================
*/

async function switchSession(
    req,
    res
) {

    try {

        const userId =
            getAuthenticatedUserId(req);


        const {
            sessionId
        } = req.body || {};


        if (!sessionId) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Session ID is required."

            });

        }


        /*
        ==================================
        CENTRALIZED ACCESS CHECK
        ==================================
        */

        const access =
            await canAccessSession(
                userId,
                sessionId
            );


        if (
            !access ||
            !access.allowed
        ) {

            return res.status(
                access?.status || 403
            ).json({

                success: false,

                message:
                    access?.message ||
                    "Forbidden: You cannot access this session."

            });

        }


        /*
        ==================================
        LOAD SESSION MESSAGES
        ==================================
        */

        const messages =
            await getMessages(
                sessionId
            );


        return res.status(200).json({

            success: true,

            activeSession:
                access.session._id,

            session:
                access.session,

            messages

        });

    } catch (error) {

        return handleControllerError(
            res,
            error,
            "Failed to switch session."
        );

    }

}


/*
==================================
DELETE PERSONAL SESSION
==================================

DELETE:

/api/session/:id

Identity:

req.user.id
==================================
*/

async function deleteChatSession(
    req,
    res
) {

    try {

        const userId =
            getAuthenticatedUserId(req);


        const {
            id
        } = req.params;


        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Session ID is required."

            });

        }


        /*
        ==================================
        VERIFY ACCESS FIRST
        ==================================
        */

        const access =
            await canAccessSession(
                userId,
                id
            );


        if (
            !access ||
            !access.allowed
        ) {

            return res.status(
                access?.status || 403
            ).json({

                success: false,

                message:
                    access?.message ||
                    "Forbidden: You cannot delete this session."

            });

        }


        /*
        ==================================
        IMPORTANT

        Only personal sessions should be
        deleted through this endpoint.

        Workspace session deletion should
        be handled by workspace permissions.
        ==================================
        */

        if (
            access.session.workspaceId
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Forbidden: Workspace sessions must be managed through workspace controls."

            });

        }


        /*
        ==================================
        DELETE
        ==================================
        */

        const deleted =
            await deleteSession(
                id
            );


        if (!deleted) {

            return res.status(404).json({

                success: false,

                message:
                    "Not Found: Session not found."

            });

        }


        /*
        ==================================
        RETURN REMAINING PERSONAL SESSIONS
        ==================================
        */

        const sessions =
            await getSessionsByUser(
                userId,
                null
            );


        return res.status(200).json({

            success: true,

            sessions,

            activeSession:
                sessions.length > 0
                    ? sessions[0]._id
                    : null

        });

    } catch (error) {

        return handleControllerError(
            res,
            error,
            "Failed to delete session."
        );

    }

}


/*
==================================
GET SINGLE SESSION
==================================

GET:

/api/session/:id

Identity:

req.user.id
==================================
*/

async function getSingleSession(
    req,
    res
) {

    try {

        const userId =
            getAuthenticatedUserId(req);


        const {
            id
        } = req.params;


        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Session ID is required."

            });

        }


        /*
        ==================================
        CENTRALIZED ACCESS CHECK
        ==================================
        */

        const access =
            await canAccessSession(
                userId,
                id
            );


        if (
            !access ||
            !access.allowed
        ) {

            return res.status(
                access?.status || 403
            ).json({

                success: false,

                message:
                    access?.message ||
                    "Forbidden: You cannot access this session."

            });

        }


        /*
        ==================================
        LOAD MESSAGES
        ==================================
        */

        const messages =
            await getMessages(
                id
            );


        return res.status(200).json({

            success: true,

            session:
                access.session,

            messages

        });

    } catch (error) {

        return handleControllerError(
            res,
            error,
            "Failed to load session."
        );

    }

}


/*
==================================
EXPORTS
==================================
*/

module.exports = {

    getSessions,

    createNewSession,

    switchSession,

    deleteChatSession,

    getSingleSession

};