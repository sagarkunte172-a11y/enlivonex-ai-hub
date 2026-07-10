import { useState } from "react";

import "./ChatInput.css";

function ChatInput({ onSend }) {

    const [message, setMessage] = useState("");

    function handleSend() {

        if (!message.trim()) return;

        onSend(message);

        setMessage("");

    }

    return (

        <div className="chat-input-container">

            <textarea

                placeholder="Ask Enlivonex AI anything..."

                value={message}

                onChange={(e) => setMessage(e.target.value)}

                onKeyDown={(e) => {

                    if (e.key === "Enter" && !e.shiftKey) {

                        e.preventDefault();

                        handleSend();

                    }

                }}

                rows="1"

            />

            <button onClick={handleSend}>

                Send

            </button>

        </div>

    );

}

export default ChatInput;