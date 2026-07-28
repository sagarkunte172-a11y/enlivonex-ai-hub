/*
==================================
Chat Controller
Enlivonex AI Hub
==================================
*/

const { askOllama } = require("../services/ollamaService");

const {
    addUserMessage,
    addAIMessage,
    getActiveSessionId
} = require("../memory/sessionManager");

const {
    chooseModel
} = require("../services/modelRouter");

/*
==================================
Chat With AI
==================================
*/

async function chatWithAI(req, res) {

    try {

        const { message, sessionId: reqSessionId } = req.body;

        /*
        ==================================
        Validation
        ==================================
        */

        if (!message || typeof message !== "string") {

            return res.status(400).json({

                success: false,

                message: "A valid message is required."

            });

        }

        const cleanMessage = message.trim();

        if (!cleanMessage.length) {

            return res.status(400).json({

                success: false,

                message: "Message cannot be empty."

            });

        }

        /*
        ==================================
        Active Session
        ==================================
        */

        // Prefer sessionId from client, fallback to server active session
        const sessionId = reqSessionId || getActiveSessionId();

        /*
        ==================================
        Select Model
        ==================================
        */

        const selectedModel = chooseModel(cleanMessage);

        console.log("\n==================================");

        console.log("Session        :", sessionId);

        console.log("Selected Model :", selectedModel.name);

        console.log("Model ID       :", selectedModel.model);

        console.log("Reason         :", selectedModel.reason);

        console.log("==================================\n");

        let completeAIResponse = "";

        /*
        ==================================
        Streaming Headers
        ==================================
        */

        res.writeHead(200, {

            "Content-Type": "text/plain; charset=utf-8",

            "Transfer-Encoding": "chunked",

            "Cache-Control": "no-cache",

            "Connection": "keep-alive",

            "X-Accel-Buffering": "no",

            "X-Model-Name": selectedModel.name,

            "X-Model-ID": selectedModel.model,

            "X-Model-Reason": selectedModel.reason

        });

        /*
        ==================================
        Generate AI Response
        ==================================
        */


        await askOllama(
            cleanMessage,
            (chunk) => {
                completeAIResponse += chunk;
                res.write(chunk);
            }
        );

        /*
        ==================================
        Save Conversation
        ==================================
        */

        // Save user and AI messages with model metadata
        addUserMessage(sessionId, cleanMessage);
        addAIMessage(sessionId, completeAIResponse.trim(), selectedModel);

        /*
        ==================================
        End Stream
        ==================================
        */

        res.end();

    }

    catch (error) {

        console.error("Chat Controller Error:", error);

        if (!res.headersSent) {

            return res.status(500).json({

                success: false,

                message: "Internal Server Error"

            });

        }

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