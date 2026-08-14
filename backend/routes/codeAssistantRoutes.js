const express = require("express");

const {
    generateCodeSolution
} = require("../controllers/codeAssistantController");

const router = express.Router();

router.post(
    "/code-assistant",
    generateCodeSolution
);

module.exports = router;