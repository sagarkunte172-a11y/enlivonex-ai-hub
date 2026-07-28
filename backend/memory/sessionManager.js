/*
==================================
Session Manager
Enlivonex AI Hub
==================================
*/

let sessionCounter = 1;

const sessions = {};

let activeSessionId = null;

/*
==================================
Create Session
==================================
*/

function createSession(title = "New Chat") {

    const sessionId = `session_${sessionCounter++}`;

    sessions[sessionId] = {

        id: sessionId,

        title,

        createdAt: new Date(),

        updatedAt: new Date(),

        messages: []

    };

    activeSessionId = sessionId;

    return sessions[sessionId];

}

/*
==================================
Delete Session
==================================
*/

function deleteSession(sessionId) {

    if (!sessions[sessionId]) {

        return false;

    }

    delete sessions[sessionId];

    if (activeSessionId === sessionId) {

        const remainingSessions = Object.keys(sessions);

        activeSessionId =

            remainingSessions.length > 0

                ? remainingSessions[0]

                : null;

    }

    return true;

}

/*
==================================
Get Session
==================================
*/

function getSession(sessionId) {

    return sessions[sessionId] || null;

}

/*
==================================
Get All Sessions
==================================
*/

function getAllSessions() {

    return Object.values(sessions);

}

/*
==================================
Set Active Session
==================================
*/

function setActiveSession(sessionId) {

    if (!sessions[sessionId]) {

        return false;

    }

    activeSessionId = sessionId;

    sessions[sessionId].updatedAt = new Date();

    return true;

}

/*
==================================
Get Active Session
==================================
*/

function getActiveSession() {

    if (!activeSessionId) {

        return null;

    }

    return sessions[activeSessionId];

}

/*
==================================
Get Active Session ID
==================================
*/

function getActiveSessionId() {

    return activeSessionId;

}

/*
==================================
Rename Session
==================================
*/

function renameSession(sessionId, newTitle) {

    if (!sessions[sessionId]) {

        return false;

    }

    sessions[sessionId].title = newTitle;

    sessions[sessionId].updatedAt = new Date();

    return true;

}

/*
==================================
Add User Message
==================================
*/

function addUserMessage(sessionId, message) {

    if (!sessions[sessionId]) {

        return false;

    }

    sessions[sessionId].messages.push({
        role: "user",
        content: message,
        createdAt: new Date()
    });

    sessions[sessionId].updatedAt = new Date();

    return true;

}

/*
==================================
Add AI Message
==================================
*/

function addAIMessage(sessionId, message) {

    if (!sessions[sessionId]) {

        return false;

    }

    // accept optional model info as third argument
    const modelInfo = arguments[2] || null;

    sessions[sessionId].messages.push({
        role: "assistant",
        content: message,
        model: modelInfo,
        createdAt: new Date()
    });

    sessions[sessionId].updatedAt = new Date();

    return true;

}

/*
==================================
Get Messages
==================================
*/

function getMessages(sessionId) {

    if (!sessions[sessionId]) {

        return [];

    }

    return sessions[sessionId].messages;

}

/*
==================================
Clear Messages
==================================
*/

function clearMessages(sessionId) {

    if (!sessions[sessionId]) {

        return false;

    }

    sessions[sessionId].messages = [];

    sessions[sessionId].updatedAt = new Date();

    return true;

}

/*
==================================
Auto Create First Session
==================================
*/

createSession();

/*
==================================
Exports
==================================
*/

module.exports = {

    createSession,

    deleteSession,

    getSession,

    getAllSessions,

    setActiveSession,

    getActiveSession,

    getActiveSessionId,

    renameSession,

    addUserMessage,

    addAIMessage,

    getMessages,

    clearMessages

};