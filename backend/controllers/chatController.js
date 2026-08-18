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
    updateLastMessage
} = require("../services/sessionService");

const ALLOWED = new Set([
    "auto",
    "qwen2.5:3b",
    "gemma3:4b"
]);

async function chatWithAI(req, res) {
    try {
        const {
            message,
            sessionId,
            model = "auto"
        } = req.body;

        if (!message?.trim() || !sessionId) {
            return res.status(400).json({
                success: false,
                message: "Message and Session ID required."
            });
        }

        if (!ALLOWED.has(model)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chat model."
            });
        }

        const cleanMessage = message.trim();
        const selected = chooseModel(
            cleanMessage,
            model
        );

        let aiReply = "";

        res.writeHead(200, {
            "Content-Type":
                "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Model-Name": selected.name,
            "X-Model-ID": selected.model,
            "X-Model-Reason":
                String(selected.reason)
                    .replace(/[^\x20-\x7E]/g, "")
        });

        await askOllama(
            cleanMessage,
            (chunk) => {
                aiReply += chunk;
                res.write(chunk);
            },
            selected.model
        );

        await saveMessage(
            sessionId,
            "user",
            cleanMessage
        );

        await saveMessage(
            sessionId,
            "assistant",
            aiReply,
            {
                name: selected.name,
                id: selected.model,
                reason: selected.reason
            }
        );

        await updateLastMessage(
            sessionId,
            cleanMessage,
            selected.model
        );

        res.end();
    } catch (error) {
        console.error(
            "Chat Controller Error:",
            error
        );

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message:
                    "Unable to connect to Enlivonex AI."
            });
        }

        res.end();
    }
}

module.exports = {
    chatWithAI
};