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


/*
==================================
Allowed Chat Models
==================================
*/

const ALLOWED = new Set([
    "auto",
    "qwen2.5:3b",
    "gemma3:4b"
]);


/*
==================================
Chat With AI
==================================
*/

async function chatWithAI(req, res) {

    try {

        /*
        ==================================
        Request Data
        ==================================
        */

        const {
            message,
            sessionId,
            model = "auto"
        } = req.body || {};


        /*
        ==================================
        Input Validation
        ==================================
        */

        if (
            !message?.trim() ||
            !sessionId
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Message and Session ID required."

            });

        }


        /*
        ==================================
        Trusted User Identity
        ==================================

        IMPORTANT:

        userId is NEVER taken from req.body.

        The authentication middleware has
        already verified the JWT and placed
        the trusted identity in req.user.id.
        */

        const userId = req.user.id;


        /*
        ==================================
        Session Access Validation
        ==================================

        This MUST happen before:

        - model selection
        - Ollama generation
        - message persistence
        - session updates
        */

        const access = await canAccessSession(
            userId,
            sessionId
        );


        if (!access.allowed) {

            return res.status(
                access.status
            ).json({

                success: false,

                message: access.message

            });

        }


        /*
        ==================================
        Model Validation
        ==================================
        */

        if (!ALLOWED.has(model)) {

            return res.status(400).json({

                success: false,

                message: "Invalid chat model."

            });

        }


        /*
        ==================================
        Clean Message
        ==================================
        */

        const cleanMessage =
            message.trim();


        /*
        ==================================
        Model Selection
        ==================================
        */

        const selected = chooseModel(
            cleanMessage,
            model
        );


        /*
        ==================================
        AI Response State
        ==================================
        */

        let aiReply = "";


        /*
        ==================================
        Start Streaming Response
        ==================================
        */

        res.writeHead(200, {

            "Content-Type":
                "text/plain; charset=utf-8",

            "Transfer-Encoding":
                "chunked",

            "Cache-Control":
                "no-cache",

            "Connection":
                "keep-alive",

            "X-Model-Name":
                selected.name,

            "X-Model-ID":
                selected.model,

            "X-Model-Reason":
                String(selected.reason)
                    .replace(
                        /[^\x20-\x7E]/g,
                        ""
                    )

        });


        /*
        ==================================
        Ollama Generation
        ==================================
        */

        await askOllama(

            cleanMessage,

            (chunk) => {

                aiReply += chunk;

                res.write(chunk);

            },

            selected.model

        );


        /*
        ==================================
        Persist User Message
        ==================================
        */

        await saveMessage(

            sessionId,

            "user",

            cleanMessage

        );


        /*
        ==================================
        Persist Assistant Message
        ==================================
        */

        await saveMessage(

            sessionId,

            "assistant",

            aiReply,

            {

                name:
                    selected.name,

                id:
                    selected.model,

                reason:
                    selected.reason

            }

        );


        /*
        ==================================
        Update Session Metadata
        ==================================
        */

        await updateLastMessage(

            sessionId,

            cleanMessage,

            selected.model

        );

        if (access.session.workspaceId) {

            try {

                await recordWorkspaceUsage({
                    workspaceId:
                        access.session.workspaceId,
                    userId,
                    sessionId,
                    model: selected.model,
                    input: cleanMessage,
                    output: aiReply
                });

            }

            catch (usageError) {

                console.error(
                    "Workspace Usage Error:",
                    usageError
                );
            }
        }


        /*
        ==================================
        Finish Streaming Response
        ==================================
        */

        res.end();

    } catch (error) {

        console.error(
            "Chat Controller Error:",
            error
        );


        /*
        ==================================
        Error Before Streaming
        ==================================
        */

        if (!res.headersSent) {

            return res.status(500).json({

                success: false,

                message:
                    "Unable to connect to Enlivonex AI."

            });

        }


        /*
        ==================================
        Error During Streaming
        ==================================
        */

        res.end();

    }

}


/*
==================================
Exports
==================================
*/

module.exports = {

    chatWithAI

};