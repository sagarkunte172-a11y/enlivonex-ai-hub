const Project = require("../models/Project");
const workspaceService = require("./workspaceService");

async function createProject(workspaceId, userId, name, description) {
    await workspaceService.requireWorkspaceMember(workspaceId, userId);

    if (typeof name !== "string" || !name.trim()) {
        throw new Error("Validation Error: Project name is required.");
    }

    return Project.create({
        workspaceId,
        createdBy: userId,
        name: name.trim(),
        description: typeof description === "string" ? description.trim() : ""
    });
}

async function listProjects(workspaceId, userId) {
    await workspaceService.requireWorkspaceMember(workspaceId, userId);
    return Project.find({ workspaceId, status: "active" })
        .sort({ updatedAt: -1 })
        .lean();
}

async function getProject(projectId, userId) {
    const project = await Project.findOne({
        _id: projectId,
        status: "active"
    });

    if (!project) {
        throw new Error("Not Found: Project not found.");
    }

    await workspaceService.requireWorkspaceMember(project.workspaceId, userId);
    return project;
}

async function archiveProject(projectId, userId) {
    const project = await getProject(projectId, userId);
    await workspaceService.requireWorkspaceAdmin(project.workspaceId, userId);
    project.status = "archived";
    await project.save();
    return project;
}

module.exports = {
    createProject,
    listProjects,
    getProject,
    archiveProject
};
