const express = require("express");

const router = express.Router();

/*
==================================
Authentication Middleware
==================================
*/

const {
    optionalAuth
} = require("../controllers/middleware/authMiddleware");

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

GET /api/sessions

Requires authentication.
Identity is taken from req.user.id.
==================================
*/

router.get(
    "/sessions",
    optionalAuth,
    getSessions
);

/*
==================================
Create New Session
==================================

POST /api/sessions/new

Requires authentication.
==================================
*/

router.post(
    "/session/new",
    optionalAuth,
    createNewSession
);

/*
==================================
Switch Active Session
==================================

POST /api/sessions/switch

Requires authentication.
==================================
*/

router.post(
    "/session/switch",
    optionalAuth,
    switchSession
);

/*
==================================
Get Single Session
==================================

GET /api/sessions/:id

Requires authentication.
==================================
*/

router.get(
    "/session/:id",
    optionalAuth,
    getSingleSession
);

/*
==================================
Delete Session
==================================

DELETE /api/sessions/:id

Requires authentication.
==================================
*/

router.delete(
    "/session/:id",
    optionalAuth,
    deleteChatSession
);

/*
==================================
Exports
==================================
*/

module.exports = router;