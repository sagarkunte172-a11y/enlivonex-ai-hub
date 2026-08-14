const {
    askCodeAssistant,
    CODE_MODEL
} = require("../services/codeAssistantService");

async function codeAssistant(req, res) {

    try {

        const { prompt } = req.body;

        if (!prompt || !prompt.trim()) {

            return res.status(400).json({

                success: false,
                message: "Code Assistant prompt is required."

            });

        }

        const cleanPrompt = prompt.trim();

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
                "Qwen 2.5 Coder 7B",

            "X-Model-ID":
                CODE_MODEL

        });

        await askCodeAssistant(

            cleanPrompt,

            (chunk) => {

                res.write(chunk);

            }

        );

        res.end();

    }

    catch (error) {

        console.error(
            "Code Assistant Error:",
            error
        );

        if (!res.headersSent) {

            return res.status(500).json({

                success: false,

                message:
                    "Code Assistant failed."

            });

        }

        res.end();

    }

}

module.exports = {
    codeAssistant
};