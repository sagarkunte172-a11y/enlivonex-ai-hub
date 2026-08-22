const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 1000
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["active", "archived"],
            default: "active"
        }
    },
    { timestamps: true }
);

projectSchema.index({ workspaceId: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
