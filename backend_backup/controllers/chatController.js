/*
==================================
Chat Controller
Enlivonex AI Hub
==================================
*/

const { askOllama } = require("../services/ollamaService");

const {

    saveMessage

} = require("../services/messageService");

const {

    updateLastMessage,

    getSessionById

} = require("../services/sessionService");

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

        const {

            message,
            sessionId

        } = req.body;

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

        if (!sessionId) {

            return res.status(400).json({

                success: false,

                message: "Session ID is required."

            });

        }

        /*
        ==================================
        Session Validation
        ==================================
        */

        const session = await getSessionById(sessionId);

        if (!session) {

            return res.status(404).json({

                success: false,

                message: "Session not found."

            });

        }

        /*
        ==================================
        Select Model
        ==================================
        */

        const selectedModel = chooseModel(cleanMessage);

        console.log("\n==================================");
        console.log("Session :", sessionId);
        console.log("Model   :", selectedModel.name);
        console.log("==================================\n");

        /*
        ==================================
        Save User Message
        ==================================
        */

        await saveMessage(

            sessionId,

            "user",

            cleanMessage

        );

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

            sessionId,

            cleanMessage,

            (chunk) => {

                completeAIResponse += chunk;

                res.write(chunk);

            }

        );

        completeAIResponse = completeAIResponse.trim();

        /*
        ==================================
        Save AI Message
        ==================================
        */

        await saveMessage(

            sessionId,

            "assistant",

            completeAIResponse,

            {

                name: selectedModel.name,

                id: selectedModel.model,

                reason: selectedModel.reason

            }

        );

        /*
        ==================================
        Update Session Preview
        ==================================
        */

        await updateLastMessage(

            sessionId,

            completeAIResponse,

            selectedModel.model

        );

        /*
        ==================================
        End Stream
        ==================================
        */

        res.end();

    }

    catch (error) {

        console.error("\nChat Controller Error\n");

        console.error(error);

        if (!res.headersSent) {

            return res.status(500).json({

                success: false,

                message: "Internal Server Error"

            });

        }

        try {

            res.end();

        }

        catch (_) {}

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