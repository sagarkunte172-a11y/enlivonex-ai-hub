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
            prompt
        } = req.body;


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
                    "Qwen 2.5 Coder 7B",

                "X-Model-ID":
                    "qwen2.5-coder:7b",

                "X-Model-Reason":
                    "Code Assistant"

            }
        );


        /*
        ==================================
        ASK CODE ASSISTANT
        ==================================
        */

        await askCodeAssistant(

            cleanPrompt,

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