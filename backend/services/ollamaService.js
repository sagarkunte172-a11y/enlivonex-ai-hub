const SYSTEM_PROMPT =
    require("../config/system prompt");

const {
    getActiveSessionId,
    getMessages
} = require("../memory/sessionManager");

const OLLAMA_URL =
    "http://127.0.0.1:11434/api/chat";

const ALLOWED = new Set([
    "qwen2.5:3b",
    "gemma3:4b"
]);

async function askOllama(
    userPrompt,
    onChunk,
    model
) {
    if (!userPrompt?.trim()) {
        throw new Error("Prompt cannot be empty.");
    }

    if (!ALLOWED.has(model)) {
        throw new Error(
            `Unauthorized chat model: ${model}`
        );
    }

    const sessionId = getActiveSessionId();

    const messages = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...(getMessages(sessionId) || []),
        {
            role: "user",
            content: userPrompt.trim()
        }
    ];

    const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            messages,
            stream: true,
            options: {
                temperature:
                    model === "gemma3:4b"
                        ? 0.6
                        : 0.7,
                top_p: 0.9,
                top_k: 40,
                repeat_penalty: 1.1,
                num_predict: 1024
            }
        })
    });

    if (!response.ok) {
        throw new Error(
            `Ollama HTTP ${response.status}: ${await response.text()}`
        );
    }

    if (!response.body) {
        throw new Error("Ollama stream unavailable.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let answer = "";

    while (true) {
        const { done, value } =
            await reader.read();

        if (done) break;

        const chunk =
            decoder.decode(value, {
                stream: true
            });

        for (const line of chunk.split("\n")) {
            if (!line.trim()) continue;

            try {
                const json = JSON.parse(line);
                const token = json.message?.content;

                if (!token) continue;

                answer += token;

                if (typeof onChunk === "function") {
                    onChunk(token);
                }
            } catch {
                // Ignore incomplete JSON lines.
            }
        }
    }

    if (!answer.trim()) {
        throw new Error(
            "Ollama returned an empty response."
        );
    }

    return answer.trim();
}

module.exports = {
    askOllama
};