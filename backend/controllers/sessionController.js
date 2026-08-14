/*
==================================
Session Controller
MongoDB Version
==================================
*/

const {

    createSession,
    getSessionsByUser,
    getSessionById,
    deleteSession

} = require("../services/sessionService");

const {

    getMessages

} = require("../services/messageService");

/*
==================================
Get All Sessions
==================================
*/

async function getSessions(req, res) {

    try {

        const sessions = await getSessionsByUser();

        return res.json({

            success: true,

            sessions,

            activeSession:

                sessions.length > 0
                    ? sessions[0]._id
                    : null

        });

    }

    catch (error) {

        console.error("Get Sessions Error:", error);

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

        const session = await createSession();

        return res.status(201).json({

            success: true,

            session,

            activeSession: session._id

        });

    }

    catch (error) {

        console.error("Create Session Error:", error);

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

        const { sessionId } = req.body;

        if (!sessionId) {

            return res.status(400).json({

                success: false,

                message: "Session ID is required."

            });

        }

        const session = await getSessionById(sessionId);

        if (!session) {

            return res.status(404).json({

                success: false,

                message: "Session not found."

            });

        }

        const messages = await getMessages(sessionId);

        return res.json({

            success: true,

            activeSession: sessionId,

            session,

            messages

        });

    }

    catch (error) {

        console.error("Switch Session Error:", error);

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

        const { id } = req.params;

        const deleted = await deleteSession(id);

        if (!deleted) {

            return res.status(404).json({

                success: false,

                message: "Session not found."

            });

        }

        const sessions = await getSessionsByUser();

        return res.json({

            success: true,

            sessions,

            activeSession:

                sessions.length > 0
                    ? sessions[0]._id
                    : null

        });

    }

    catch (error) {

        console.error("Delete Session Error:", error);

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

        const { id } = req.params;

        const session = await getSessionById(id);

        if (!session) {

            return res.status(404).json({

                success: false,

                message: "Session not found."

            });

        }

        const messages = await getMessages(id);

        return res.json({

            success: true,

            session,

            messages

        });

    }

    catch (error) {

        console.error("Get Session Error:", error);

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