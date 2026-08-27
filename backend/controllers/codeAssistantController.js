/*
==================================
Enlivonex Code Assistant Controller
==================================
*/

const {
    askCodeAssistant
} = require(
    "../services/codeAssistantService"
);

const {
    chooseCodeModel
} = require("../services/modelRouter");

const {
    canAccessSession,
    updateLastMessage
} = require("../services/sessionService");

const {
    saveMessage
} = require("../services/messageService");

const {
    recordWorkspaceUsage
} = require("../services/usageService");


/*
==================================
CODE ASSISTANT
==================================
*/

async function codeAssistant(
    req,
    res
) {

    try {

        const {
            prompt,
            model,
            sessionId
        } = req.body || {};

        const userId = req.user?.id
            ? String(req.user.id)
            : null;


        /*
        ==================================
        VALIDATION
        ==================================
        */

        if (
            typeof prompt !== "string" ||
            !prompt.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Code Assistant prompt is required."

            });

        }


        const cleanPrompt =
            prompt.trim();

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Authentication required."
            });
        }

        let access = null;

        if (sessionId !== undefined && sessionId !== null) {
            if (typeof sessionId !== "string" || !sessionId.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation Error: Invalid session ID."
                });
            }

            access = await canAccessSession(
                userId,
                sessionId.trim()
            );

            if (!access?.allowed) {
                return res.status(access?.status || 403).json({
                    success: false,
                    message: access?.message || "Forbidden: You cannot access this session."
                });
            }
        }

        const selectedModel = chooseCodeModel(model);


        /*
        ==================================
        STREAMING RESPONSE
        ==================================

        Do NOT manually choose the model
        here.

        codeAssistantService.js is the
        single source of truth for the
        Code Assistant model.
        ==================================
        */

        res.writeHead(
            200,
            {

                "Content-Type":
                    "text/plain; charset=utf-8",

                "Transfer-Encoding":
                    "chunked",

                "Cache-Control":
                    "no-cache, no-transform",

                "Connection":
                    "keep-alive",

                /*
                Safe static headers.

                Avoid undefined values and
                avoid dynamic reason strings
                inside HTTP headers.
                */

                "X-Model-Name":
                    selectedModel.name,

                "X-Model-ID":
                    selectedModel.model,

                "X-Model-Reason":
                    selectedModel.reason || "Code Assistant"

            }
        );


        /*
        ==================================
        ASK CODE ASSISTANT
        ==================================
        */

        const result = await askCodeAssistant(

            cleanPrompt,

            selectedModel,

            (chunk) => {

                if (
                    !res.writableEnded &&
                    typeof chunk === "string" &&
                    chunk.length > 0
                ) {

                    res.write(chunk);

                }

            }

        );

        if (access?.session) {
            const activeSessionId = access.session._id.toString();

            try {
                await saveMessage(activeSessionId, "user", cleanPrompt);
                await saveMessage(activeSessionId, "assistant", result.answer, {
                    name: selectedModel.name,
                    id: selectedModel.model,
                    reason: selectedModel.reason || "Code Assistant"
                });
                await updateLastMessage(
                    activeSessionId,
                    cleanPrompt,
                    selectedModel.model
                );

                if (access.session.workspaceId) {
                    await recordWorkspaceUsage({
                        workspaceId: access.session.workspaceId,
                        userId,
                        sessionId: activeSessionId,
                        model: selectedModel.model,
                        input: cleanPrompt,
                        output: result.answer
                    });
                }
            } catch (persistenceError) {
                console.error(
                    "Code Assistant Persistence Error:",
                    persistenceError.message
                );
            }
        }


        /*
        ==================================
        END RESPONSE
        ==================================
        */

        if (
            !res.writableEnded
        ) {

            res.end();

        }

    }

    catch (error) {

        console.error(
            "❌ Code Assistant Controller Error:",
            error.message
        );


        /*
        ==================================
        ERROR BEFORE RESPONSE STARTED
        ==================================
        */

        if (
            !res.headersSent
        ) {

            return res.status(500).json({

                success: false,

                message:
                    "Code Assistant failed.",

                error:
                    error.message

            });

        }


        /*
        ==================================
        STREAM ALREADY STARTED
        ==================================
        */

        if (
            !res.writableEnded
        ) {

            res.end();

        }

    }

}


/*
==================================
EXPORT
==================================
*/

module.exports = {

    codeAssistant

};
