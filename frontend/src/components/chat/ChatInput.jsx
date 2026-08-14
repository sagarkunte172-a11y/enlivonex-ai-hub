import { useState, useRef, useEffect } from "react";

import "./ChatInput.css";

function ChatInput({ onSend, disabled = false }) {

    const [message, setMessage] = useState("");

    const textareaRef = useRef(null);

    useEffect(() => {

        const el = textareaRef.current;

        if (!el) return;

        el.style.height = "auto";

        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;

    }, [message]);

    function handleSend() {

        if (!message.trim() || disabled) return;

        onSend(message);

        setMessage("");

    }

    return (

        <div className="chat-input-wrapper">

            <div className={`chat-input-container ${disabled ? "disabled" : ""}`}>

                <textarea

                    ref={textareaRef}

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

                    disabled={disabled}

                />

                <button

                    type="button"

                    onClick={handleSend}

                    disabled={disabled || !message.trim()}

                    aria-label="Send message"

                    className="send-btn"

                >

                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">

                        <path

                            d="M22 2L11 13"

                            stroke="currentColor"

                            strokeWidth="2"

                            strokeLinecap="round"

                            strokeLinejoin="round"

                        />

                        <path

                            d="M22 2L15 22L11 13L2 9L22 2Z"

                            stroke="currentColor"

                            strokeWidth="2"

                            strokeLinecap="round"

                            strokeLinejoin="round"

                        />

                    </svg>

                </button>

            </div>

            <p className="chat-input-hint">

                Enter to send · Shift+Enter for new line

            </p>

        </div>

    );

}

export default ChatInput;
