/*
==================================
Chat Controller
MongoDB Version
==================================
*/

const { askOllama } = require("../services/ollamaService");
const { chooseModel } = require("../services/modelRouter");

const {
    saveMessage
} = require("../services/messageService");

const {
    updateLastMessage
} = require("../services/sessionService");

async function chatWithAI(req, res) {

    try {

        const { message, sessionId } = req.body;

        if (!message || !sessionId) {

            return res.status(400).json({

                success: false,

                message: "Message and Session ID required."

            });

        }

        const cleanMessage = message.trim();

        const selectedModel = chooseModel(cleanMessage);

        let aiReply = "";

        res.writeHead(200, {

            "Content-Type": "text/plain; charset=utf-8",

            "Transfer-Encoding": "chunked",

            "Cache-Control": "no-cache",

            "Connection": "keep-alive",

            "X-Model-Name": selectedModel.name,

            "X-Model-ID": selectedModel.model,

            "X-Model-Reason": selectedModel.reason

        });

        await askOllama(

            cleanMessage,

            (chunk) => {

                aiReply += chunk;

                res.write(chunk);

            }

        );

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

        /*
        ==================================
        Save AI Message
        ==================================
        */

        await saveMessage(

            sessionId,

            "assistant",

            aiReply,

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

            cleanMessage,

            selectedModel.model

        );

        res.end();

    }

    catch (err) {

        console.error(err);

        if (!res.headersSent) {

            res.status(500).json({

                success: false,

                message: "Internal Server Error"

            });

        }

    }

}

module.exports = {

    chatWithAI

};