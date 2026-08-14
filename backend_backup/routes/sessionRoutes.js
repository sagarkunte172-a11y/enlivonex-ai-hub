const express = require("express");

const router = express.Router();

/*
==================================
Controller
==================================
*/

const {

    getSessions,
    createNewSession,
    switchSession,
    deleteChatSession,
    getSingleSession

} = require("../controllers/sessionController");

/*
==================================
GET ALL SESSIONS
/api/sessions
==================================
*/

router.get("/sessions", getSessions);

/*
==================================
NEW SESSION
/api/session/new
==================================
*/

router.post("/session/new", createNewSession);

/*
==================================
SWITCH SESSION
/api/session/switch
==================================
*/

router.post("/session/switch", switchSession);

/*
==================================
DELETE SESSION
/api/session/:id
==================================
*/

router.delete("/session/:id", deleteChatSession);

/*
==================================
GET SINGLE SESSION
(ALWAYS LAST)
/api/session/:id
==================================
*/

router.get("/session/:id", getSingleSession);

module.exports = router;