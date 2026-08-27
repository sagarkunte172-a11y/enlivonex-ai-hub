/*
==================================
SESSION ROUTES
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
    requireAuth
} = require("../controllers/middleware/authMiddleware");


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
} = require("../controllers/sessionController");


/*
==================================
GET ALL PERSONAL SESSIONS
==================================

GET /api/sessions

Authentication:
- JWT required
- User identity comes from req.user.id

Returns only sessions belonging
to the authenticated user.

Workspace sessions should be handled
through workspace-specific endpoints.
==================================
*/

router.get(
    "/sessions",
    requireAuth,
    getSessions
);


/*
==================================
CREATE NEW PERSONAL SESSION
==================================

POST /api/session/new

Authentication:
- JWT required
- User identity comes from req.user.id

Creates a personal session for
the authenticated user.
==================================
*/

router.post(
    "/session/new",
    requireAuth,
    createNewSession
);


/*
==================================
SWITCH SESSION
==================================

POST /api/session/switch

Authentication:
- JWT required

The controller/service verifies
that the authenticated user has
access to the requested session.
==================================
*/

router.post(
    "/session/switch",
    requireAuth,
    switchSession
);


/*
==================================
GET SINGLE SESSION
==================================

GET /api/session/:id

Authentication:
- JWT required

The authenticated user can only
access a session they are allowed
to access.

Personal sessions:
    Only their owner.

Workspace sessions:
    Controlled by workspace
    membership / role / sharing
    rules.
==================================
*/

router.get(
    "/session/:id",
    requireAuth,
    getSingleSession
);


/*
==================================
DELETE SESSION
==================================

DELETE /api/session/:id

Authentication:
- JWT required

The controller must verify that
the authenticated user has permission
to delete the requested session.
==================================
*/

router.delete(
    "/session/:id",
    requireAuth,
    deleteChatSession
);


/*
==================================
EXPORT
==================================
*/

module.exports = router;