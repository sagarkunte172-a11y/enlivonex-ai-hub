// Use environment variable when provided, otherwise use relative '/api'
// during development the CRA dev server can proxy requests to the backend.
const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

/*
==================================
Send Message
==================================
*/

export async function sendMessage(message, onChunk, sessionId = null) {

    try {

        const response = await fetch(`${API_BASE_URL}/chat`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({
                message,
                sessionId
            })

        });

        if (!response.ok) {

            throw new Error("Failed to connect.");

        }

        /*
        ==================================
        Read Model Info
        ==================================
        */

        const modelInfo = {

            name:

                response.headers.get("X-Model-Name") ||

                "Unknown",

            id:

                response.headers.get("X-Model-ID") ||

                "unknown",

            reason:

                response.headers.get("X-Model-Reason") ||

                ""

        };

        /*
        ==================================
        Stream Response
        ==================================
        */

        const reader = response.body.getReader();

        const decoder = new TextDecoder();

        let fullResponse = "";

        while (true) {

            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value, {

                stream: true

            });

            fullResponse += chunk;

            if (typeof onChunk === "function") {

                // Pass modelInfo as second argument so UI can display model early
                onChunk(fullResponse, modelInfo);

            }

        }

        return {

            success: true,

            aiReply: fullResponse,

            model: modelInfo

        };

    }

    catch (error) {

        console.error(error);

        return {

            success: false,

            aiReply: "❌ Unable to connect.",

            model: {

                name: "Unknown",

                id: "unknown",

                reason: ""

            }

        };

    }

}

/*
==================================
Get All Sessions
==================================
*/

export async function getSessions() {

    const response = await fetch(`${API_BASE_URL}/sessions`);

    return await response.json();

}

/*
==================================
Create Session
==================================
*/

export async function createSession() {

    const response = await fetch(`${API_BASE_URL}/session/new`, {

        method: "POST"

    });

    return await response.json();

}

/*
==================================
Switch Session
==================================
*/

export async function switchSession(sessionId) {

    const response = await fetch(`${API_BASE_URL}/session/switch`, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            sessionId

        })

    });

    return await response.json();

}

/*
==================================
Get Single Session
==================================
*/

export async function getSession(sessionId) {

    const response = await fetch(

        `${API_BASE_URL}/session/${sessionId}`

    );

    return await response.json();

}

/*
==================================
Delete Session
==================================
*/

export async function deleteSession(sessionId) {

    const response = await fetch(

        `${API_BASE_URL}/session/${sessionId}`,

        {

            method: "DELETE"

        }

    );

    return await response.json();

}