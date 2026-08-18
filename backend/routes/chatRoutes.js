/*
==================================
Chat Routes
==================================
*/

const express = require("express");

const router =
    express.Router();


/*
==================================
CHAT CONTROLLER
==================================
*/

const {
    chatWithAI
} = require(
    "../controllers/chatController"
);


/*
==================================
SESSION CONTROLLER
==================================
*/

const {

    getSessions,

    createNewSession,

    switchSession,

    deleteChatSession,

    getSingleSession

} = require(
    "../controllers/sessionController"
);


/*
==================================
AI CHAT
==================================

POST /api/chat

Supported models:

- automatic
- gemma3:4b
- qwen2.5:3b

Qwen 2.5 Coder 7B is NOT allowed
through this route.
*/

router.post(
    "/chat",
    chatWithAI
);


/*
==================================
SESSION APIs
==================================
*/

router.get(
    "/sessions",
    getSessions
);


router.post(
    "/session/new",
    createNewSession
);


router.post(
    "/session/switch",
    switchSession
);


router.get(
    "/session/:id",
    getSingleSession
);


router.delete(
    "/session/:id",
    deleteChatSession
);


/*
==================================
EXPORT
==================================
*/

module.exports = router;