/*
==================================
Session Controller
Enlivonex AI Hub
==================================
*/

const {

    createSession,
    deleteSession,
    getAllSessions,
    getSession,
    getMessages,
    setActiveSession,
    getActiveSessionId
    ,
    addAIMessage

} = require("../memory/sessionManager");

const { chooseModel } = require("../services/modelRouter");

/*
==================================
Get All Sessions
==================================
*/

function getSessions(req, res) {

    return res.json({

        success: true,

        sessions: getAllSessions(),

        activeSession: getActiveSessionId()

    });

}

/*
==================================
Create New Session
==================================
*/

function createNewSession(req, res) {

    const session = createSession();

    // Add an initial AI/system welcome message and attach default model info
    try {
        const defaultModel = chooseModel("");
        addAIMessage(session.id, "👋 New chat started.", defaultModel);
    }
    catch (err) {
        console.error("Failed to add initial AI message:", err);
    }

    return res.json({

        success: true,

        session,

        activeSession: session.id

    });

}

/*
==================================
Switch Session
==================================
*/

function switchSession(req, res) {

    const { sessionId } = req.body;

    if (!sessionId) {

        return res.status(400).json({

            success: false,

            message: "Session ID is required."

        });

    }

    const success = setActiveSession(sessionId);

    if (!success) {

        return res.status(404).json({

            success: false,

            message: "Session not found."

        });

    }

    return res.json({

        success: true,

        activeSession: sessionId,

        messages: getMessages(sessionId)

    });

}

/*
==================================
Delete Session
==================================
*/

function deleteChatSession(req, res) {

    const { id } = req.params;

    const success = deleteSession(id);

    if (!success) {

        return res.status(404).json({

            success: false,

            message: "Session not found."

        });

    }

    return res.json({

        success: true,

        sessions: getAllSessions(),

        activeSession: getActiveSessionId()

    });

}

/*
==================================
Get Single Session
==================================
*/

function getSingleSession(req, res) {

    const { id } = req.params;

    const session = getSession(id);

    if (!session) {

        return res.status(404).json({

            success: false,

            message: "Session not found."

        });

    }

    return res.json({

        success: true,

        session,

        messages: getMessages(id)

    });

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