const mongoose = require("mongoose");
const projectService = require("../services/projectService");

function userId(req, res) {
    if (!req.user?.id) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: Authentication required."
        });
        return null;
    }
    return req.user.id;
}

function handleError(res, error) {
    const message = error?.message || "Unexpected Server Error";
    let status = 500;
    if (message.startsWith("Validation Error")) status = 400;
    else if (message.startsWith("Unauthorized")) status = 401;
    else if (message.startsWith("Forbidden")) status = 403;
    else if (message.startsWith("Not Found")) status = 404;
    else if (message.startsWith("Conflict")) status = 409;
    return res.status(status).json({ success: false, message });
}

function validId(value) {
    return Boolean(value && mongoose.Types.ObjectId.isValid(value));
}

exports.createProject = async (req, res) => {
    try {
        const requesterId = userId(req, res);
        if (!requesterId) return;
        const { workspaceId } = req.params;
        const { name, description } = req.body || {};
        if (!validId(workspaceId)) {
            return res.status(400).json({ success: false, message: "Validation Error: Invalid workspace ID format." });
        }
        const project = await projectService.createProject(workspaceId, requesterId, name, description);
        return res.status(201).json({ success: true, project });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.listProjects = async (req, res) => {
    try {
        const requesterId = userId(req, res);
        if (!requesterId) return;
        const { workspaceId } = req.params;
        if (!validId(workspaceId)) {
            return res.status(400).json({ success: false, message: "Validation Error: Invalid workspace ID format." });
        }
        const projects = await projectService.listProjects(workspaceId, requesterId);
        return res.json({ success: true, projects });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.getProject = async (req, res) => {
    try {
        const requesterId = userId(req, res);
        if (!requesterId) return;
        if (!validId(req.params.projectId)) {
            return res.status(400).json({ success: false, message: "Validation Error: Invalid project ID format." });
        }
        const project = await projectService.getProject(req.params.projectId, requesterId);
        return res.json({ success: true, project });
    } catch (error) {
        return handleError(res, error);
    }
};

exports.archiveProject = async (req, res) => {
    try {
        const requesterId = userId(req, res);
        if (!requesterId) return;
        if (!validId(req.params.projectId)) {
            return res.status(400).json({ success: false, message: "Validation Error: Invalid project ID format." });
        }
        const project = await projectService.archiveProject(req.params.projectId, requesterId);
        return res.json({ success: true, project });
    } catch (error) {
        return handleError(res, error);
    }
};
