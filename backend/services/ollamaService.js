const OLLAMA_URL = "http://localhost:11434/api/generate";

async function askOllama(prompt) {
    try {

        const response = await fetch(OLLAMA_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                model: "qwen2.5:3b",

                prompt: prompt,

                stream: false

            })

        });

        const data = await response.json();

        return data.response;

    } catch (error) {

        console.error("Ollama Error:", error);

        return "Failed to connect to Local AI.";

    }
}

module.exports = {
    askOllama
};