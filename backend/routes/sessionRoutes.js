const express = require("express");

const router = express.Router();

/*
==================================
Session Controller
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
Get All Sessions
==================================
*/

router.get("/", getSessions);

/*
==================================
Create New Session
==================================
*/

router.post("/new", createNewSession);

/*
==================================
Switch Active Session
==================================
*/

router.post("/switch", switchSession);

/*
==================================
Get Single Session
==================================
*/

router.get("/:id", getSingleSession);

/*
==================================
Delete Session
==================================
*/

router.delete("/:id", deleteChatSession);

/*
==================================
Exports
==================================
*/

module.exports = router;