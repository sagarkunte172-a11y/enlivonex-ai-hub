const express = require("express");

const router = express.Router();

/*
==================================
Chat Controller
==================================
*/

const {
    chatWithAI
} = require("../controllers/chatController");

/*
==================================
POST /api/chat
==================================
*/

router.post("/chat", chatWithAI);

module.exports = router;