const express = require("express");
const { requireAuth } = require("../controllers/middleware/authMiddleware");
const projectController = require("../controllers/projectController");

const router = express.Router();

router.post("/workspaces/:workspaceId/projects", requireAuth, projectController.createProject);
router.get("/workspaces/:workspaceId/projects", requireAuth, projectController.listProjects);
router.get("/projects/:projectId", requireAuth, projectController.getProject);
router.delete("/projects/:projectId", requireAuth, projectController.archiveProject);

module.exports = router;
