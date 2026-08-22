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

                            status: ACTIVE_STATUS
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
                        description: cleanDescription,
                        ownerId,
                        inviteCode,
                        isActive: true
                    });

                await WorkspaceMember.create({
                    workspaceId: createdWorkspace._id,
                    userId: ownerId,
                    alias: owner.username || "Owner",
                    role: "owner",
                    status: ACTIVE_STATUS
                });

                return createdWorkspace;

            }

            catch (fallbackError) {

                if (createdWorkspace?._id) {

                    await Workspace.deleteOne({
                        _id: createdWorkspace._id
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
            inviteCode: inviteCode.trim().toUpperCase(),
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
            workspaceId: workspace._id,
            userId
        });

    if (member?.status === ACTIVE_STATUS) {

        throw new Error(
            "Conflict: User is already an active member."
        );
    }

    const cleanAlias =
        typeof alias === "string" && alias.trim()
            ? alias.trim()
            : user.username || "";

    if (member) {

        member.alias = cleanAlias;
        member.role = "member";
        member.status = ACTIVE_STATUS;

        await member.save();

        return member;
    }

    return WorkspaceMember.create({
        workspaceId: workspace._id,
        userId,
        alias: cleanAlias,
        role: "member",
        status: ACTIVE_STATUS
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
            status: ACTIVE_STATUS
        })
            .populate({
                path: "workspaceId",
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
                path: "userId",
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
    userId

Only owner/admin can add.

Important:

- owner can add member/admin
- admin can add member
- admin cannot create another admin
- owner role cannot be assigned here
==================================
*/

async function addMember(
    workspaceId,
    requesterId,
    {
        userId,
        alias,
        role
    }
) {

    if (!isValidObjectId(userId)) {

        throw new Error(
            "Validation Error: Invalid target user ID format."
        );
    }

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
    Admin cannot create another admin.
    Only owner can assign admin.
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
    Verify target user
    ----------------------------------
    */

    const user =
        await User.findById(userId)
            .select("_id username email");

    if (!user) {

        throw new Error(
            "Not Found: User to add does not exist."
        );
    }

    /*
    ----------------------------------
    Prevent owner from being
    re-added as normal member
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
        normalizeId(workspace.ownerId) ===
        normalizeId(userId)
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
            userId
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

            userId,

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
            userId: targetUserId
        });

    if (!member) {

        throw new Error(
            "Not Found: Membership does not exist."
        );
    }

    if (member.status === "removed") {

        throw new Error(
            "Conflict: User is already removed from the workspace."
        );
    }

    /*
    Owner can never be removed.
    */

    if (member.role === "owner") {

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

    if (!MEMBER_ROLES.includes(newRole)) {

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
            userId: targetUserId
        });

    if (!member) {

        throw new Error(
            "Not Found: Membership does not exist."
        );
    }

    if (member.status !== ACTIVE_STATUS) {

        throw new Error(
            "Conflict: Cannot change role of an inactive member."
        );
    }

    /*
    ----------------------------------
    Owner cannot be downgraded
    ----------------------------------
    */

    if (member.role === "owner") {

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

    if (member.role === "owner") {

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

    requireWorkspaceMember,

    requireWorkspaceAdmin,

    requireWorkspaceOwner,

    getActiveWorkspace,

    getActiveMember,

    isValidObjectId

};