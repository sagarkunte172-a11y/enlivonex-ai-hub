const mongoose = require("mongoose");
const Usage = require("../models/Usage");

function estimateTokens(value) {
    const text = String(value || "").trim();
    return text ? Math.max(1, Math.ceil(text.length / 4)) : 0;
}

async function recordWorkspaceUsage({
    workspaceId,
    userId,
    sessionId,
    model,
    input,
    output
}) {
    const inputTokens = estimateTokens(input);
    const outputTokens = estimateTokens(output);

    return Usage.create({
        workspaceId,
        userId,
        sessionId,
        model,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        tokensEstimated: true
    });
}

async function getWorkspaceUsage(workspaceId) {
    const workspaceObjectId =
        new mongoose.Types.ObjectId(workspaceId);

    const entries = await Usage.aggregate([
        {
            $match: {
                workspaceId: workspaceObjectId
            }
        },
        {
            $group: {
                _id: {
                    userId: "$userId",
                    model: "$model"
                },
                inputTokens: { $sum: "$inputTokens" },
                outputTokens: { $sum: "$outputTokens" },
                totalTokens: { $sum: "$totalTokens" },
                requests: { $sum: 1 }
            }
        },
        {
            $sort: {
                totalTokens: -1
            }
        }
    ]);

    return entries;
}

module.exports = {
    recordWorkspaceUsage,
    getWorkspaceUsage
};
