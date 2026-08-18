/*
==================================
Enlivonex Code Assistant Routes
==================================
*/

const express =
    require("express");


const {
    codeAssistant
} = require(
    "../controllers/codeAssistantController"
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
    codeAssistant
);


/*
==================================
EXPORT
==================================
*/

module.exports = router;