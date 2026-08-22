const mongoose = require("mongoose");

/*
==================================
Share Schema
==================================
*/

const shareSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true
        },
        resourceType: {
            type: String,
            enum: ["session", "message", "code", "file"],
            required: true
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        sharedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sharedWith: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        permission: {
            type: String,
            enum: ["view", "edit"],
            default: "view"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

/*
==================================
Indexes
==================================
*/
shareSchema.index({ workspaceId: 1, resourceType: 1, resourceId: 1 });
shareSchema.index({ workspaceId: 1, sharedWith: 1, isActive: 1 });

module.exports = mongoose.model("Share", shareSchema);
