const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";

const CODE_MODEL = "qwen2.5-coder:7b";

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
- Prefer practical, production-ready solutions.
- Keep explanations clear and useful.

If the user provides code, analyze the provided code carefully before answering.
`;

async function askCodeAssistant(userPrompt, onChunk = null) {

    const response = await fetch(OLLAMA_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            model: CODE_MODEL,

            messages: [

                {
                    role: "system",
                    content: CODE_SYSTEM_PROMPT
                },

                {
                    role: "user",
                    content: userPrompt
                }

            ],

            stream: true,

            options: {

                temperature: 0.2,
                top_p: 0.9,
                top_k: 40,
                repeat_penalty: 1.1,

                // Keep this lower initially because
                // your laptop has limited available RAM.
                num_predict: 1024

            }

        })

    });

    if (!response.ok) {

        throw new Error(
            `Ollama HTTP Error: ${response.status}`
        );

    }

    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder();

    let completeResponse = "";

    while (true) {

        const {
            done,
            value
        } = await reader.read();

        if (done) break;

        const chunk =
            decoder.decode(value, {
                stream: true
            });

        const lines =
            chunk
                .split("\n")
                .filter(line => line.trim() !== "");

        for (const line of lines) {

            try {

                const json =
                    JSON.parse(line);

                const token =
                    json.message?.content;

                if (!token) continue;

                completeResponse += token;

                if (
                    typeof onChunk === "function"
                ) {

                    onChunk(token);

                }

            }
            catch {

                // Ignore malformed/incomplete JSON chunks

            }

        }

    }

    return completeResponse.trim();

}

module.exports = {
    askCodeAssistant,
    CODE_MODEL
};