const SYSTEM_PROMPT = require("../config/system prompt");

const {

    getActiveSessionId,
    getMessages

} = require("../memory/sessionManager");

const {

    chooseModel

} = require("./modelRouter");

const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";

async function askOllama(userPrompt, onChunk = null) {

    try {

        /*
        ==================================
        Active Session
        ==================================
        */

        const sessionId = getActiveSessionId();

        /*
        ==================================
        Select Best Model
        ==================================
        */

        const selectedModel = chooseModel(userPrompt);

        console.log("\n==================================");

        console.log("Session ID     :", sessionId);

        console.log("Selected Model :", selectedModel.name);

        console.log("Model ID       :", selectedModel.model);

        console.log("Reason         :", selectedModel.reason);

        console.log("==================================\n");

        /*
        ==================================
        Build Conversation
        ==================================
        */

        const messages = [

            {

                role: "system",

                content: SYSTEM_PROMPT

            },

            ...getMessages(sessionId),

            {

                role: "user",

                content: userPrompt

            }

        ];

        /*
        ==================================
        Send Request
        ==================================
        */

        const response = await fetch(OLLAMA_URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                model: selectedModel.model,

                messages,

                stream: true,

                options: {

                    temperature: 0.7,

                    top_p: 0.9,

                    top_k: 40,

                    repeat_penalty: 1.1,

                    num_predict: 1024

                }

            })

        });

        if (!response.ok) {

            throw new Error(`HTTP ${response.status}`);

        }

        /*
        ==================================
        Stream Response
        ==================================
        */

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        let completeResponse = "";

        while (true) {

            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value);

            const lines = chunk

                .split("\n")

                .filter(line => line.trim() !== "");

            for (const line of lines) {

                try {

                    const json = JSON.parse(line);

                    if (!json.message?.content) continue;

                    const token = json.message.content;

                    completeResponse += token;

                    process.stdout.write(token);

                    if (typeof onChunk === "function") {

                        onChunk(token);

                    }

                }

                catch {

                    // Ignore Invalid JSON

                }

            }

        }

        console.log("\n\n✅ Stream Finished.\n");

        return completeResponse.trim();

    }

    catch (error) {

        console.error("Ollama Chat Error:", error);

        throw error;

    }

}

module.exports = {

    askOllama

};