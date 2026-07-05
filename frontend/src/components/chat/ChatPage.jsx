import { useState } from "react";

import "./ChatPage.css";

import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";

import { sendMessage } from "../../services/api";

function ChatPage() {

    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "👋 Hello! I am Enlivonex AI. How can I help you today?"
        }
    ]);

    async function handleSend(message) {

        // Show user message immediately
        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                text: message
            }
        ]);

        // Send to backend
        const response = await sendMessage(message);

        // Show AI reply
        if (response.success) {

            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: response.aiReply
                }
            ]);

        } else {

            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: "❌ Unable to connect to AI."
                }
            ]);

        }

    }

    return (

        <div className="chat-page">

            <div className="chat-header">

                <h2>🤖 Enlivonex AI</h2>

                <p>Your Local AI Assistant powered by Qwen</p>

            </div>

            <div className="chat-body">

                {
                    messages.map((msg, index) => (

                        <ChatMessage
                            key={index}
                            sender={msg.sender}
                            text={msg.text}
                        />

                    ))
                }

            </div>

            <ChatInput onSend={handleSend} />

        </div>

    );

}

export default ChatPage;