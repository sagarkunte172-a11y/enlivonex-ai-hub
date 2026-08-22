const mongoose = require("mongoose");

/*
==================================
Workspace Member Schema
==================================
*/

const workspaceMemberSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        alias: {
            type: String,
            default: ""
        },
        role: {
            type: String,
            enum: ["owner", "admin", "member"],
            default: "member"
        },
        status: {
            type: String,
            enum: ["active", "pending", "declined", "removed"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

/*
==================================
Indexes
==================================
*/

workspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

/*
==================================
Export Model
==================================
*/

module.exports = mongoose.model("WorkspaceMember", workspaceMemberSchema);
