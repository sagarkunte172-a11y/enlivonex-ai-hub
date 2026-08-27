/*
==================================
Workspace Routes
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
WORKSPACE CONTROLLER
==================================
*/

const workspaceController =
    require("../controllers/workspaceController");


/*
==================================
SHARE CONTROLLER
==================================
*/

const shareController =
    require("../controllers/shareController");


/*
==================================
CREATE WORKSPACE
==================================

POST /api/workspaces

Requester identity:
    req.user.id

The client must NOT provide
ownerId/requesterId separately.
==================================
*/

router.post(
    "/workspaces",
    requireAuth,
    workspaceController.createWorkspace
);


/*
==================================
JOIN WORKSPACE
==================================

POST /api/workspaces/join
==================================
*/

router.post(
    "/workspaces/join",
    requireAuth,
    workspaceController.joinWorkspace
);


/*
==================================
GET USER WORKSPACES
==================================

GET /api/workspaces/user

The authenticated user's ID is used.

Do NOT use:

/workspaces/user/:userId
==================================
*/

router.get(
    "/workspaces/user",
    requireAuth,
    workspaceController.getUserWorkspaces
);


/*
==================================
GET WORKSPACE DETAILS
==================================

GET /api/workspaces/:workspaceId

Authentication is required.
The controller verifies that the
authenticated user is an active
workspace member.
==================================
*/

router.get(
    "/workspaces/:workspaceId",
    requireAuth,
    workspaceController.getWorkspaceDetails
);


/*
==================================
ADD WORKSPACE MEMBER
==================================

POST /api/workspaces/:workspaceId/members

Requester:
    req.user.id

Target member can be identified
using:

- userId
- identifier
- email
- username
- nickname

The controller/service resolves
the identifier to the stable
User._id.

Only authenticated workspace
admins/owners are allowed by
the service layer.
==================================
*/

router.post(
    "/workspaces/:workspaceId/members",
    requireAuth,
    workspaceController.addMember
);

router.get(
    "/workspaces/:workspaceId/users",
    requireAuth,
    workspaceController.searchWorkspaceUsers
);


/*
==================================
REMOVE WORKSPACE MEMBER
==================================

DELETE /api/workspaces/:workspaceId/members/:userId

:userId = target member

Requester identity:
    req.user.id
==================================
*/

router.delete(
    "/workspaces/:workspaceId/members/:userId",
    requireAuth,
    workspaceController.removeMember
);


/*
==================================
CHANGE MEMBER ROLE
==================================

PATCH /api/workspaces/:workspaceId/members/:userId/role

:userId = target member

Requester identity:
    req.user.id
==================================
*/

router.patch(
    "/workspaces/:workspaceId/members/:userId/role",
    requireAuth,
    workspaceController.changeRole
);


/*
==================================
LEAVE WORKSPACE
==================================

POST /api/workspaces/:workspaceId/leave

Requester identity:
    req.user.id

The client must NOT select another
user identity for this operation.
==================================
*/

router.post(
    "/workspaces/:workspaceId/leave",
    requireAuth,
    workspaceController.leaveWorkspace
);


/*
==================================
DELETE WORKSPACE
==================================

DELETE /api/workspaces/:workspaceId

Requester identity:
    req.user.id

Only the workspace owner can
successfully delete the workspace.

The controller/service will ensure
that only workspace-scoped data is
removed.

Solo Chat / Solo Code Assistant
data is NOT affected.
==================================
*/

router.delete(
    "/workspaces/:workspaceId",
    requireAuth,
    workspaceController.deleteWorkspace
);


/*
==================================
CREATE WORKSPACE SESSION
==================================

POST /api/workspaces/:workspaceId/sessions
==================================
*/

router.post(
    "/workspaces/:workspaceId/sessions",
    requireAuth,
    workspaceController.createWorkspaceSession
);


/*
==================================
GET ALL WORKSPACE SESSIONS
==================================

GET /api/workspaces/:workspaceId/sessions

Requester identity:
    req.user.id

The controller/service verifies
workspace admin/owner access.
==================================
*/

router.get(
    "/workspaces/:workspaceId/sessions",
    requireAuth,
    workspaceController.getAllWorkspaceSessions
);


/*
==================================
GET CURRENT USER'S WORKSPACE SESSIONS
==================================

GET /api/workspaces/:workspaceId/sessions/me

The authenticated user's ID is used.

Do NOT use:

/workspaces/:workspaceId/sessions/:userId
==================================
*/

router.get(
    "/workspaces/:workspaceId/sessions/me",
    requireAuth,
    workspaceController.getWorkspaceSessionsForUser
);


/*
==================================
GET WORKSPACE USAGE
==================================

GET /api/workspaces/:workspaceId/usage

Owner-only usage summary.
==================================
*/

router.get(
    "/workspaces/:workspaceId/usage",
    requireAuth,
    workspaceController.getWorkspaceUsage
);


/*
==================================
SHARE SESSION
==================================

POST /api/workspaces/:workspaceId/shares/session

Requester identity:
    req.user.id
==================================
*/

router.post(
    "/workspaces/:workspaceId/shares/session",
    requireAuth,
    shareController.shareSession
);


/*
==================================
SHARE MESSAGE
==================================

POST /api/workspaces/:workspaceId/shares/message

Requester identity:
    req.user.id
==================================
*/

router.post(
    "/workspaces/:workspaceId/shares/message",
    requireAuth,
    shareController.shareMessage
);


/*
==================================
GET SHARES
==================================

GET /api/workspaces/:workspaceId/shares

Requester identity:
    req.user.id

Optional query parameters may be
used for filtering, but identity
must come from authentication.
==================================
*/

router.get(
    "/workspaces/:workspaceId/shares",
    requireAuth,
    shareController.getShares
);


/*
==================================
REVOKE SHARE
==================================

DELETE /api/workspaces/:workspaceId/shares/:shareId

Requester identity:
    req.user.id
==================================
*/

router.delete(
    "/workspaces/:workspaceId/shares/:shareId",
    requireAuth,
    shareController.revokeShare
);


/*
==================================
EXPORT
==================================
*/

module.exports = router;
