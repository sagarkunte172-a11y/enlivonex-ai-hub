/*
==================================
Chat Routes
==================================
*/

const express = require("express");

const router = express.Router();


/*
==================================
AUTHENTICATION MIDDLEWARE
==================================
*/

const {
    optionalAuth
} = require("../controllers/middleware/authMiddleware");


/*
==================================
CHAT CONTROLLER
==================================
*/

const {
    chatWithAI
} = require("../controllers/chatController");


/*
==================================
AI CHAT
==================================

POST /api/chat

Authentication:
- JWT required
- Identity comes from req.user.id

Supported models:

- auto
- gemma3:4b
- qwen2.5:3b

Qwen 2.5 Coder 7B is NOT allowed
through this route.
==================================
*/

router.post(
    "/chat",
    optionalAuth,
    chatWithAI
);


/*
==================================
EXPORT
==================================
*/

module.exports = router;