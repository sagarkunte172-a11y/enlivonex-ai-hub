/* ==================================
   Enlivonex AI Hub API Client
================================== */

/* ==================================
   API BASE URL

   IMPORTANT:
   Do NOT hardcode a Wi-Fi/LAN IP here.

   The frontend uses the same hostname
   through which the browser opened the
   React application.

   Examples:

   Frontend:
   http://localhost:3000
   API:
   http://localhost:5000/api

   Frontend:
   http://192.168.1.29:3000
   API:
   http://192.168.1.29:5000/api

   Frontend:
   http://192.168.43.204:3000
   API:
   http://192.168.43.204:5000/api
================================== */

const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    `${window.location.protocol}//${window.location.hostname}:5000/api`;


/* ==================================
   CHAT MODELS
================================== */

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


/* ==================================
   CODE ASSISTANT MODELS
================================== */

export const CODE_ASSISTANT_MODELS = {
    QWEN_7B: {
        id: "qwen2.5-coder:7b",
        name: "Qwen 2.5 Coder 7B"
    },

    QWEN_14B: {
        id: "qwen2.5-coder:14b-instruct",
        name: "Qwen 2.5 Coder 14B"
    }
};


/* ==================================
   AUTH TOKEN
================================== */

function getAuthToken() {
    return (
        localStorage.getItem("auth_token") ||
        localStorage.getItem("workspace_token") ||
        null
    );
}


/* ==================================
   API ERROR
================================== */

export class ApiError extends Error {
    constructor(
        message,
        status = 0,
        data = null
    ) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}


/* ==================================
   RESPONSE ERROR PARSER
================================== */

async function parseErrorResponse(response) {
    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    const message =
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`;

    return new ApiError(
        message,
        response.status,
        data
    );
}


/* ==================================
   API REQUEST
================================== */

async function apiRequest(
    url,
    options = {}
) {
    const headers = {
        ...(options.headers || {})
    };


    /* ==================================
       JWT AUTHENTICATION
    ================================== */

    const token = getAuthToken();

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }


    /* ==================================
       JSON CONTENT TYPE
    ================================== */

    if (
        options.body &&
        typeof options.body === "string" &&
        !headers["Content-Type"]
    ) {
        headers["Content-Type"] =
            "application/json";
    }


    /* ==================================
       FETCH REQUEST
    ================================== */

    let response;

    try {
        response = await fetch(
            `${API_BASE_URL}${url}`,
            {
                ...options,
                headers
            }
        );
    } catch (error) {
        throw new ApiError(
            "Unable to connect to Enlivonex AI backend.",
            0,
            null
        );
    }


    /* ==================================
       AUTH FAILURE
    ================================== */

    if (response.status === 401) {
        throw await parseErrorResponse(
            response
        );
    }


    /* ==================================
       OTHER API ERRORS
    ================================== */

    if (!response.ok) {
        throw await parseErrorResponse(
            response
        );
    }

    return response;
}


/* ==================================
   CHAT
================================== */

export async function sendMessage(
    message,
    onChunk,
    sessionId,
    selectedModel = "auto",
    signal
) {
    if (
        typeof message !== "string" ||
        !message.trim()
    ) {
        throw new ApiError(
            "Message cannot be empty.",
            400
        );
    }


    const allowedModels =
        Object.values(CHAT_MODELS)
            .map((chatModel) => chatModel.id);


    const model =
        allowedModels.includes(
            selectedModel
        )
            ? selectedModel
            : "auto";


    if (!sessionId) {
        throw new ApiError(
            "Session ID is required.",
            400
        );
    }


    const response =
        await apiRequest(
            "/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    message:
                        message.trim(),

                    sessionId,

                    model
                }),

                signal
            }
        );


    if (!response.body) {
        throw new ApiError(
            "Chat response stream unavailable.",
            response.status
        );
    }


    const modelInfo = {
        name:
            response.headers.get(
                "X-Model-Name"
            ) || "Unknown",

        id:
            response.headers.get(
                "X-Model-ID"
            ) || "unknown",

        reason:
            response.headers.get(
                "X-Model-Reason"
            ) || ""
    };


    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder();

    let answer = "";


    try {
        while (true) {
            const {
                done,
                value
            } = await reader.read();


            if (done) {
                break;
            }


            const chunk =
                decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );


            if (!chunk) {
                continue;
            }


            answer += chunk;


            if (
                typeof onChunk ===
                "function"
            ) {
                onChunk(
                    answer,
                    modelInfo
                );
            }
        }


        /* ==================================
           FLUSH TEXT DECODER
        ================================== */

        const finalChunk =
            decoder.decode();


        if (finalChunk) {
            answer += finalChunk;


            if (
                typeof onChunk ===
                "function"
            ) {
                onChunk(
                    answer,
                    modelInfo
                );
            }
        }

    } finally {
        try {
            reader.releaseLock();
        } catch {
            // Reader already released.
        }
    }


    return {
        success: true,
        answer,
        model: modelInfo
    };
}


/* ==================================
   GET PERSONAL SESSIONS
================================== */

export async function getSessions() {
    const response =
        await apiRequest(
            "/sessions"
        );

    return await response.json();
}


/* ==================================
   CREATE PERSONAL SESSION
================================== */

export async function createSession() {
    const response =
        await apiRequest(
            "/session/new",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    return await response.json();
}


/* ==================================
   SWITCH SESSION
================================== */

export async function switchSession(
    sessionId
) {
    if (!sessionId) {
        throw new ApiError(
            "Session ID is required.",
            400
        );
    }


    const response =
        await apiRequest(
            "/session/switch",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    sessionId
                })
            }
        );


    return await response.json();
}


/* ==================================
   DELETE SESSION
================================== */

export async function deleteSession(
    sessionId
) {
    if (!sessionId) {
        throw new ApiError(
            "Session ID is required.",
            400
        );
    }


    const response =
        await apiRequest(
            `/session/${encodeURIComponent(
                sessionId
            )}`,
            {
                method: "DELETE"
            }
        );


    return await response.json();
}


/* ==================================
   CODE ASSISTANT
================================== */

export async function sendCodeAssistant(
    prompt,
    onChunk,
    selectedModel = "qwen2.5-coder:7b",
    conversationId = null,
    signal
) {
    if (
        typeof prompt !== "string" ||
        !prompt.trim()
    ) {
        throw new ApiError(
            "Code Assistant prompt cannot be empty.",
            400
        );
    }


    /* ==================================
       VALIDATE CODE ASSISTANT MODEL
    ================================== */

    const allowedModels =
        Object.values(CODE_ASSISTANT_MODELS)
            .map((codeModel) => codeModel.id);


    const model =
        allowedModels.includes(
            selectedModel
        )
            ? selectedModel
            : CODE_ASSISTANT_MODELS.QWEN_7B.id;


    /* ==================================
       CODE ASSISTANT REQUEST
    ================================== */

    const response =
        await apiRequest(
            "/code-assistant",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    prompt:
                        prompt.trim(),

                    model,

                    conversationId
                }),

                signal
            }
        );


    if (!response.body) {
        throw new ApiError(
            "Code Assistant stream unavailable.",
            response.status
        );
    }


    /* ==================================
       MODEL INFORMATION

       IMPORTANT:
       Do NOT call this variable `model`
       because `model` is already the
       selected model above.
    ================================== */

    const modelInfo = {
        name:
            response.headers.get(
                "X-Model-Name"
            ) ||
            (
                model ===
                CODE_ASSISTANT_MODELS.QWEN_14B.id
                    ? "Qwen 2.5 Coder 14B"
                    : "Qwen 2.5 Coder 7B"
            ),

        id:
            response.headers.get(
                "X-Model-ID"
            ) ||
            model
    };


    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder();

    let answer = "";


    try {
        while (true) {
            const {
                done,
                value
            } = await reader.read();


            if (done) {
                break;
            }


            const chunk =
                decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );


            if (!chunk) {
                continue;
            }


            answer += chunk;


            if (
                typeof onChunk ===
                "function"
            ) {
                onChunk(
                    answer,
                    modelInfo
                );
            }
        }


        /* ==================================
           FLUSH TEXT DECODER
        ================================== */

        const finalChunk =
            decoder.decode();


        if (finalChunk) {
            answer += finalChunk;


            if (
                typeof onChunk ===
                "function"
            ) {
                onChunk(
                    answer,
                    modelInfo
                );
            }
        }

    } finally {
        try {
            reader.releaseLock();
        } catch {
            // Reader already released.
        }
    }


    return {
        success: true,
        answer,
        model: modelInfo
    };
}

export async function createCodeConversation(options = {}) {
    return apiRequest("/code-assistant/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options)
    }).then((response) => response.json());
}

export async function getCodeConversations({ scope = "mine", workspaceId, projectId } = {}) {
    const params = new URLSearchParams({ scope });
    if (workspaceId) params.set("workspaceId", workspaceId);
    if (projectId) params.set("projectId", projectId);
    return apiRequest(`/code-assistant/conversations?${params.toString()}`).then((response) => response.json());
}

export async function getCodeConversation(conversationId) {
    return apiRequest(`/code-assistant/conversations/${encodeURIComponent(conversationId)}`).then((response) => response.json());
}

export async function shareCodeConversation(conversationId, sharedWith, permission = "view") {
    return apiRequest(`/code-assistant/conversations/${encodeURIComponent(conversationId)}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sharedWith, permission })
    }).then((response) => response.json());
}
