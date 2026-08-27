/*
==================================
Workspace Service
Phase 1E
JWT / Secure Workspace Access
==================================
*/

const mongoose = require("mongoose");

const Workspace = require("../models/Workspace");
const WorkspaceMember = require("../models/WorkspaceMember");
const User = require("../models/User");

const Project = require("../models/Project");
const Session = require("../models/Session");
const Share = require("../models/Share");
const Usage = require("../models/Usage");


/*
==================================
CONSTANTS
==================================
*/

const WORKSPACE_ROLES = [
    "owner",
    "admin",
    "member"
];

const MEMBER_ROLES = [
    "admin",
    "member"
];

const ACTIVE_STATUS = "active";


/*
==================================
OBJECT ID VALIDATION
==================================
*/

function isValidObjectId(id) {

    return Boolean(
        id &&
        mongoose.Types.ObjectId.isValid(id)
    );
}


/*
==================================
NORMALIZE ID
==================================
*/

function normalizeId(id) {

    return id?.toString();
}


/*
==================================
INVITE CODE GENERATOR
==================================
*/

function generateInviteCode() {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "ENL-";

    for (let i = 0; i < 6; i++) {

        code += characters.charAt(
            Math.floor(
                Math.random() * characters.length
            )
        );
    }

    return code;
}


/*
==================================
GENERATE UNIQUE INVITE CODE
==================================
*/

async function generateUniqueInviteCode() {

    let inviteCode;
    let exists = true;

    while (exists) {

        inviteCode =
            generateInviteCode();

        exists =
            await Workspace.exists({
                inviteCode
            });
    }

    return inviteCode;
}


/*
==================================
GET ACTIVE WORKSPACE
==================================
*/

async function getActiveWorkspace(workspaceId) {

    if (!isValidObjectId(workspaceId)) {

        throw new Error(
            "Validation Error: Invalid workspace ID format."
        );
    }

    const workspace =
        await Workspace.findOne({
            _id: workspaceId,
            isActive: true
        });

    if (!workspace) {

        throw new Error(
            "Not Found: Workspace not found or inactive."
        );
    }

    return workspace;
}


/*
==================================
GET ACTIVE MEMBER
==================================
*/

async function getActiveMember(
    workspaceId,
    userId
) {

    if (!isValidObjectId(workspaceId)) {

        throw new Error(
            "Validation Error: Invalid workspace ID format."
        );
    }

    if (!isValidObjectId(userId)) {

        throw new Error(
            "Validation Error: Invalid user ID format."
        );
    }

    const member =
        await WorkspaceMember.findOne({
            workspaceId,
            userId,
            status: ACTIVE_STATUS
        });

    return member;
}


/*
==================================
REQUIRE WORKSPACE MEMBER
==================================
*/

async function requireWorkspaceMember(
    workspaceId,
    userId
) {

    await getActiveWorkspace(
        workspaceId
    );

    const member =
        await getActiveMember(
            workspaceId,
            userId
        );

    if (!member) {

        throw new Error(
            "Forbidden: User is not an active member of this workspace."
        );
    }

    return member;
}


/*
==================================
REQUIRE WORKSPACE ADMIN
==================================
*/

async function requireWorkspaceAdmin(
    workspaceId,
    userId
) {

    const member =
        await requireWorkspaceMember(
            workspaceId,
            userId
        );

    if (
        member.role !== "admin" &&
        member.role !== "owner"
    ) {

        throw new Error(
            "Forbidden: Admin or Owner role required."
        );
    }

    return member;
}


/*
==================================
REQUIRE WORKSPACE OWNER
==================================
*/

async function requireWorkspaceOwner(
    workspaceId,
    userId
) {

    const member =
        await requireWorkspaceMember(
            workspaceId,
            userId
        );

    if (member.role !== "owner") {

        throw new Error(
            "Forbidden: Owner role required."
        );
    }

    return member;
}


/*
==================================
RESOLVE USER IDENTIFIER
==================================

Supported lookup methods:

1. MongoDB userId
2. Email
3. Username / nickname

The actual WorkspaceMember relation
continues to use the stable MongoDB
User._id.

Important:

Do NOT store email or username as
the membership reference because
they can change later.
==================================
*/

async function resolveUserIdentifier(
    identifier
) {

    if (
        typeof identifier !== "string" ||
        !identifier.trim()
    ) {

        throw new Error(
            "Validation Error: User identifier is required."
        );
    }

    const cleanIdentifier =
        identifier.trim();

    /*
    ----------------------------------
    MongoDB User ID
    ----------------------------------
    */

    if (
        isValidObjectId(
            cleanIdentifier
        )
    ) {

        const user =
            await User.findById(
                cleanIdentifier
            )
                .select(
                    "_id username email"
                );

        if (user) {

            return user;
        }
    }

    /*
    ----------------------------------
    Email lookup
    ----------------------------------
    */

    if (
        cleanIdentifier.includes("@")
    ) {

        const user =
            await User.findOne({
                email:
                    cleanIdentifier.toLowerCase()
            })
                .select(
                    "_id username email"
                );

        if (user) {

            return user;
        }
    }

    /*
    ----------------------------------
    Username / nickname lookup
    ----------------------------------
    */

    const user =
        await User.findOne({
            username:
                cleanIdentifier
        })
            .select(
                "_id username email"
            );

    if (user) {

        return user;
    }

    throw new Error(
        "Not Found: No user found with the provided Enl ID, email, username, or user ID."
    );
}

async function searchWorkspaceUsers(workspaceId, requesterId, query) {
    await requireWorkspaceAdmin(workspaceId, requesterId);

    const cleanQuery = typeof query === "string" ? query.trim() : "";

    if (cleanQuery.length < 2) {
        throw new Error("Validation Error: Enter at least two characters to search users.");
    }

    const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matcher = new RegExp(escapedQuery, "i");

    const users = await User.find({
        $or: [
            { username: matcher },
            { email: matcher }
        ]
    })
        .select("_id username email")
        .sort({ username: 1 })
        .limit(10)
        .lean();

    const activeMemberships = await WorkspaceMember.find({
        workspaceId,
        status: ACTIVE_STATUS
    })
        .select("userId")
        .lean();

    const activeUserIds = new Set(
        activeMemberships.map((member) => normalizeId(member.userId))
    );

    return users.filter(
        (user) => !activeUserIds.has(normalizeId(user._id))
    );
}


/*
==================================
CREATE WORKSPACE
==================================

Creates:

1. Workspace
2. Owner membership

The owner identity must come
from authenticated req.user.id
through the controller.
==================================
*/

async function createWorkspace({
    name,
    description,
    ownerId
}) {

    if (
        typeof name !== "string" ||
        !name.trim()
    ) {

        throw new Error(
            "Validation Error: Workspace name is required."
        );
    }

    if (!isValidObjectId(ownerId)) {

        throw new Error(
            "Validation Error: Invalid owner ID format."
        );
    }

    const cleanName =
        name.trim();

    const cleanDescription =
        typeof description === "string"
            ? description.trim()
            : "";

    if (cleanName.length > 100) {

        throw new Error(
            "Validation Error: Workspace name cannot exceed 100 characters."
        );
    }

    if (cleanDescription.length > 1000) {

        throw new Error(
            "Validation Error: Workspace description cannot exceed 1000 characters."
        );
    }

    /*
    ----------------------------------
    Verify owner exists
    ----------------------------------
    */

    const owner =
        await User.findById(ownerId)
            .select("_id username");

    if (!owner) {

        throw new Error(
            "Not Found: Owner user does not exist."
        );
    }

    /*
    ----------------------------------
    Transaction
    ----------------------------------
    */

    const session =
        await mongoose.startSession();

    try {

        let createdWorkspace;

        await session.withTransaction(
            async () => {

                const inviteCode =
                    await generateUniqueInviteCode();

                const workspaceDocuments =
                    await Workspace.create(
                        [
                            {
                                name: cleanName,
                                description:
                                    cleanDescription,
                                ownerId,
                                inviteCode,
                                isActive: true
                            }
                        ],
                        {
                            session
                        }
                    );

                createdWorkspace =
                    workspaceDocuments[0];

                await WorkspaceMember.create(
                    [
                        {
                            workspaceId:
                                createdWorkspace._id,

                            userId:
                                ownerId,

                            alias:
                                owner.username ||
                                "Owner",

                            role: "owner",

                            status:
                                ACTIVE_STATUS
                        }
                    ],
                    {
                        session
                    }
                );
            }
        );

        return createdWorkspace;

    }

    catch (error) {

        const transactionUnsupported =
            error?.code === 20 ||
            error?.codeName === "IllegalOperation" ||
            error?.originalError?.code === 20 ||
            error?.originalError?.codeName === "IllegalOperation" ||
            error?.message?.includes(
                "Transaction numbers are only allowed"
            );

        if (transactionUnsupported) {

            let createdWorkspace;

            try {

                const inviteCode =
                    await generateUniqueInviteCode();

                createdWorkspace =
                    await Workspace.create({
                        name: cleanName,
                        description:
                            cleanDescription,
                        ownerId,
                        inviteCode,
                        isActive: true
                    });

                await WorkspaceMember.create({
                    workspaceId:
                        createdWorkspace._id,

                    userId:
                        ownerId,

                    alias:
                        owner.username ||
                        "Owner",

                    role:
                        "owner",

                    status:
                        ACTIVE_STATUS
                });

                return createdWorkspace;

            }

            catch (fallbackError) {

                if (createdWorkspace?._id) {

                    await Workspace.deleteOne({
                        _id:
                            createdWorkspace._id
                    });
                }

                throw fallbackError;
            }
        }

        console.error(
            "Create Workspace Service Error:",
            error
        );

        throw error;
    }

    finally {

        await session.endSession();
    }
}


/*
==================================
JOIN WORKSPACE
==================================
*/

async function joinWorkspace({
    inviteCode,
    userId,
    alias
}) {

    if (
        typeof inviteCode !== "string" ||
        !inviteCode.trim()
    ) {

        throw new Error(
            "Validation Error: Invite code is required."
        );
    }

    if (!isValidObjectId(userId)) {

        throw new Error(
            "Validation Error: Invalid user ID format."
        );
    }

    const workspace =
        await Workspace.findOne({
            inviteCode:
                inviteCode.trim().toUpperCase(),
            isActive: true
        });

    if (!workspace) {

        throw new Error(
            "Not Found: Workspace not found or inactive."
        );
    }

    const user =
        await User.findById(userId)
            .select("_id username");

    if (!user) {

        throw new Error(
            "Not Found: User does not exist."
        );
    }

    let member =
        await WorkspaceMember.findOne({
            workspaceId:
                workspace._id,
            userId
        });

    if (
        member?.status ===
        ACTIVE_STATUS
    ) {

        throw new Error(
            "Conflict: User is already an active member."
        );
    }

    const cleanAlias =
        typeof alias === "string" &&
        alias.trim()
            ? alias.trim()
            : user.username || "";

    if (member) {

        member.alias =
            cleanAlias;

        member.role =
            "member";

        member.status =
            ACTIVE_STATUS;

        await member.save();

        return member;
    }

    return WorkspaceMember.create({
        workspaceId:
            workspace._id,

        userId,

        alias:
            cleanAlias,

        role:
            "member",

        status:
            ACTIVE_STATUS
    });
}


/*
==================================
GET USER WORKSPACES
==================================

Only active memberships are returned.
==================================
*/

async function getUserWorkspaces(
    userId
) {

    if (!isValidObjectId(userId)) {

        throw new Error(
            "Validation Error: Invalid user ID format."
        );
    }

    const memberships =
        await WorkspaceMember.find({
            userId,
            status:
                ACTIVE_STATUS
        })
            .populate({
                path:
                    "workspaceId",

                select:
                    "name description inviteCode isActive ownerId createdAt updatedAt"
            })
            .sort({
                updatedAt: -1
            })
            .lean();

    return memberships
        .filter(
            membership =>
                membership.workspaceId &&
                membership.workspaceId.isActive
        )
        .map(
            membership => ({

                workspace:
                    membership.workspaceId,

                role:
                    membership.role,

                alias:
                    membership.alias,

                status:
                    membership.status
            })
        );
}


/*
==================================
GET WORKSPACE DETAILS
==================================

Requester must be an active member.
==================================
*/

async function getWorkspaceDetails(
    workspaceId
) {

    const workspace =
        await getActiveWorkspace(
            workspaceId
        );

    const members =
        await WorkspaceMember.find({
            workspaceId,
            status: {
                $ne: "removed"
            }
        })
            .populate({
                path:
                    "userId",

                select:
                    "_id username email"
            })
            .sort({
                createdAt: 1
            })
            .lean();

    return {

        workspace,

        members:
            members.map(
                member => ({

                    userId:
                        member.userId
                            ? member.userId._id
                            : null,

                    username:
                        member.userId
                            ? member.userId.username
                            : "Unknown",

                    email:
                        member.userId
                            ? member.userId.email
                            : null,

                    alias:
                        member.alias,

                    role:
                        member.role,

                    status:
                        member.status,

                    joinedAt:
                        member.createdAt
                })
            )
    };
}


/*
==================================
ADD MEMBER
==================================

Requester:
    authenticated user

Target:
    userId / email / username

Only owner/admin can add.

Important:

- owner can add member/admin
- admin can add member
- admin cannot create another admin
- owner role cannot be assigned here

The membership database relation
always stores the resolved User._id.
==================================
*/

async function addMember(
    workspaceId,
    requesterId,
    {
        userId,
        email,
        username,
        nickname,
        identifier,
        alias,
        role
    }
) {

    const requester =
        await requireWorkspaceAdmin(
            workspaceId,
            requesterId
        );

    /*
    ----------------------------------
    Validate requested role
    ----------------------------------
    */

    const requestedRole =
        role || "member";

    if (
        !MEMBER_ROLES.includes(
            requestedRole
        )
    ) {

        throw new Error(
            "Validation Error: Invalid member role."
        );
    }

    /*
    ----------------------------------
    Admin cannot create another admin
    ----------------------------------
    */

    if (
        requestedRole === "admin" &&
        requester.role !== "owner"
    ) {

        throw new Error(
            "Forbidden: Only the workspace owner can assign the admin role."
        );
    }

    /*
    ----------------------------------
    Resolve target user
    ----------------------------------
    */

    const targetIdentifier =
        identifier ||
        userId ||
        email ||
        username ||
        nickname;

    if (
        typeof targetIdentifier !==
            "string" ||
        !targetIdentifier.trim()
    ) {

        throw new Error(
            "Validation Error: User ID, email, username, or nickname is required."
        );
    }

    const user =
        await resolveUserIdentifier(
            targetIdentifier
        );

    const resolvedUserId =
        user._id;

    /*
    ----------------------------------
    Prevent owner from being re-added
    ----------------------------------
    */

    const workspace =
        await Workspace.findById(
            workspaceId
        );

    if (!workspace) {

        throw new Error(
            "Not Found: Workspace does not exist."
        );
    }

    if (
        normalizeId(
            workspace.ownerId
        ) ===
        normalizeId(
            resolvedUserId
        )
    ) {

        throw new Error(
            "Conflict: User is already the workspace owner."
        );
    }

    /*
    ----------------------------------
    Existing membership
    ----------------------------------
    */

    let member =
        await WorkspaceMember.findOne({
            workspaceId,
            userId:
                resolvedUserId
        });

    if (member) {

        if (
            member.status ===
            ACTIVE_STATUS
        ) {

            throw new Error(
                "Conflict: User is already an active member."
            );
        }

        /*
        Reactivate removed/declined/
        pending membership.
        */

        member.status =
            ACTIVE_STATUS;

        member.role =
            requestedRole;

        member.alias =
            typeof alias === "string" &&
            alias.trim()
                ? alias.trim()
                : (
                    user.username ||
                    ""
                );

        await member.save();

        return member;
    }

    /*
    ----------------------------------
    Create membership
    ----------------------------------
    */

    member =
        await WorkspaceMember.create({

            workspaceId,

            userId:
                resolvedUserId,

            alias:
                typeof alias === "string" &&
                alias.trim()
                    ? alias.trim()
                    : (
                        user.username ||
                        ""
                    ),

            role:
                requestedRole,

            status:
                ACTIVE_STATUS
        });

    return member;
}


/*
==================================
REMOVE MEMBER
==================================

Only owner/admin.

Owner cannot be removed.

Admin cannot remove another admin.
Only owner can manage admins.
==================================
*/

async function removeMember(
    workspaceId,
    requesterId,
    targetUserId
) {

    if (!isValidObjectId(targetUserId)) {

        throw new Error(
            "Validation Error: Invalid target user ID format."
        );
    }

    const requester =
        await requireWorkspaceAdmin(
            workspaceId,
            requesterId
        );

    const member =
        await WorkspaceMember.findOne({
            workspaceId,
            userId:
                targetUserId
        });

    if (!member) {

        throw new Error(
            "Not Found: Membership does not exist."
        );
    }

    if (
        member.status ===
        "removed"
    ) {

        throw new Error(
            "Conflict: User is already removed from the workspace."
        );
    }

    /*
    Owner can never be removed.
    */

    if (
        member.role ===
        "owner"
    ) {

        throw new Error(
            "Forbidden: Cannot remove the workspace owner."
        );
    }

    /*
    Admin can remove normal members,
    but only owner can remove admins.
    */

    if (
        member.role === "admin" &&
        requester.role !== "owner"
    ) {

        throw new Error(
            "Forbidden: Only the workspace owner can remove an admin."
        );
    }

    /*
    Prevent self-removal through
    admin endpoint.
    */

    if (
        normalizeId(requesterId) ===
        normalizeId(targetUserId)
    ) {

        throw new Error(
            "Validation Error: Use the leave workspace endpoint to leave the workspace."
        );
    }

    member.status =
        "removed";

    await member.save();

    return member;
}


/*
==================================
CHANGE MEMBER ROLE
==================================

Only owner can change roles.

Owner cannot lose ownership.

Ownership transfer is deliberately
not supported here.
==================================
*/

async function changeRole(
    workspaceId,
    requesterId,
    targetUserId,
    newRole
) {

    if (!isValidObjectId(targetUserId)) {

        throw new Error(
            "Validation Error: Invalid target user ID format."
        );
    }

    if (
        !MEMBER_ROLES.includes(
            newRole
        )
    ) {

        throw new Error(
            "Validation Error: Invalid role."
        );
    }

    await requireWorkspaceOwner(
        workspaceId,
        requesterId
    );

    const member =
        await WorkspaceMember.findOne({
            workspaceId,
            userId:
                targetUserId
        });

    if (!member) {

        throw new Error(
            "Not Found: Membership does not exist."
        );
    }

    if (
        member.status !==
        ACTIVE_STATUS
    ) {

        throw new Error(
            "Conflict: Cannot change role of an inactive member."
        );
    }

    /*
    ----------------------------------
    Owner cannot be downgraded
    ----------------------------------
    */

    if (
        member.role ===
        "owner"
    ) {

        throw new Error(
            "Forbidden: Workspace owner cannot lose ownership through this endpoint."
        );
    }

    /*
    ----------------------------------
    Target cannot be requester
    ----------------------------------
    */

    if (
        normalizeId(requesterId) ===
        normalizeId(targetUserId)
    ) {

        throw new Error(
            "Validation Error: Owner cannot change their own role."
        );
    }

    member.role =
        newRole;

    await member.save();

    return member;
}


/*
==================================
LEAVE WORKSPACE
==================================

Any active member can leave.

Owner cannot leave until ownership
has been transferred through a
future dedicated ownership-transfer
flow.
==================================
*/

async function leaveWorkspace(
    workspaceId,
    userId
) {

    const member =
        await requireWorkspaceMember(
            workspaceId,
            userId
        );

    if (
        member.role ===
        "owner"
    ) {

        throw new Error(
            "Forbidden: Workspace owner cannot leave while they are the owner."
        );
    }

    member.status =
        "removed";

    await member.save();

    return member;
}


/*
==================================
DELETE WORKSPACE
==================================

Only the workspace owner can delete.

This removes ONLY workspace-scoped
data.

Personal/solo sessions are NOT
affected because they have no
matching workspaceId.

Workspace-owned records removed:

1. Projects
2. Sessions
3. Shares
4. Usage records
5. Workspace memberships
6. Workspace
==================================
*/

async function deleteWorkspace(
    workspaceId,
    requesterId
) {

    if (!isValidObjectId(workspaceId)) {

        throw new Error(
            "Validation Error: Invalid workspace ID format."
        );
    }

    if (!isValidObjectId(requesterId)) {

        throw new Error(
            "Validation Error: Invalid requester ID format."
        );
    }

    /*
    ----------------------------------
    Owner authorization
    ----------------------------------
    */

    await requireWorkspaceOwner(
        workspaceId,
        requesterId
    );

    /*
    ----------------------------------
    Confirm workspace
    ----------------------------------
    */

    const workspace =
        await Workspace.findOne({
            _id:
                workspaceId,
            isActive:
                true
        });

    if (!workspace) {

        throw new Error(
            "Not Found: Workspace not found or inactive."
        );
    }

    /*
    ----------------------------------
    Transaction
    ----------------------------------
    */

    const session =
        await mongoose.startSession();

    try {

        let deletionResult = null;

        await session.withTransaction(
            async () => {

                const projectsResult =
                    await Project.deleteMany(
                        {
                            workspaceId
                        },
                        {
                            session
                        }
                    );

                const sessionsResult =
                    await Session.deleteMany(
                        {
                            workspaceId
                        },
                        {
                            session
                        }
                    );

                const sharesResult =
                    await Share.deleteMany(
                        {
                            workspaceId
                        },
                        {
                            session
                        }
                    );

                const usageResult =
                    await Usage.deleteMany(
                        {
                            workspaceId
                        },
                        {
                            session
                        }
                    );

                const membershipsResult =
                    await WorkspaceMember.deleteMany(
                        {
                            workspaceId
                        },
                        {
                            session
                        }
                    );

                const workspaceResult =
                    await Workspace.deleteOne(
                        {
                            _id:
                                workspaceId
                        },
                        {
                            session
                        }
                    );

                if (
                    workspaceResult.deletedCount !==
                    1
                ) {

                    throw new Error(
                        "Conflict: Workspace could not be deleted."
                    );
                }

                deletionResult = {

                    projectsDeleted:
                        projectsResult.deletedCount,

                    sessionsDeleted:
                        sessionsResult.deletedCount,

                    sharesDeleted:
                        sharesResult.deletedCount,

                    usageDeleted:
                        usageResult.deletedCount,

                    membershipsDeleted:
                        membershipsResult.deletedCount,

                    workspaceDeleted:
                        workspaceResult.deletedCount
                };
            }
        );

        return deletionResult;
    }

    catch (error) {

        const transactionUnsupported =
            error?.code === 20 ||
            error?.codeName ===
                "IllegalOperation" ||
            error?.originalError?.code ===
                20 ||
            error?.originalError?.codeName ===
                "IllegalOperation" ||
            error?.message?.includes(
                "Transaction numbers are only allowed"
            );

        /*
        ----------------------------------
        MongoDB standalone fallback
        ----------------------------------

        This fallback is used only when
        MongoDB transactions are unavailable.

        Deletion order removes dependent
        records before the workspace.
        ----------------------------------
        */

        if (transactionUnsupported) {

            await Project.deleteMany({
                workspaceId
            });

            await Session.deleteMany({
                workspaceId
            });

            await Share.deleteMany({
                workspaceId
            });

            await Usage.deleteMany({
                workspaceId
            });

            await WorkspaceMember.deleteMany({
                workspaceId
            });

            const result =
                await Workspace.deleteOne({
                    _id:
                        workspaceId
                });

            if (
                result.deletedCount !==
                1
            ) {

                throw new Error(
                    "Conflict: Workspace could not be deleted."
                );
            }

            return {

                projectsDeleted:
                    "completed",

                sessionsDeleted:
                    "completed",

                sharesDeleted:
                    "completed",

                usageDeleted:
                    "completed",

                membershipsDeleted:
                    "completed",

                workspaceDeleted:
                    1
            };
        }

        console.error(
            "Delete Workspace Service Error:",
            error
        );

        throw error;
    }

    finally {

        await session.endSession();
    }
}


/*
==================================
EXPORTS
==================================
*/

module.exports = {

    createWorkspace,

    joinWorkspace,

    getUserWorkspaces,

    getWorkspaceDetails,

    addMember,

    removeMember,

    changeRole,

    leaveWorkspace,

    deleteWorkspace,

    searchWorkspaceUsers,

    resolveUserIdentifier,

    requireWorkspaceMember,

    requireWorkspaceAdmin,

    requireWorkspaceOwner,

    getActiveWorkspace,

    getActiveMember,

    isValidObjectId
};
