/*
==================================
Session Controller
Enlivonex AI Hub
==================================
*/

const {

    createSession,
    getSessionsByUser,
    getSessionById,
    deleteSession

} = require("../services/sessionService");

const {

    getMessages,
    saveMessage

} = require("../services/messageService");

const {

    chooseModel

} = require("../services/modelRouter");

/*
==================================
Temporary User
(Authentication Phase Tak)
==================================
*/

const TEMP_USER_ID = null;

/*
==================================
Get All Sessions
==================================
*/

async function getSessions(req, res) {

    try {

        const sessions = await getSessionsByUser(TEMP_USER_ID);

        return res.json({

            success: true,

            sessions

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

        const session = await createSession(

            TEMP_USER_ID,

            "New Chat"

        );

        const defaultModel = chooseModel("");

        /*
        ==================================
        Save Welcome Message
        ==================================
        */

        await saveMessage(

            session._id,

            "assistant",

            "👋 New chat started. How can I help you today?",

            {

                name: defaultModel.name,

                id: defaultModel.model,

                reason: defaultModel.reason

            }

        );

        return res.json({

            success: true,

            session

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

        const sessions = await getSessionsByUser(

            TEMP_USER_ID

        );

        return res.json({

            success: true,

            sessions

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