const MODELS = require("../config/models");

const SIMPLE = [
    "hi", "hello", "hey", "thanks", "thank you",
    "what is", "who is", "where is", "when is",
    "define", "meaning", "translate", "summarize"
];

const COMPLEX = [
    "explain in detail",
    "deep dive",
    "architecture",
    "system design",
    "compare",
    "analyze",
    "analysis",
    "why does",
    "how does",
    "quantum",
    "machine learning",
    "artificial intelligence",
    "neural network",
    "algorithm",
    "derivation",
    "proof",
    "complex",
    "detailed"
];

const getChatModel = (id) =>
    MODELS.CHAT.find((m) => m.model === id);

function chooseModel(prompt, requestedModel = "auto") {
    const text = String(prompt || "").trim().toLowerCase();

    if (requestedModel !== "auto") {
        const manual = getChatModel(requestedModel);

        if (manual) {
            return {
                ...manual,
                reason: "User Selected"
            };
        }
    }

    const complex =
        COMPLEX.some((word) => text.includes(word)) ||
        text.length > 350 ||
        (text.includes("?") && text.length > 180);

    if (complex) {
        return {
            ...getChatModel("gemma3:4b"),
            reason: "Automatic: Complex question"
        };
    }

    return {
        ...getChatModel("qwen2.5:3b"),
        reason: "Automatic: Simple/normal question"
    };
}

function chooseCodeModel(requestedModel) {
    const availableModels = Array.isArray(MODELS.CODE)
        ? MODELS.CODE
        : [MODELS.CODE];

    const selected = availableModels.find(
        (model) => model.model === requestedModel
    ) || availableModels[0];

    return {
        ...selected,
        reason: requestedModel === selected.model
            ? "User Selected"
            : "Code Assistant Default"
    };
}

module.exports = {
    chooseModel,
    chooseCodeModel
};
