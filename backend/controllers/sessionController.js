/*
==================================
Session Controller
MongoDB Version
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
Get All Personal Sessions
==================================
*/

async function getSessions(req, res) {

    try {

        /*
        ==================================
        Trusted Identity
        ==================================

        Identity MUST come from authentication
        middleware. Never trust userId from
        query parameters or request body.
        */

        const userId = req.user.id;

        const sessions = await getSessionsByUser(
            userId,
            null
        );

        return res.json({

            success: true,

            sessions,

            activeSession:
                sessions.length > 0
                    ? sessions[0]._id
                    : null

        });

    } catch (error) {

        console.error(
            "Get Sessions Error:",
            error
        );

        if (
            error.message?.startsWith(
                "Validation Error:"
            )
        ) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        return res.status(500).json({

            success: false,

            message: "Failed to load sessions."

        });

    }

}


/*
==================================
Create New Session
==================================
*/

async function createNewSession(req, res) {

    try {

        /*
        ==================================
        Trusted Identity
        ==================================
        */

        const userId = req.user.id;


        /*
        ==================================
        Workspace ID
        ==================================
        */

        const {
            workspaceId
        } = req.body || {};


        /*
        ==================================
        Create Session
        ==================================
        */

        const session = await createSession(
            userId,
            "New Chat",
            workspaceId || null
        );


        return res.status(201).json({

            success: true,

            session,

            activeSession: session._id

        });

    } catch (error) {

        console.error(
            "Create Session Error:",
            error
        );

        if (
            error.message?.startsWith(
                "Validation Error:"
            )
        ) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        if (
            error.message?.startsWith(
                "Forbidden:"
            )
        ) {

            return res.status(403).json({

                success: false,

                message: error.message

            });

        }

        if (
            error.message?.startsWith(
                "Not Found:"
            )
        ) {

            return res.status(404).json({

                success: false,

                message: error.message

            });

        }

        return res.status(500).json({

            success: false,

            message: "Failed to create session."

        });

    }

}


/*
==================================
Switch Session
==================================
*/

async function switchSession(req, res) {

    try {

        const {
            sessionId
        } = req.body || {};


        if (!sessionId) {

            return res.status(400).json({

                success: false,

                message: "Session ID is required."

            });

        }


        /*
        ==================================
        Trusted Identity
        ==================================
        */

        const userId = req.user.id;


        /*
        ==================================
        Access Check
        ==================================
        */

        const access = await canAccessSession(
            userId,
            sessionId
        );


        if (!access.allowed) {

            return res.status(
                access.status
            ).json({

                success: false,

                message: access.message

            });

        }


        /*
        ==================================
        Load Messages
        ==================================
        */

        const messages = await getMessages(
            sessionId
        );


        return res.json({

            success: true,

            activeSession: sessionId,

            session: access.session,

            messages

        });

    } catch (error) {

        console.error(
            "Switch Session Error:",
            error
        );

        if (
            error.message?.startsWith(
                "Validation Error:"
            )
        ) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        return res.status(500).json({

            success: false,

            message: "Failed to switch session."

        });

    }

}


/*
==================================
Delete Session
==================================
*/

async function deleteChatSession(req, res) {

    try {

        const {
            id
        } = req.params;


        /*
        ==================================
        Trusted Identity
        ==================================
        */

        const userId = req.user.id;


        /*
        ==================================
        Access Validation
        ==================================
        */

        const access = await canAccessSession(
            userId,
            id
        );


        if (!access.allowed) {

            return res.status(
                access.status
            ).json({

                success: false,

                message: access.message

            });

        }


        /*
        ==================================
        Delete Session
        ==================================
        */

        const deleted = await deleteSession(id);


        if (!deleted) {

            return res.status(404).json({

                success: false,

                message: "Session not found."

            });

        }


        /*
        ==================================
        Return Remaining Personal Sessions
        ==================================
        */

        const sessions = await getSessionsByUser(
            userId,
            null
        );


        return res.json({

            success: true,

            sessions,

            activeSession:
                sessions.length > 0
                    ? sessions[0]._id
                    : null

        });

    } catch (error) {

        console.error(
            "Delete Session Error:",
            error
        );

        if (
            error.message?.startsWith(
                "Validation Error:"
            )
        ) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        return res.status(500).json({

            success: false,

            message: "Failed to delete session."

        });

    }

}


/*
==================================
Get Single Session
==================================
*/

async function getSingleSession(req, res) {

    try {

        const {
            id
        } = req.params;


        /*
        ==================================
        Trusted Identity
        ==================================
        */

        const userId = req.user.id;


        /*
        ==================================
        Access Validation
        ==================================
        */

        const access = await canAccessSession(
            userId,
            id
        );


        if (!access.allowed) {

            return res.status(
                access.status
            ).json({

                success: false,

                message: access.message

            });

        }


        /*
        ==================================
        Load Messages
        ==================================
        */

        const messages = await getMessages(id);


        return res.json({

            success: true,

            session: access.session,

            messages

        });

    } catch (error) {

        console.error(
            "Get Session Error:",
            error
        );

        if (
            error.message?.startsWith(
                "Validation Error:"
            )
        ) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        return res.status(500).json({

            success: false,

            message: "Failed to load session."

        });

    }

}


/*
==================================
Exports
==================================
*/

module.exports = {

    getSessions,

    createNewSession,

    switchSession,

    deleteChatSession,

    getSingleSession

};