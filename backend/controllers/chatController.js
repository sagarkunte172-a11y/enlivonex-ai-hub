const {
    chooseModel
} = require("../services/modelRouter");

const {
    askOllama
} = require("../services/ollamaService");

const {
    saveMessage
} = require("../services/messageService");

const {
    updateLastMessage,
    canAccessSession
} = require("../services/sessionService");

const {
    recordWorkspaceUsage
} = require("../services/usageService");

/*==================================
ALLOWED CHAT MODELS
==================================*/

const ALLOWED = new Set([
    "auto",
    "qwen2.5:3b",
    "gemma3:4b"
]);

/*==================================
SAFE MODEL REASON
==================================*/

function sanitizeReason(
    reason
) {
    if (
        reason === null ||
        reason === undefined
    ) {
        return "";
    }

    return String(reason)
        .replace(
            /[^\x20-\x7E]/g,
            ""
        )
        .trim();
}

/*==================================
SAFE RESPONSE ERROR
==================================*/

function sendError(
    res,
    status,
    message
) {
    if (res.headersSent) {
        return false;
    }

    return res.status(status).json({
        success: false,
        message
    });
}

/*==================================
CHAT WITH AI
==================================*/

async function chatWithAI(
    req,
    res
) {
    let streamStarted = false;

    let clientDisconnected =
        false;

    let handleDisconnect =
        null;

    try {
        /*==================================
        REQUEST DATA
        ==================================*/

        const {
            message,
            sessionId,
            model = "auto"
        } = req.body || {};

        /*==================================
        INPUT VALIDATION
        ==================================*/

        if (
            typeof message !== "string" ||
            !message.trim()
        ) {
            return sendError(
                res,
                400,
                "Message is required."
            );
        }

        if (
            typeof sessionId !== "string" ||
            !sessionId.trim()
        ) {
            return sendError(
                res,
                400,
                "Session ID is required."
            );
        }

        /*==================================
        AUTHENTICATION
        ==================================*/

        const userId =
            req.user?.id
                ? String(req.user.id)
                : null;

        const isGuest =
            !userId;

        /*==================================
        CLEAN VALUES
        ==================================*/

        const cleanSessionId =
            sessionId.trim();

        const cleanMessage =
            message.trim();

        /*==================================
        SESSION ACCESS
        ==================================*/

        let access = null;

        if (!isGuest) {
            access =
                await canAccessSession(
                    userId,
                    cleanSessionId
                );

            if (
                !access ||
                !access.allowed
            ) {
                return sendError(
                    res,
                    access?.status || 403,
                    access?.message ||
                        "Forbidden: You do not have access to this session."
                );
            }

            if (access.shared && access.permission !== "edit") {
                return sendError(
                    res,
                    403,
                    "Forbidden: This shared session is view-only."
                );
            }
        }

        /*==================================
        MODEL VALIDATION
        ==================================*/

        if (
            typeof model !== "string" ||
            !ALLOWED.has(model)
        ) {
            return sendError(
                res,
                400,
                "Invalid chat model."
            );
        }

        /*==================================
        MODEL SELECTION
        ==================================*/

        let selected;

        try {
            selected =
                await chooseModel(
                    cleanMessage,
                    model
                );
        }
        catch (modelError) {
            console.error(
                "Model Selection Error:",
                modelError
            );

            return sendError(
                res,
                500,
                "Unable to select an AI model."
            );
        }

        if (
            !selected ||
            !selected.model
        ) {
            return sendError(
                res,
                500,
                "Unable to select an AI model."
            );
        }

        /*==================================
        MODEL INFORMATION
        ==================================*/

        const modelName =
            String(
                selected.name ||
                selected.model ||
                "Unknown"
            );

        const modelId =
            String(
                selected.model ||
                "unknown"
            );

        const modelReason =
            sanitizeReason(
                selected.reason
            );

        /*==================================
        AI RESPONSE
        ==================================*/

        let aiReply = "";

        /*==================================
        STREAM HEADERS
        ==================================*/

        res.writeHead(
            200,
            {
                "Content-Type":
                    "text/plain; charset=utf-8",

                "Transfer-Encoding":
                    "chunked",

                "Cache-Control":
                    "no-cache, no-store, must-revalidate",

                "Connection":
                    "keep-alive",

                "X-Model-Name":
                    modelName,

                "X-Model-ID":
                    modelId,

                "X-Model-Reason":
                    modelReason
            }
        );

        streamStarted = true;

        /*==================================
        CLIENT DISCONNECT
        ==================================*/

        handleDisconnect = () => {
            clientDisconnected =
                true;

            console.log(
                `Chat client disconnected. Session: ${cleanSessionId}`
            );
        };

        req.on(
            "close",
            handleDisconnect
        );

        /*==================================
        AI GENERATION

        MongoDB memory is handled
        inside ollamaService.
        ==================================*/

        await askOllama(
            cleanMessage,

            (chunk) => {
                if (
                    clientDisconnected ||
                    res.destroyed ||
                    res.writableEnded
                ) {
                    return;
                }

                if (
                    chunk === null ||
                    chunk === undefined
                ) {
                    return;
                }

                const text =
                    String(chunk);

                if (!text) {
                    return;
                }

                aiReply += text;

                try {
                    res.write(text);
                }
                catch (writeError) {
                    clientDisconnected =
                        true;

                    console.error(
                        "Chat Stream Write Error:",
                        writeError.message
                    );
                }
            },

            modelId,

            cleanSessionId
        );

        /*==================================
        VALIDATE AI RESPONSE
        ==================================*/

        aiReply =
            aiReply.trim();

        if (!aiReply) {
            console.error(
                "Chat Controller: Empty AI response."
            );

            if (
                !res.destroyed &&
                !res.writableEnded
            ) {
                res.end();
            }

            return;
        }

        /*==================================
        DATABASE PERSISTENCE

        Authenticated:
            Save user message
            Save assistant message

        Guest:
            Do not save.
        ==================================*/

        if (!isGuest) {
            try {
                await saveMessage(
                    cleanSessionId,
                    "user",
                    cleanMessage
                );

                await saveMessage(
                    cleanSessionId,
                    "assistant",
                    aiReply,
                    {
                        name:
                            modelName,

                        id:
                            modelId,

                        reason:
                            modelReason
                    }
                );

                await updateLastMessage(
                    cleanSessionId,
                    cleanMessage,
                    modelId
                );
            }
            catch (databaseError) {
                /*
                AI response already exists.

                Persistence failure should not
                destroy a successful response.
                */

                console.error(
                    "Chat Persistence Error:",
                    databaseError
                );
            }
        }

        /*==================================
        WORKSPACE USAGE
        ==================================*/

        if (
            !isGuest &&
            access?.session?.workspaceId
        ) {
            try {
                await recordWorkspaceUsage({
                    workspaceId:
                        access.session.workspaceId,

                    userId,

                    sessionId:
                        cleanSessionId,

                    model:
                        modelId,

                    input:
                        cleanMessage,

                    output:
                        aiReply
                });
            }
            catch (usageError) {
                /*
                Usage tracking must never
                break a successful AI response.
                */

                console.error(
                    "Workspace Usage Error:",
                    usageError
                );
            }
        }

        /*==================================
        FINISH STREAM
        ==================================*/

        if (
            !res.destroyed &&
            !res.writableEnded
        ) {
            res.end();
        }

        /*==================================
        CLEAN LISTENER
        ==================================*/

        if (handleDisconnect) {
            req.removeListener(
                "close",
                handleDisconnect
            );
        }
    }
    catch (error) {
        console.error(
            "Chat Controller Error:",
            error
        );

        /*==================================
        ERROR BEFORE STREAM
        ==================================*/

        if (!streamStarted) {
            const status =
                Number(error?.status) >= 400
                    ? error.status
                    : 500;

            return sendError(
                res,
                status,
                error?.message ||
                    "Unable to connect to Enlivonex AI."
            );
        }

        /*==================================
        ERROR AFTER STREAM
        ==================================*/

        try {
            if (
                !res.destroyed &&
                !res.writableEnded
            ) {
                res.end();
            }
        }
        catch (streamError) {
            console.error(
                "Chat Stream Close Error:",
                streamError
            );
        }

        /*==================================
        CLEAN LISTENER
        ==================================*/

        if (handleDisconnect) {
            req.removeListener(
                "close",
                handleDisconnect
            );
        }
    }
}

/*==================================
EXPORTS
==================================*/

module.exports = {
    chatWithAI
};
