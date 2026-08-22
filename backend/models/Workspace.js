const mongoose = require("mongoose");

/*
==================================
Workspace Schema
==================================
*/

const workspaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        inviteCode: {
            type: String,
            required: true,
            unique: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

/*
==================================
Export Model
==================================
*/

module.exports = mongoose.model("Workspace", workspaceSchema);
