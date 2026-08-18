const API_BASE_URL =
    process.env.REACT_APP_API_URL || "/api";

export const CHAT_MODELS = {
    AUTO: {
        id: "auto",
        name: "Automatic"
    },
    QWEN: {
        id: "qwen2.5:3b",
        name: "Qwen 2.5 3B"
    },
    GEMMA: {
        id: "gemma3:4b",
        name: "Gemma 3 4B"
    }
};

async function apiRequest(url, options = {}) {
    return fetch(`${API_BASE_URL}${url}`, options);
}

export async function sendMessage(
    message,
    onChunk,
    sessionId,
    selectedModel = "auto",
    signal
) {
    const allowed = Object.values(CHAT_MODELS).map(m => m.id);
    const model = allowed.includes(selectedModel)
        ? selectedModel
        : "auto";

    const response = await apiRequest("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message,
            sessionId,
            model
        }),
        signal
    });

    if (!response.ok) {
        throw new Error(`Chat API Error: ${response.status}`);
    }

    if (!response.body) {
        throw new Error("Chat response stream unavailable.");
    }

    const modelInfo = {
        name: response.headers.get("X-Model-Name") || "Unknown",
        id: response.headers.get("X-Model-ID") || "unknown",
        reason: response.headers.get("X-Model-Reason") || ""
    };

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let answer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        answer += chunk;

        if (typeof onChunk === "function") {
            onChunk(answer, modelInfo);
        }
    }

    return {
        success: true,
        answer,
        model: modelInfo
    };
}

export async function getSessions() {
    try {
        const response = await apiRequest("/sessions");

        if (!response.ok) {
            throw new Error(`Sessions Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Get Sessions Error:", error);
        return {
            success: false,
            sessions: [],
            activeSession: null
        };
    }
}

export async function createSession() {
    try {
        const response = await apiRequest("/session/new", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Create Session Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Create Session Error:", error);
        return {
            success: false
        };
    }
}

export async function switchSession(sessionId) {
    try {
        const response = await apiRequest("/session/switch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ sessionId })
        });

        if (!response.ok) {
            throw new Error(`Switch Session Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Switch Session Error:", error);
        return {
            success: false,
            messages: []
        };
    }
}

export async function deleteSession(sessionId) {
    try {
        const response = await apiRequest(`/session/${sessionId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Delete Session Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Delete Session Error:", error);
        return {
            success: false
        };
    }
}

export async function sendCodeAssistant(prompt, onChunk) {
    try {
        const response = await apiRequest("/code-assistant", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            throw new Error(`Code Assistant Error: ${response.status}`);
        }

        if (!response.body) {
            throw new Error("Code Assistant stream unavailable.");
        }

        const model = {
            name:
                response.headers.get("X-Model-Name") ||
                "Qwen 2.5 Coder 7B",
            id:
                response.headers.get("X-Model-ID") ||
                "qwen2.5-coder:7b"
        };

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            answer += decoder.decode(value, { stream: true });

            if (typeof onChunk === "function") {
                onChunk(answer, model);
            }
        }

        return {
            success: true,
            answer,
            model
        };
    } catch (error) {
        console.error("Code Assistant Error:", error);

        return {
            success: false,
            answer: "❌ Unable to connect to Code Assistant.",
            model: {
                name: "Qwen 2.5 Coder 7B",
                id: "qwen2.5-coder:7b"
            }
        };
    }
}