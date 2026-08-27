const SYSTEM_PROMPT =
    require("../config/system prompt");

const {
    buildMemoryContext
} = require("./memoryService");

/*==================================
OLLAMA
==================================*/

const OLLAMA_URL =
    "http://127.0.0.1:11434/api/chat";

/*==================================
ALLOWED MODELS
==================================*/

const ALLOWED = new Set([
    "qwen2.5:3b",
    "gemma3:4b"
]);

/*==================================
ASK OLLAMA
==================================*/

async function askOllama(
    userPrompt,
    onChunk,
    model,
    sessionId
) {
    if (
        typeof userPrompt !== "string" ||
        !userPrompt.trim()
    ) {
        throw new Error(
            "Prompt cannot be empty."
        );
    }

    if (!ALLOWED.has(model)) {
        throw new Error(
            `Unauthorized chat model: ${model}`
        );
    }

    if (!sessionId) {
        throw new Error(
            "Session ID is required."
        );
    }

    /*==================================
    BUILD MONGODB MEMORY
    ==================================*/

    const memory =
        await buildMemoryContext(
            sessionId,
            userPrompt.trim()
        );

    /*==================================
    BUILD OLLAMA CONTEXT
    ==================================*/

    const messages = [
        {
            role: "system",
            content:
                SYSTEM_PROMPT
        },

        ...memory.messages,

        {
            role: "user",
            content:
                userPrompt.trim()
        }
    ];

    /*==================================
    MEMORY DEBUG
    ==================================*/

    console.log(
        `[Memory] Session=${sessionId} | ` +
        `Working=${memory.messages.length} | ` +
        `Recall=${memory.recalled} | ` +
        `Recalled=${memory.recalledMessages}`
    );

    /*==================================
    OLLAMA REQUEST
    ==================================*/

    const response =
        await fetch(
            OLLAMA_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    model,

                    messages,

                    stream: true,

                    options: {
                        temperature:
                            model ===
                            "gemma3:4b"
                                ? 0.6
                                : 0.7,

                        top_p: 0.9,

                        top_k: 40,

                        repeat_penalty: 1.1,

                        num_predict: 1024
                    }
                })
            }
        );

    /*==================================
    HTTP ERROR
    ==================================*/

    if (!response.ok) {
        throw new Error(
            `Ollama HTTP ${response.status}: ${await response.text()}`
        );
    }

    /*==================================
    STREAM VALIDATION
    ==================================*/

    if (!response.body) {
        throw new Error(
            "Ollama stream unavailable."
        );
    }

    /*==================================
    STREAM READER
    ==================================*/

    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder();

    let answer = "";

    let bufferedData = "";

    /*==================================
    PROCESS STREAM
    ==================================*/

    while (true) {
        const {
            done,
            value
        } = await reader.read();

        if (done) {
            break;
        }

        const chunk =
            decoder.decode(
                value,
                {
                    stream: true
                }
            );

        if (!chunk) {
            continue;
        }

        bufferedData += chunk;

        const lines =
            bufferedData.split("\n");

        bufferedData =
            lines.pop() || "";

        for (
            const line of lines
        ) {
            if (!line.trim()) {
                continue;
            }

            try {
                const json =
                    JSON.parse(line);

                const token =
                    json.message?.content;

                if (!token) {
                    continue;
                }

                answer += token;

                if (
                    typeof onChunk ===
                    "function"
                ) {
                    onChunk(token);
                }
            }
            catch (error) {
                /*
                Ignore malformed JSON
                fragments.
                */
            }
        }
    }

    /*==================================
    FLUSH DECODER
    ==================================*/

    const finalChunk =
        decoder.decode();

    if (finalChunk) {
        bufferedData += finalChunk;
    }

    /*==================================
    PROCESS FINAL BUFFER
    ==================================*/

    if (bufferedData.trim()) {
        try {
            const json =
                JSON.parse(
                    bufferedData.trim()
                );

            const token =
                json.message?.content;

            if (token) {
                answer += token;

                if (
                    typeof onChunk ===
                    "function"
                ) {
                    onChunk(token);
                }
            }
        }
        catch (error) {
            /*
            Ignore incomplete final JSON.
            */
        }
    }

    /*==================================
    EMPTY RESPONSE
    ==================================*/

    if (!answer.trim()) {
        throw new Error(
            "Ollama returned an empty response."
        );
    }

    return answer.trim();
}

/*==================================
EXPORT
==================================*/

module.exports = {
    askOllama
};