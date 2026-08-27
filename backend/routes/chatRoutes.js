const express = require("express");
const router = express.Router();

const {
    optionalAuth
} = require("../controllers/middleware/authMiddleware");

const {
    chatWithAI
} = require("../controllers/chatController");


/*==================================
AI CHAT

POST /api/chat

Authenticated:
- JWT available
- req.user populated
- MongoDB session used

Guest:
- No JWT
- req.user = null
- temporary session from frontend
- no MongoDB persistence
==================================*/

router.post(
    "/chat",
    optionalAuth,
    chatWithAI
);


/*==================================
EXPORT
==================================*/

module.exports = router;