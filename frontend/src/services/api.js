const API_BASE_URL = "http://192.168.43.204:5000/api";

export async function sendMessage(message) {

    try {

        const response = await fetch(`${API_BASE_URL}/chat`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });

        const data = await response.json();

        return data;

    } catch (error) {

        console.error("API Error:", error);

        return {

            success: false,
            message: "Unable to connect to Enlivonex AI."

        };

    }

}