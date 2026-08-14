const express = require("express");

const router = express.Router();

/*
==================================
Controllers
==================================
*/

const {
    chatWithAI
} = require("../controllers/chatController");

const {
    codeAssistant
} = require("../controllers/codeAssistantController");

const {
    getSessions,
    createNewSession,
    switchSession,
    deleteChatSession,
    getSingleSession
} = require("../controllers/sessionController");


/*
==================================
AI CHAT
==================================
*/

// Normal AI Chat
router.post(
    "/chat",
    chatWithAI
);


/*
==================================
CODE ASSISTANT
==================================
*/

// Qwen 2.5 Coder 7B
router.post(
    "/code-assistant",
    codeAssistant
);


/*
==================================
SESSION APIs
==================================
*/

// Get all sessions
router.get(
    "/sessions",
    getSessions
);


// Create new session
router.post(
    "/session/new",
    createNewSession
);


// Switch active session
router.post(
    "/session/switch",
    switchSession
);


// Get single session with messages
router.get(
    "/session/:id",
    getSingleSession
);


// Delete session
router.delete(
    "/session/:id",
    deleteChatSession
);


/*
==================================
EXPORT ROUTER
==================================
*/

module.exports = router;