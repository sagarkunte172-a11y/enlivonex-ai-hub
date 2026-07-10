const SYSTEM_PROMPT = require("../config/system prompt");

const OLLAMA_URL = "http://localhost:11434/api/generate";

const MODEL = process.env.AI_MODEL || "gemma3:4b";

async function askOllama(userPrompt) {

    try {

        const finalPrompt = `
${SYSTEM_PROMPT}

==================================================

Current Conversation

User:
${userPrompt}

Enlivonex AI:
`;

        const response = await fetch(OLLAMA_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                model: MODEL,

                prompt: finalPrompt,

                stream: false,

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

        const data = await response.json();

        return data.response?.trim() || "⚠️ No response generated.";

    }

    catch (error) {

        console.error("Ollama Error:", error);

        return "❌ Failed to connect to Enlivonex AI.";

    }

}

module.exports = {

    askOllama

};