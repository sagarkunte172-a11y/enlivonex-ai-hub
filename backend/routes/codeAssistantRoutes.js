/*
==================================
Enlivonex Code Assistant Routes
==================================
*/

const express =
    require("express");


const {
    codeAssistant,
    createConversation,
    listConversations,
    getConversation,
    shareConversation
} = require(
    "../controllers/codeAssistantController"
);

const {
    requireAuth
} = require(
    "../controllers/middleware/authMiddleware"
);


const router =
    express.Router();


/*
==================================
CODE ASSISTANT
==================================

POST /code-assistant

This endpoint is ONLY for coding.

It must never be used by the
normal AI Chat page.
==================================
*/

router.post(
    "/code-assistant",
    requireAuth,
    codeAssistant
);

router.get("/code-assistant/conversations", requireAuth, listConversations);
router.post("/code-assistant/conversations", requireAuth, createConversation);
router.get("/code-assistant/conversations/:id", requireAuth, getConversation);
router.post("/code-assistant/conversations/:id/share", requireAuth, shareConversation);


/*
==================================
EXPORT
==================================
*/

module.exports = router;
