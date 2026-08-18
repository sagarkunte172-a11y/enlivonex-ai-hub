/*
==================================
Enlivonex Code Assistant Service
==================================

IMPORTANT:

Qwen 2.5 Coder 7B is ONLY used here.

It is NEVER used by normal
/api/chat.

The Code Assistant model comes
from modelRouter.js.
==================================
*/

const {
    chooseCodeModel
} = require("./modelRouter");


/*
==================================
OLLAMA
==================================
*/

const OLLAMA_URL =
    "http://127.0.0.1:11434/api/chat";


/*
==================================
CODE ASSISTANT SYSTEM PROMPT
==================================
*/

const CODE_SYSTEM_PROMPT = `
You are Enlivonex Code Assistant.

You are a specialized coding assistant.

Your job is to:

- Generate clean and correct code.
- Debug existing code.
- Explain errors clearly.
- Improve and optimize code when requested.
- Follow the user's requested programming language.
- Preserve existing architecture unless the user asks for a redesign.
- Do not invent files, APIs, libraries, or project details that were not provided.
- When debugging, identify the exact problem before suggesting a fix.
- Prefer practical and production-ready solutions.
- Keep explanations clear and useful.

If the user provides code, analyze the provided code carefully before answering.

When debugging:

1. Identify the exact bug.
2. Explain why it happens.
3. Provide the smallest reasonable fix.
4. Provide corrected code when useful.
5. Explain the important changes.

Do not claim that code was executed or tested unless execution results were actually provided.
`;


/*
==================================
ASK CODE ASSISTANT
==================================
*/

async function askCodeAssistant(
    userPrompt,
    onChunk = null
) {

    try {

        /*
        ==================================
        VALIDATE PROMPT
        ==================================
        */

        if (
            typeof userPrompt !== "string" ||
            !userPrompt.trim()
        ) {

            throw new Error(
                "Code Assistant prompt cannot be empty."
            );

        }

        const cleanPrompt =
            userPrompt.trim();


        /*
        ==================================
        GET CODE MODEL
        ==================================
        */

        const selectedModel =
            chooseCodeModel();


        /*
        ==================================
        MODEL VALIDATION
        ==================================
        */

        if (
            !selectedModel ||
            !selectedModel.model
        ) {

            throw new Error(
                "Code Assistant model is not configured."
            );

        }


        /*
        ==================================
        SECURITY CHECK
        ==================================

        Only Qwen 2.5 Coder 7B is allowed
        inside the Code Assistant.
        ==================================
        */

        if (
            selectedModel.model !==
            "qwen2.5-coder:7b"
        ) {

            throw new Error(
                `Invalid Code Assistant model: ${selectedModel.model}`
            );

        }


        /*
        ==================================
        LOG MODEL
        ==================================
        */

        console.log(
            "\n=================================="
        );

        console.log(
            "Enlivonex Code Assistant"
        );

        console.log(
            "Selected Model :",
            selectedModel.name
        );

        console.log(
            "Model ID       :",
            selectedModel.model
        );

        console.log(
            "Reason         :",
            selectedModel.reason || "Code Assistant"
        );

        console.log(
            "==================================\n"
        );


        /*
        ==================================
        OLLAMA REQUEST
        ==================================
        */

        let response;

        try {

            response = await fetch(
                OLLAMA_URL,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        model:
                            selectedModel.model,

                        messages: [

                            {
                                role: "system",

                                content:
                                    CODE_SYSTEM_PROMPT
                            },

                            {
                                role: "user",

                                content:
                                    cleanPrompt
                            }

                        ],

                        stream: true,

                        options: {

                            temperature: 0.2,

                            top_p: 0.9,

                            top_k: 40,

                            repeat_penalty: 1.1,

                            num_predict: 1024

                        }

                    })

                }
            );

        }

        catch (error) {

            throw new Error(
                `Unable to connect to Ollama at ${OLLAMA_URL}. ${error.message}`
            );

        }


        /*
        ==================================
        OLLAMA RESPONSE CHECK
        ==================================
        */

        if (!response.ok) {

            let errorText = "";

            try {

                errorText =
                    await response.text();

            }

            catch {

                errorText =
                    "Unable to read Ollama error response.";

            }

            throw new Error(
                `Ollama HTTP ${response.status}: ${errorText}`
            );

        }


        if (!response.body) {

            throw new Error(
                "Ollama response stream unavailable."
            );

        }


        /*
        ==================================
        READ STREAM
        ==================================

        IMPORTANT:

        Ollama sends newline-delimited JSON.

        A network chunk can split one JSON
        object in the middle.

        Therefore we keep incomplete
        data inside a buffer.
        ==================================
        */

        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder();

        let buffer = "";

        let completeResponse = "";


        /*
        ==================================
        PROCESS STREAM
        ==================================
        */

        while (true) {

            const {
                done,
                value
            } = await reader.read();


            /*
            ----------------------------------
            Add received bytes to buffer
            ----------------------------------
            */

            if (value) {

                buffer += decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );

            }


            /*
            ----------------------------------
            Process complete JSON lines
            ----------------------------------
            */

            const lines =
                buffer.split("\n");


            /*
            Keep the final incomplete line
            inside the buffer.
            */

            buffer =
                lines.pop() || "";


            for (
                const line of lines
            ) {

                const cleanLine =
                    line.trim();


                if (!cleanLine) {

                    continue;

                }


                try {

                    const json =
                        JSON.parse(cleanLine);


                    /*
                    --------------------------
                    Ollama error
                    --------------------------
                    */

                    if (json.error) {

                        throw new Error(
                            `Ollama error: ${json.error}`
                        );

                    }


                    /*
                    --------------------------
                    Normal response token
                    --------------------------
                    */

                    const token =
                        json.message?.content;


                    if (
                        typeof token !==
                        "string" ||
                        !token
                    ) {

                        continue;

                    }


                    completeResponse +=
                        token;


                    /*
                    Send token to controller
                    */

                    if (
                        typeof onChunk ===
                        "function"
                    ) {

                        onChunk(token);

                    }

                }

                catch (parseError) {

                    /*
                    JSON parsing errors are
                    ignored only for malformed
                    individual lines.

                    The incomplete network
                    chunk remains in buffer.
                    */

                    if (
                        parseError.message &&
                        parseError.message.startsWith(
                            "Ollama error:"
                        )
                    ) {

                        throw parseError;

                    }

                    console.warn(
                        "Code Assistant stream parse warning:",
                        parseError.message
                    );

                }

            }


            /*
            ----------------------------------
            Stream finished
            ----------------------------------
            */

            if (done) {

                break;

            }

        }


        /*
        ==================================
        PROCESS FINAL BUFFER
        ==================================
        */

        const finalLine =
            buffer.trim();


        if (finalLine) {

            try {

                const json =
                    JSON.parse(finalLine);


                if (json.error) {

                    throw new Error(
                        `Ollama error: ${json.error}`
                    );

                }


                const token =
                    json.message?.content;


                if (
                    typeof token ===
                    "string" &&
                    token
                ) {

                    completeResponse +=
                        token;


                    if (
                        typeof onChunk ===
                        "function"
                    ) {

                        onChunk(token);

                    }

                }

            }

            catch (error) {

                if (
                    error.message &&
                    error.message.startsWith(
                        "Ollama error:"
                    )
                ) {

                    throw error;

                }

            }

        }


        /*
        ==================================
        FINAL RESPONSE
        ==================================
        */

        const finalResponse =
            completeResponse.trim();


        if (!finalResponse) {

            throw new Error(
                "Code Assistant returned an empty response."
            );

        }


        console.log(
            "\n✅ Code Assistant stream finished.\n"
        );


        /*
        ==================================
        RETURN
        ==================================
        */

        return {

            answer:
                finalResponse,

            model:
                selectedModel

        };

    }

    catch (error) {

        console.error(
            "❌ Code Assistant Service Error:",
            error.message
        );

        throw error;

    }

}


/*
==================================
EXPORT
==================================
*/

module.exports = {

    askCodeAssistant

};