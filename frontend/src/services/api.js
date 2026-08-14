/*
==================================
API Configuration
==================================
*/

const API_BASE_URL =
    process.env.REACT_APP_API_URL || "/api";

/*
==================================
Common Request
==================================
*/

async function apiRequest(

    url,

    options = {}

) {

    try {

        const response = await fetch(

            `${API_BASE_URL}${url}`,

            options

        );

        return response;

    }

    catch (error) {

        console.error(error);

        throw error;

    }

}

/*
==================================
Send Message
==================================
*/

export async function sendMessage(

    message,

    onChunk,

    sessionId = null

) {

    try {

        const response = await apiRequest(

            "/chat",

            {

                method: "POST",

                headers: {

                    "Content-Type":

                        "application/json"

                },

                body: JSON.stringify({

                    message,

                    sessionId

                })

            }

        );

        if (!response.ok) {

            throw new Error(

                "Failed to connect."

            );

        }

        /*
        ==================================
        Model Information
        ==================================
        */

        const modelInfo = {

            name:

                response.headers.get(

                    "X-Model-Name"

                ) || "Unknown",

            id:

                response.headers.get(

                    "X-Model-ID"

                ) || "unknown",

            reason:

                response.headers.get(

                    "X-Model-Reason"

                ) || ""

        };

        /*
        ==================================
        Stream Reader
        ==================================
        */

        const reader =

            response.body.getReader();

        const decoder =

            new TextDecoder();

        let fullResponse = "";

        while (true) {

            const {

                done,

                value

            } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(

                value,

                {

                    stream: true

                }

            );

            fullResponse += chunk;

            if (

                typeof onChunk ===

                "function"

            ) {

                onChunk(

                    fullResponse,

                    modelInfo

                );

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

            aiReply:

                "❌ Unable to connect.",

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

    const response = await apiRequest(

        "/sessions"

    );

    return await response.json();

}

/*
==================================
Get Single Session
==================================
*/

export async function getSession(

    sessionId

) {

    const response = await apiRequest(

        `/session/${sessionId}`

    );

    return await response.json();

}

/*
==================================
Create Session
==================================
*/

export async function createSession() {

    const response = await apiRequest(

        "/session/new",

        {

            method: "POST"

        }

    );

    return await response.json();

}

/*
==================================
Switch Session
==================================
*/

export async function switchSession(

    sessionId

) {

    const response = await apiRequest(

        "/session/switch",

        {

            method: "POST",

            headers: {

                "Content-Type":

                    "application/json"

            },

            body: JSON.stringify({

                sessionId

            })

        }

    );

    return await response.json();

}

/*
==================================
Delete Session
==================================
*/

export async function deleteSession(

    sessionId

) {

    const response = await apiRequest(

        `/session/${sessionId}`,

        {

            method: "DELETE"

        }

    );

    return await response.json();

    
}
/*
==================================
Code Assistant
==================================
*/

export async function sendCodeAssistant(
    prompt,
    onChunk
) {

    try {

        const response = await apiRequest(
            "/code-assistant",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    prompt
                })
            }
        );

        if (!response.ok) {

            throw new Error(
                "Code Assistant connection failed."
            );

        }

        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder();

        let fullResponse = "";

        while (true) {

            const {
                done,
                value
            } = await reader.read();

            if (done) break;

            const chunk =
                decoder.decode(
                    value,
                    {
                        stream: true
                    }
                );

            fullResponse += chunk;

            if (
                typeof onChunk === "function"
            ) {

                onChunk(
                    fullResponse
                );

            }

        }

        return {

            success: true,

            answer: fullResponse,

            model: {
                name:
                    response.headers.get(
                        "X-Model-Name"
                    ) || "Qwen 2.5 Coder 7B",

                id:
                    response.headers.get(
                        "X-Model-ID"
                    ) || "qwen2.5-coder:7b"
            }

        };

    }

    catch (error) {

        console.error(
            "Code Assistant Error:",
            error
        );

        return {

            success: false,

            answer:
                "❌ Unable to connect to Qwen 2.5 Coder 7B.",

            model: {
                name: "Unknown",
                id: "unknown"
            }

        };

    }

}