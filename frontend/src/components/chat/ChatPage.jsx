import { useState, useEffect, useRef } from "react";

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

    const [isTyping, setIsTyping] = useState(false);

    const chatBodyRef = useRef(null);

    // Auto Scroll

    useEffect(() => {

        if (chatBodyRef.current) {

            chatBodyRef.current.scrollTop =
                chatBodyRef.current.scrollHeight;

        }

    }, [messages, isTyping]);

    async function handleSend(message) {

        // Show User Message

        setMessages(prev => [

            ...prev,

            {

                sender: "user",

                text: message

            }

        ]);

        // Show Typing Indicator

        setIsTyping(true);

        try {

            const response = await sendMessage(message);

            setIsTyping(false);

            if (response.success) {

                // Empty AI Message

                setMessages(prev => [

                    ...prev,

                    {

                        sender: "ai",

                        text: ""

                    }

                ]);

                // Split into words

                const words = response.aiReply.split(" ");

                let currentText = "";

                words.forEach((word, index) => {

                    setTimeout(() => {

                        currentText +=
                            (index === 0 ? "" : " ") + word;

                        setMessages(prev => {

                            const updated = [...prev];

                            updated[updated.length - 1] = {

                                sender: "ai",

                                text: currentText

                            };

                            return updated;

                        });

                    }, index * 35);

                });

            }

            else {

                setMessages(prev => [

                    ...prev,

                    {

                        sender: "ai",

                        text: "❌ Unable to connect to AI."

                    }

                ]);

            }

        }

        catch {

            setIsTyping(false);

            setMessages(prev => [

                ...prev,

                {

                    sender: "ai",

                    text: "❌ Something went wrong."

                }

            ]);

        }

    }

    return (

        <div className="chat-page">

            <div className="chat-header">

                <h2>🤖 Enlivonex AI</h2>

                <p>
                    Your Local AI Assistant powered by ENLIVONEX AI HUB
                </p>

            </div>

            <div
                className="chat-body"
                ref={chatBodyRef}
            >

                {

                    messages.map((msg, index) => (

                        <ChatMessage

                            key={index}

                            sender={msg.sender}

                            text={msg.text}

                            streaming={

                                index === messages.length - 1 &&

                                msg.sender === "ai" &&

                                !isTyping

                            }

                        />

                    ))

                }

                {

                    isTyping && (

                        <div className="typing-message">

                            <div className="avatar ai-avatar">

                                🤖

                            </div>

                            <div className="typing-bubble">

                                <span></span>

                                <span></span>

                                <span></span>

                            </div>

                        </div>

                    )

                }

            </div>

            <ChatInput

                onSend={handleSend}

            />

        </div>

    );

}

export default ChatPage;